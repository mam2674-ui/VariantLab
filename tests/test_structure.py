import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from variantlab.data_prep import REFERENCE_SEQUENCE
from variantlab.structure import (
    PDB_PATH,
    SECONDARY_STRUCTURE,
    domain_position_to_pdb_resnum,
    pdb_resnum_to_domain_position,
    secondary_structure_at,
)


def parse_pdb_seqres():
    three_to_one = {
        "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C", "GLN": "Q",
        "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I", "LEU": "L", "LYS": "K",
        "MET": "M", "PHE": "F", "PRO": "P", "SER": "S", "THR": "T", "TRP": "W",
        "TYR": "Y", "VAL": "V",
    }
    residues = {}
    for line in PDB_PATH.read_text().splitlines():
        if line.startswith("ATOM") and line[12:16].strip() == "CA":
            resnum = int(line[22:26])
            resname = line[17:20].strip()
            residues[resnum] = three_to_one[resname]
    return residues


def test_pdb_file_exists():
    assert PDB_PATH.exists()


def test_offset_matches_full_sequence_identity():
    pdb_residues = parse_pdb_seqres()
    mismatches = []
    for domain_pos in range(2, 56):
        pdb_resnum = domain_position_to_pdb_resnum(domain_pos)
        pdb_aa = pdb_residues[pdb_resnum]
        ref_aa = REFERENCE_SEQUENCE[domain_pos - 1]
        if pdb_aa != ref_aa:
            mismatches.append((domain_pos, pdb_resnum, pdb_aa, ref_aa))
    assert mismatches == [], f"unexpected mismatches beyond the known position-1 case: {mismatches}"


def test_position_1_is_the_known_flagged_mismatch():
    pdb_residues = parse_pdb_seqres()
    assert domain_position_to_pdb_resnum(1) is None
    # The crystallized construct's equivalent offset is Thr, not our Gln.
    assert pdb_residues[2] == "T"
    assert REFERENCE_SEQUENCE[0] == "Q"


def test_roundtrip_mapping():
    for domain_pos in range(2, 56):
        pdb_resnum = domain_position_to_pdb_resnum(domain_pos)
        assert pdb_resnum_to_domain_position(pdb_resnum) == domain_pos


def test_secondary_structure_covers_known_fold_elements():
    kinds = {el["kind"] for el in SECONDARY_STRUCTURE}
    assert kinds == {"strand", "helix"}
    assert sum(1 for el in SECONDARY_STRUCTURE if el["kind"] == "strand") == 4
    assert sum(1 for el in SECONDARY_STRUCTURE if el["kind"] == "helix") == 1


def test_secondary_structure_lookup():
    # Position 30 (our numbering) falls inside the alpha helix (domain 22-35).
    assert secondary_structure_at(30) == "helix"
    # Position 5 falls inside beta1 (domain 1-8).
    assert secondary_structure_at(5) == "strand"
