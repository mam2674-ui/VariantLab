"""Per-protein configuration. VariantLab supports more than one protein by
keeping every protein-specific fact (sequence, numbering offset, structure,
assay description) in one place per protein, rather than hardcoding GB1
throughout the pipeline.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

DATA_RAW = Path(__file__).resolve().parents[2] / "data" / "raw"
DATA_PROCESSED = Path(__file__).resolve().parents[2] / "data" / "processed"


@dataclass(frozen=True)
class SecondaryStructureElement:
    kind: str  # "helix" or "strand"
    name: str
    domain_range: tuple[int, int]
    source: str  # how this was determined, for honest provenance


@dataclass(frozen=True)
class ProteinConfig:
    slug: str
    display_name: str
    organism: str
    reference_sequence: str
    raw_dataset_path: Path
    processed_csv_path: Path
    predictions_csv_path: Path
    eval_results_path: Path
    precursor_offset: int  # domain_position = precursor_position - precursor_offset
    unmapped_domain_positions: frozenset[int]
    dms_id: str
    first_author: str
    year: int
    journal_citation: str
    assay_description: str
    assay_caveat: str
    structure_path: Path
    structure_source: str  # e.g. "PDB 1PGB, X-ray 1.92A" or "AlphaFold AF-P04147-F1 (predicted)"
    structure_is_predicted: bool
    structure_resnum_offset: int  # pdb_resnum = domain_position + structure_resnum_offset
    structure_unmapped_domain_positions: frozenset[int]
    secondary_structure: tuple[SecondaryStructureElement, ...]
    large_effect_cutoff: float
    large_effect_cutoff_source: str


GB1 = ProteinConfig(
    slug="gb1",
    display_name="GB1 (Streptococcal protein G, B1 domain)",
    organism="Streptococcus sp. group G",
    reference_sequence="QYKLILNGKTLKGETTTEAVDAATAEKVFKQYANDNGVDGEWTYDDATKTFTVTE",
    raw_dataset_path=DATA_RAW / "SPG1_STRSG_Olson_2014_full.parquet",
    processed_csv_path=DATA_PROCESSED / "gb1_single_mutants.csv",
    predictions_csv_path=DATA_PROCESSED / "predictions.csv",
    eval_results_path=DATA_PROCESSED / "eval_results.json",
    precursor_offset=227,
    unmapped_domain_positions=frozenset({1}),
    dms_id="SPG1_STRSG_Olson_2014",
    first_author="Olson",
    year=2014,
    journal_citation="Current Biology 24(22):2643-2651",
    assay_description=(
        "mRNA display selected for binding to the Fc region of human IgG"
    ),
    assay_caveat=(
        "Conflates folding stability with binding affinity — a low score could "
        "mean either, or both. Does not imply instability alone."
    ),
    structure_path=DATA_RAW / "structure" / "1PGB.pdb",
    structure_source="PDB 1PGB (Gallagher, Alexander, Bryan & Gilliland, 1994), X-ray, 1.92 Å",
    structure_is_predicted=False,
    structure_resnum_offset=1,
    structure_unmapped_domain_positions=frozenset({1}),
    secondary_structure=(
        SecondaryStructureElement("strand", "beta1", (1, 8), "1PGB SHEET record"),
        SecondaryStructureElement("strand", "beta2", (11, 19), "1PGB SHEET record"),
        SecondaryStructureElement("helix", "alpha1", (22, 35), "1PGB HELIX record"),
        SecondaryStructureElement("strand", "beta3", (41, 45), "1PGB SHEET record"),
        SecondaryStructureElement("strand", "beta4", (49, 55), "1PGB SHEET record"),
    ),
    large_effect_cutoff=-4.0,
    large_effect_cutoff_source="ProteinGym's documented manual binarization cutoff for this assay",
)

PAB1 = ProteinConfig(
    slug="pab1",
    display_name="Pab1 (poly(A)-binding protein, RRM2 domain)",
    organism="Saccharomyces cerevisiae",
    reference_sequence="GNIFIKNLHPDIDNKALYDTFSVFGDILSSKIATDENGKSKGFGFVHFEEEGAAKEAIDALNGMLLNGQEIYVAP",
    raw_dataset_path=DATA_RAW / "pab1" / "PABP_YEAST_Melamed_2013_full.parquet",
    processed_csv_path=DATA_PROCESSED / "pab1_single_mutants.csv",
    predictions_csv_path=DATA_PROCESSED / "pab1_predictions.csv",
    eval_results_path=DATA_PROCESSED / "pab1_eval_results.json",
    precursor_offset=125,
    unmapped_domain_positions=frozenset(),
    dms_id="PABP_YEAST_Melamed_2013",
    first_author="Melamed",
    year=2013,
    journal_citation="RNA 19(11):1537-1551",
    assay_description=(
        "Yeast growth complementation — a pab1-null strain's growth rate with "
        "each variant as the only copy of Pab1 (an essential gene)"
    ),
    assay_caveat=(
        "A whole-organism growth readout, not a direct biophysical measurement. "
        "Conflates folding, expression level, RNA-binding activity, and general "
        "proteostasis burden — a far more indirect assay than GB1's binding "
        "selection. Treat any single-mechanism interpretation with more caution "
        "here than for GB1."
    ),
    structure_path=DATA_RAW / "pab1" / "structure" / "AF-P04147-F1.pdb",
    structure_source="AlphaFold model AF-P04147-F1 (v6) — PREDICTED, not experimental",
    structure_is_predicted=True,
    structure_resnum_offset=125,
    structure_unmapped_domain_positions=frozenset(),
    secondary_structure=(
        SecondaryStructureElement("strand", "beta1", (2, 8), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("helix", "alpha1", (14, 24), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("strand", "beta2", (29, 35), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("strand", "beta3", (43, 48), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("helix", "alpha2", (51, 60), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("strand", "beta4", (62, 75), "phi/psi geometry (this project's own classifier, not DSSP)"),
    ),
    large_effect_cutoff=0.3,
    large_effect_cutoff_source="ProteinGym's documented manual binarization cutoff for this assay",
)

PROTEINS: dict[str, ProteinConfig] = {GB1.slug: GB1, PAB1.slug: PAB1}


def domain_position_to_structure_resnum(config: ProteinConfig, domain_position: int) -> int | None:
    if domain_position in config.structure_unmapped_domain_positions:
        return None
    return domain_position + config.structure_resnum_offset


def secondary_structure_at(config: ProteinConfig, domain_position: int) -> str:
    for el in config.secondary_structure:
        lo, hi = el.domain_range
        if lo <= domain_position <= hi:
            return el.kind
    return "loop"
