import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import pandas as pd
import pytest

from variantlab.data_prep import (
    PRECURSOR_OFFSET,
    REFERENCE_SEQUENCE,
    ParseReport,
    _parse_single_token,
    parse_and_validate,
)


def make_raw_row(mutant: str, dms_score=0.5):
    return {"mutant": mutant, "DMS_score": dms_score, "DMS_id": "SPG1_STRSG_Olson_2014",
            "target_seq": "x" * 448, "mutated_sequence": "x" * 448}


def test_parse_single_token_valid():
    assert _parse_single_token("Q228R") == ("Q", 228, "R")


def test_parse_single_token_rejects_malformed():
    assert _parse_single_token("Q228") is None
    assert _parse_single_token("228R") is None
    assert _parse_single_token("QR228") is None


def test_reference_sequence_position_1_is_Q():
    # Position 1 of the domain should be the first residue of REFERENCE_SEQUENCE.
    assert REFERENCE_SEQUENCE[0] == "Q"
    assert REFERENCE_SEQUENCE[-1] == "E"
    assert len(REFERENCE_SEQUENCE) == 55


def test_multi_mutation_excluded():
    raw = pd.DataFrame([make_raw_row("Q228R:T279L"), make_raw_row("Q228R")])
    clean, report = parse_and_validate(raw)
    assert len(clean) == 1
    assert report.n_multi_mutation_excluded == 1
    assert clean.iloc[0]["mutant_id"] == "Q1R"


def test_reference_mismatch_is_caught():
    # Position 228 in the precursor is Q (domain position 1). Claiming the
    # original residue was A instead should be rejected, not silently kept.
    raw = pd.DataFrame([make_raw_row("A228R")])
    clean, report = parse_and_validate(raw)
    assert len(clean) == 0
    assert report.n_reference_mismatch_excluded == 1


def test_out_of_domain_position_excluded():
    # Position 1 in precursor numbering is far outside the 228-282 GB1 domain.
    raw = pd.DataFrame([make_raw_row("M1K")])
    clean, report = parse_and_validate(raw)
    assert len(clean) == 0
    assert report.n_reference_mismatch_excluded == 1


def test_missing_score_excluded():
    raw = pd.DataFrame([make_raw_row("Q228R", dms_score=float("nan"))])
    clean, report = parse_and_validate(raw)
    assert len(clean) == 0
    assert report.n_missing_score_excluded == 1


def test_duplicate_detection():
    raw = pd.DataFrame([make_raw_row("Q228R"), make_raw_row("Q228R")])
    clean, report = parse_and_validate(raw)
    assert len(clean) == 1
    assert report.n_duplicate_rows == 1


def test_domain_position_remapping_matches_offset():
    raw = pd.DataFrame([make_raw_row("E282K")])  # last domain residue
    clean, report = parse_and_validate(raw)
    assert len(clean) == 1
    assert clean.iloc[0]["position"] == 55
    assert 282 - PRECURSOR_OFFSET == 55
