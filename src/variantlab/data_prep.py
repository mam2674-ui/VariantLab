"""Load, validate, and parse the GB1 (SPG1_STRSG_Olson_2014) deep mutational scan.

Source: ProteinGym DMS_substitutions, assay id SPG1_STRSG_Olson_2014, itself sourced
from Olson, Wu & Sun (2014) Current Biology 24(22):2643-2651. See
docs/dataset_provenance.md for the full verification trail.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

RAW_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "SPG1_STRSG_Olson_2014_full.parquet"
PROCESSED_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"

# GB1 domain, 1-55, verified against the independently-documented mavenn sequence
# (see docs/dataset_provenance.md). This is the numbering the whole project uses.
REFERENCE_SEQUENCE = "QYKLILNGKTLKGETTTEAVDAATAEKVFKQYANDNGVDGEWTYDDATKTFTVTE"

# The raw 'mutant' column numbers residues 228-282 within a 448-aa precursor
# construct used for the MSA step. We remap to domain numbering 1-55.
PRECURSOR_OFFSET = 227  # domain_position = precursor_position - PRECURSOR_OFFSET

MUTATION_TOKEN_RE = re.compile(r"^([A-Z])(\d+)([A-Z])$")

VALID_AA = set("ACDEFGHIKLMNPQRSTVWY")


@dataclass
class ParseReport:
    """Record of every row dropped and why, so nothing is silently lost."""

    n_input_rows: int = 0
    n_multi_mutation_excluded: int = 0
    n_unparseable_excluded: int = 0
    n_reference_mismatch_excluded: int = 0
    n_missing_score_excluded: int = 0
    n_duplicate_rows: int = 0
    n_final_rows: int = 0
    notes: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return self.__dict__.copy()


def load_raw() -> pd.DataFrame:
    """Load the preserved original file. Never mutated in place."""
    df = pd.read_parquet(RAW_PATH)
    return df


def _parse_single_token(token: str) -> tuple[str, int, str] | None:
    m = MUTATION_TOKEN_RE.match(token)
    if m is None:
        return None
    orig, pos_str, new = m.groups()
    return orig, int(pos_str), new


def parse_and_validate(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, ParseReport]:
    """Parse mutation strings, restrict to single substitutions, validate against
    the reference sequence, and record every exclusion with a reason.
    """
    report = ParseReport(n_input_rows=len(df_raw))

    # Step 1: single vs multi mutation. ProteinGym joins multiple substitutions
    # with ':'. V1 scope is single amino-acid substitutions only.
    is_single = ~df_raw["mutant"].str.contains(":")
    report.n_multi_mutation_excluded = int((~is_single).sum())
    df = df_raw.loc[is_single].copy()

    # Step 2: parse each single-mutation token into (orig, precursor_pos, new).
    parsed = df["mutant"].apply(_parse_single_token)
    unparseable = parsed.isna()
    report.n_unparseable_excluded = int(unparseable.sum())
    df = df.loc[~unparseable].copy()
    parsed = parsed.loc[~unparseable]

    df["orig_aa"] = parsed.apply(lambda t: t[0])
    df["precursor_position"] = parsed.apply(lambda t: t[1])
    df["new_aa"] = parsed.apply(lambda t: t[2])
    df["position"] = df["precursor_position"] - PRECURSOR_OFFSET

    # Step 3: reference-sequence check. Every orig_aa must match the reference
    # sequence at the remapped domain position. This is the check that would have
    # caught a wrong numbering offset or a stale reference sequence.
    in_domain = df["position"].between(1, len(REFERENCE_SEQUENCE))
    expected_aa = df["position"].apply(
        lambda p: REFERENCE_SEQUENCE[p - 1] if 1 <= p <= len(REFERENCE_SEQUENCE) else None
    )
    matches_reference = in_domain & (df["orig_aa"] == expected_aa)
    report.n_reference_mismatch_excluded = int((~matches_reference).sum())
    df = df.loc[matches_reference].copy()

    # Step 4: valid substitution amino acid (defends against non-standard codes).
    valid_new_aa = df["new_aa"].isin(VALID_AA)
    n_invalid_new = int((~valid_new_aa).sum())
    if n_invalid_new:
        report.notes.append(f"{n_invalid_new} rows excluded for non-standard new_aa")
    df = df.loc[valid_new_aa].copy()

    # Step 5: missing scores.
    missing_score = df["DMS_score"].isna()
    report.n_missing_score_excluded = int(missing_score.sum())
    df = df.loc[~missing_score].copy()

    # Step 6: duplicate substitutions (same orig+position+new seen more than once).
    # No replicate measurements exist for this assay (single pooled selection), so
    # a duplicate here would indicate a data error, not something to average over.
    df["mutant_id"] = df["orig_aa"] + df["position"].astype(str) + df["new_aa"]
    dup_mask = df.duplicated(subset="mutant_id", keep="first")
    report.n_duplicate_rows = int(dup_mask.sum())
    if report.n_duplicate_rows:
        report.notes.append(
            f"{report.n_duplicate_rows} duplicate mutant_id rows found and dropped "
            "(kept first occurrence); no replicate-averaging was performed because "
            "none exist in this assay."
        )
    df = df.loc[~dup_mask].copy()

    report.n_final_rows = len(df)
    report.notes.append(
        "No biological replicates exist for SPG1_STRSG_Olson_2014 (single pooled "
        "selection + sequencing); no aggregation across replicates was performed."
    )

    out_cols = ["mutant_id", "orig_aa", "position", "new_aa", "DMS_score", "mutant"]
    df = df[out_cols].rename(columns={"mutant": "raw_mutant_string", "DMS_score": "dms_score"})
    df = df.sort_values(["position", "new_aa"]).reset_index(drop=True)
    return df, report


def save_processed(df: pd.DataFrame, report: ParseReport) -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(PROCESSED_DIR / "gb1_single_mutants.csv", index=False)
    import json

    with open(PROCESSED_DIR / "parse_report.json", "w") as f:
        json.dump(report.as_dict(), f, indent=2)


def run() -> tuple[pd.DataFrame, ParseReport]:
    df_raw = load_raw()
    df_clean, report = parse_and_validate(df_raw)
    save_processed(df_clean, report)
    return df_clean, report


if __name__ == "__main__":
    df_clean, report = run()
    print(f"Input rows:            {report.n_input_rows}")
    print(f"Excluded (multi-mut):  {report.n_multi_mutation_excluded}")
    print(f"Excluded (unparseable):{report.n_unparseable_excluded}")
    print(f"Excluded (ref mismatch):{report.n_reference_mismatch_excluded}")
    print(f"Excluded (missing score):{report.n_missing_score_excluded}")
    print(f"Duplicates dropped:     {report.n_duplicate_rows}")
    print(f"Final single-mutant rows: {report.n_final_rows}")
    print(f"Expected (55 positions x 19 subs): {55 * 19}")
    for note in report.notes:
        print("NOTE:", note)
