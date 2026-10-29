import sys
import warnings
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from variantlab.proteins import PAB1, domain_position_to_structure_resnum, secondary_structure_at

warnings.filterwarnings("ignore")

THREE_TO_ONE = {
    "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C", "GLN": "Q",
    "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I", "LEU": "L", "LYS": "K",
    "MET": "M", "PHE": "F", "PRO": "P", "SER": "S", "THR": "T", "TRP": "W",
    "TYR": "Y", "VAL": "V",
}


def _load_chain():
    from Bio.PDB import PDBParser

    parser = PDBParser(QUIET=True)
    structure = parser.get_structure("pab1", PAB1.structure_path)
    return structure[0]["A"]


def test_structure_file_exists():
    assert PAB1.structure_path.exists()


def test_structure_is_labeled_predicted():
    # This is an AlphaFold model, not an experimental structure -- the
    # whole point of Section 9's "experimentally determined or predicted"
    # requirement is that this distinction is never silently dropped.
    assert PAB1.structure_is_predicted is True
    assert "AlphaFold" in PAB1.structure_source
    assert "PREDICTED" in PAB1.structure_source.upper()


def test_full_sequence_identity_against_reference():
    chain = _load_chain()
    mismatches = []
    for domain_pos in range(1, len(PAB1.reference_sequence) + 1):
        resnum = domain_position_to_structure_resnum(PAB1, domain_pos)
        pdb_aa = THREE_TO_ONE[chain[resnum].get_resname()]
        ref_aa = PAB1.reference_sequence[domain_pos - 1]
        if pdb_aa != ref_aa:
            mismatches.append((domain_pos, resnum, pdb_aa, ref_aa))
    assert mismatches == [], f"unexpected mismatches: {mismatches}"


def test_no_unmapped_positions():
    # Unlike GB1 (one N-terminal construct mismatch), the AlphaFold model's
    # sequence matches the DMS dataset's target_seq exactly -- no gaps.
    assert PAB1.unmapped_domain_positions == frozenset()
    assert PAB1.structure_unmapped_domain_positions == frozenset()


def test_secondary_structure_matches_canonical_rrm_fold():
    kinds = [el.kind for el in PAB1.secondary_structure]
    assert kinds.count("strand") == 4
    assert kinds.count("helix") == 2
    # Canonical RRM topology: beta1-alpha1-beta2-beta3-alpha2-beta4
    assert kinds == ["strand", "helix", "strand", "strand", "helix", "strand"]


def test_secondary_structure_lookup():
    assert secondary_structure_at(PAB1, 5) == "strand"   # beta1 (2-8)
    assert secondary_structure_at(PAB1, 18) == "helix"   # alpha1 (14-24)
    assert secondary_structure_at(PAB1, 1) == "loop"      # before beta1 starts
