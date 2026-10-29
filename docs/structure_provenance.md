# Structure Provenance (Section 9 — structural extension)

## Structure source

- **PDB ID:** 1PGB
- **Title:** "Two Crystal Structures of the B1 Immunoglobulin-Binding Domain
  of Streptococcal Protein G and Comparison with NMR"
- **Authors:** Gallagher T, Alexander P, Bryan P, Gilliland GL
- **Journal:** Biochemistry 33(16):4721-4729, 1994. PMID 8161530.
  DOI: 10.1021/bi00181a032.
- **This is the exact paper Olson et al. (2014) cite** for GB1's structure
  in their own reference list — not an independently chosen structure.
- **Method:** X-ray diffraction, 1.92 A resolution.
- **Experimentally determined**, not predicted (no AlphaFold model used).
- Downloaded 2026-10-28 from `https://files.rcsb.org/download/1PGB.pdb`,
  saved immutably at `data/raw/structure/1PGB.pdb`.
- A companion crystal form from the same paper, **1PGA** (2.07 A), was also
  downloaded (`data/raw/structure/1PGA_alt_crystal_form.pdb`) and is not
  used for rendering — kept only as a cross-check (see below).

## Chain and completeness

- Chain A, 56 residues, **no missing residues** (`REMARK 465` is empty).
- Only heteroatom present: water (`HOH`) — no bound ligand to account for.

## Sequence alignment and residue numbering (verified, not assumed)

The PDB SEQRES for chain A is 56 residues: `MTYKLILNGKTLKGETTTEAVDAATAEK
VFKQYANDNGVDGEWTYDDATKTFTVTE`. This project's 55-residue domain reference
(`REFERENCE_SEQUENCE` in `src/variantlab/data_prep.py`, independently
verified in `docs/dataset_provenance.md`) is `QYKLILNGKTLKGETTTEAVDAATAEKV
FKQYANDNGVDGEWTYDDATKTFTVTE`.

Programmatic comparison (`tests/test_structure.py`) confirms:

- **PDB residues 3-56 are identical, residue for residue, to domain
  positions 2-55** (54/54 exact match — not a fuzzy alignment).
- **Domain position 1 (Gln) has no identical match in the crystallized
  construct.** The crystallized construct has Thr at the equivalent offset
  (PDB residue 2), preceded by an N-terminal Met (PDB residue 1) that has no
  equivalent at all in the assayed construct. This is a known, minor
  N-terminal expression-tag/cloning difference between the Bryan-lab
  crystallization construct (Gallagher et al. 1994) and the construct Olson
  et al. (2014) assayed — not a numbering error. 1PGA and 2GB1 (the
  companion crystal form and the NMR structure from the same research
  program) carry the identical M-T-Y... N-terminus, confirming this is a
  consistent feature of that construct family, not noise in one deposition.
- **Mapping used throughout this project:** `pdb_resnum = domain_position +
  1`, valid and verified for domain positions 2-55. **Domain position 1 is
  excluded from all structural mapping/coloring** rather than silently
  mapped onto a non-identical residue — see `UNMAPPED_DOMAIN_POSITIONS` in
  `src/variantlab/structure.py`.

## Secondary structure (read from the structure, not guessed)

1PGB's own `HELIX`/`SHEET` PDB records (written by the original
crystallographers) were translated through the verified offset above:

| Element | PDB residues | Domain positions |
|---|---|---|
| β-strand 1 | 1-9 | 1-8 |
| β-strand 2 | 12-20 | 11-19 |
| α-helix | 23-36 | 22-35 |
| β-strand 3 | 42-46 | 41-45 |
| β-strand 4 | 50-56 | 49-55 |

This is GB1's well-known β-grasp fold (four-stranded β-sheet packed against
one α-helix) — the topology matches the structural-biology literature
exactly, which is an independent sanity check that the offset above is
correct (an incorrect offset would have produced a nonsensical,
discontinuous secondary-structure assignment).

## What the structural view does and doesn't show

- Mapping a single-mutant's `DMS_score` onto the 3D structure shows *where*
  mutation sensitivity sits in 3D space — it does not, by itself, prove
  *why* (buried-core packing vs. the IgG-binding interface vs. backbone
  geometry are all consistent with "sensitive," and distinguishing them
  would need the structure's actual solvent accessibility / contact map,
  which this project does not yet compute).
- Any visual proximity between a sensitive position and the crystal
  structure's modeled IgG-Fc contact region is a hypothesis this project
  surfaces, never a claim of mechanism.
