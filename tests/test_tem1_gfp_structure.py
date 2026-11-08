import sys
import warnings
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from variantlab.proteins import GFP, TEM1, domain_position_to_structure_resnum, secondary_structure_at

warnings.filterwarnings("ignore")

THREE_TO_ONE = {
    "ALA": "A", "ARG": "R", "ASN": "N", "ASP": "D", "CYS": "C", "GLN": "Q",
    "GLU": "E", "GLY": "G", "HIS": "H", "ILE": "I", "LEU": "L", "LYS": "K",
    "MET": "M", "PHE": "F", "PRO": "P", "SER": "S", "THR": "T", "TRP": "W",
    "TYR": "Y", "VAL": "V", "MSE": "M",
}


def _load_chain(path):
    from Bio.PDB import PDBParser

    parser = PDBParser(QUIET=True)
    structure = parser.get_structure("x", path)
    return structure[0]["A"]


# ---------------------------------------------------------------- TEM-1 ----

def test_tem1_structure_file_exists():
    assert TEM1.structure_path.exists()


def test_tem1_structure_is_experimental():
    assert TEM1.structure_is_predicted is False
    assert "X-ray" in TEM1.structure_source


def test_tem1_uses_explicit_resnum_map():
    # TEM-1's Ambler numbering (insertion codes, skipped numbers) cannot be
    # expressed as a linear offset -- confirms the right code path is used.
    assert TEM1.structure_resnum_map is not None
    assert len(TEM1.structure_resnum_map) == len(TEM1.reference_sequence)


def test_tem1_full_sequence_identity_against_reference():
    chain = _load_chain(TEM1.structure_path)
    mismatches = []
    for domain_pos in range(1, len(TEM1.reference_sequence) + 1):
        resnum = domain_position_to_structure_resnum(TEM1, domain_pos)
        assert resnum is not None, f"domain position {domain_pos} unexpectedly unmapped"
        # Ambler insertion codes (e.g. "51A") need the raw PDB resnum/icode split.
        if resnum[-1].isalpha():
            resnum_int, icode = int(resnum[:-1]), resnum[-1]
        else:
            resnum_int, icode = int(resnum), " "
        res = chain[(" ", resnum_int, icode)]
        pdb_aa = THREE_TO_ONE[res.get_resname()]
        ref_aa = TEM1.reference_sequence[domain_pos - 1]
        if pdb_aa != ref_aa:
            mismatches.append((domain_pos, resnum, pdb_aa, ref_aa))
    assert mismatches == [], f"unexpected mismatches: {mismatches}"


def test_tem1_secondary_structure_has_both_domains():
    # Class A beta-lactamases have a mixed alpha-helical domain and an
    # alpha/beta domain -- expect a real mix of both kinds, not all one.
    kinds = [el.kind for el in TEM1.secondary_structure]
    assert kinds.count("helix") >= 5
    assert kinds.count("strand") >= 3


# ------------------------------------------------------------------ GFP ----

def test_gfp_structure_file_exists():
    assert GFP.structure_path.exists()


def test_gfp_structure_is_experimental():
    assert GFP.structure_is_predicted is False
    assert "X-ray" in GFP.structure_source


def test_gfp_chromophore_positions_point_to_merged_group():
    # Ser65-Tyr66-Gly67 autocatalytically cyclize into one PDB group (CRO)
    # in a real crystal structure -- all three domain positions should
    # resolve to that same merged residue, not three separate ones.
    r63 = domain_position_to_structure_resnum(GFP, 63)
    r64 = domain_position_to_structure_resnum(GFP, 64)
    r65 = domain_position_to_structure_resnum(GFP, 65)
    assert r63 == r64 == r65 == "66"


def test_gfp_known_variant_mismatches_are_excluded_not_silently_wrong():
    # 1EMA carries F64L and Q80R relative to the wild-type sequence this
    # project's DMS dataset assays -- these must be explicitly unmapped,
    # never silently mapped onto a residue with a different identity.
    assert 62 in GFP.structure_unmapped_domain_positions
    assert 78 in GFP.structure_unmapped_domain_positions
    assert domain_position_to_structure_resnum(GFP, 62) is None
    assert domain_position_to_structure_resnum(GFP, 78) is None


def test_gfp_full_sequence_identity_against_reference_excluding_known_gaps():
    chain = _load_chain(GFP.structure_path)
    mismatches = []
    checked = 0
    for domain_pos in range(1, len(GFP.reference_sequence) + 1):
        resnum = domain_position_to_structure_resnum(GFP, domain_pos)
        if resnum is None:
            continue  # chromophore, disorder, or a documented variant gap
        if domain_pos in (63, 64, 65):
            continue  # merged chromophore group has no single-residue identity to check
        res = chain[(" ", int(resnum), " ")]
        resname = res.get_resname()
        if resname not in THREE_TO_ONE:
            continue
        pdb_aa = THREE_TO_ONE[resname]
        ref_aa = GFP.reference_sequence[domain_pos - 1]
        checked += 1
        if pdb_aa != ref_aa:
            mismatches.append((domain_pos, resnum, pdb_aa, ref_aa))
    assert mismatches == [], f"unexpected mismatches: {mismatches}"
    assert checked > 150, "sanity check: should have verified most of the domain"


def test_gfp_secondary_structure_is_the_eleven_stranded_barrel():
    # GFP's defining fold: an 11-stranded beta-barrel with one central helix.
    strand_count = sum(1 for el in GFP.secondary_structure if el.kind == "strand")
    helix_count = sum(1 for el in GFP.secondary_structure if el.kind == "helix")
    assert strand_count == 11
    assert helix_count >= 1


def test_secondary_structure_lookup_both():
    assert secondary_structure_at(TEM1, 10) == "helix"
    assert secondary_structure_at(GFP, 15) == "strand"
