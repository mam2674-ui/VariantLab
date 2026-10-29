"""The verified GB1 crystal structure and its mapping onto this project's
domain numbering (1-55).

Structure: PDB 1PGB (Gallagher, Alexander, Bryan & Gilliland, 1994,
Biochemistry 33:4721-4729 — the same paper Olson et al. 2014 cites for GB1's
structure). X-ray, 1.92 A, chain A, 56 residues, no missing residues.

Verified residue mapping (see docs/structure_provenance.md for the full
check): PDB chain A residues 3-56 (MTY... numbering) are identical, residue
for residue, to this project's domain positions 2-55. PDB residue 1 (MET) is
an N-terminal expression-tag residue with no equivalent in our domain.
Domain position 1 (GLN) has no identical counterpart in the crystallized
construct, which has THR at the equivalent offset — a known, flagged
N-terminal construct difference, not a numbering bug.
"""
from __future__ import annotations

from pathlib import Path

PDB_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "structure" / "1PGB.pdb"

# domain_position = pdb_resnum - 1, verified for pdb_resnum 3-56 (domain 2-55).
# Domain position 1 has no verified identity match in this structure.
PDB_RESNUM_OFFSET = 1
UNMAPPED_DOMAIN_POSITIONS = {1}

# Secondary structure, read directly from 1PGB's own HELIX/SHEET records
# (not guessed from literature), translated to domain numbering via the
# offset above. Order is N-to-C along the chain.
SECONDARY_STRUCTURE = [
    {"kind": "strand", "name": "beta1", "pdb_range": (1, 9), "domain_range": (1, 8)},
    {"kind": "strand", "name": "beta2", "pdb_range": (12, 20), "domain_range": (11, 19)},
    {"kind": "helix", "name": "alpha1", "pdb_range": (23, 36), "domain_range": (22, 35)},
    {"kind": "strand", "name": "beta3", "pdb_range": (42, 46), "domain_range": (41, 45)},
    {"kind": "strand", "name": "beta4", "pdb_range": (50, 56), "domain_range": (49, 55)},
]


def domain_position_to_pdb_resnum(domain_position: int) -> int | None:
    if domain_position in UNMAPPED_DOMAIN_POSITIONS:
        return None
    return domain_position + PDB_RESNUM_OFFSET


def pdb_resnum_to_domain_position(pdb_resnum: int) -> int | None:
    domain_position = pdb_resnum - PDB_RESNUM_OFFSET
    if domain_position < 1 or domain_position > 55 or domain_position in UNMAPPED_DOMAIN_POSITIONS:
        return None
    return domain_position


def secondary_structure_at(domain_position: int) -> str:
    for el in SECONDARY_STRUCTURE:
        lo, hi = el["domain_range"]
        if lo <= domain_position <= hi:
            return el["kind"]
    return "loop"


def load_pdb_text() -> str:
    return PDB_PATH.read_text()
