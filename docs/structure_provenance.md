# Structure Provenance (Section 9 — structural extension)

VariantLab now covers four proteins. Each one's structure was sourced and
verified independently — nothing here is assumed to carry over from GB1's
verification to the others. One section per protein below; a shared closing
section on what any of these structural views can and can't establish.

---

## GB1

### Structure source

- **PDB ID:** 1PGB
- **Title:** "Two Crystal Structures of the B1 Immunoglobulin-Binding Domain
  of Streptococcal Protein G and Comparison with NMR"
- **Authors:** Gallagher T, Alexander P, Bryan P, Gilliland GL
- **Journal:** Biochemistry 33(16):4721-4729, 1994. PMID 8161530.
  DOI: 10.1021/bi00181a032.
- **This is the exact paper Olson et al. (2014) cite** for GB1's structure
  in their own reference list — not an independently chosen structure.
- **Method:** X-ray diffraction, 1.92 Å resolution. **Experimentally
  determined**, not predicted.
- Saved immutably at `data/raw/structure/1PGB.pdb`.

### Chain and completeness

Chain A, 56 residues, no missing residues (`REMARK 465` is empty). Only
heteroatom present: water — no bound ligand to account for.

### Sequence alignment and residue numbering (verified, not assumed)

The PDB SEQRES for chain A is 56 residues; this project's 55-residue domain
reference is `QYKLILNGKTLKGETTTEAVDAATAEKVFKQYANDNGVDGEWTYDDATKTFTVTE`.
Programmatic comparison (`tests/test_structure.py`) confirms PDB residues
3-56 are identical, residue for residue, to domain positions 2-55 (54/54
exact match). Domain position 1 (Gln) has no identical match in the
crystallized construct — a known N-terminal expression-tag/cloning
difference (the construct has Met-Thr there instead), not a numbering
error. **Mapping used:** `pdb_resnum = domain_position + 1`, valid for
domain positions 2-55; **domain position 1 is excluded** from all
structural mapping rather than silently mismapped.

### Secondary structure (read from the structure, not guessed)

1PGB's own `HELIX`/`SHEET` records, translated through the verified offset:

| Element | Domain positions |
|---|---|
| β-strand 1 | 1-8 |
| β-strand 2 | 11-19 |
| α-helix | 22-35 |
| β-strand 3 | 41-45 |
| β-strand 4 | 49-55 |

GB1's well-known β-grasp fold — the topology matches the literature
exactly, an independent sanity check that the offset is correct.

---

## Pab1 (RRM2 domain)

### Structure source

- **Model:** AlphaFold AF-P04147-F1 (v6), UniProt P04147 (PABP_YEAST).
- **⚠️ PREDICTED, not experimental.** The only experimental structure
  containing this exact domain is **PDB 6R5K**, a 4.8 Å cryo-EM structure
  of the entire Pan2-Pan3 deadenylase complex bound to a poly(A) RNP — a
  huge multi-protein assembly, not a clean isolated-domain structure, and
  4.8 Å is coarse enough that side-chain positions are not reliably
  resolved. Verified via RCSB sequence search (≥90% identity): 6R5K is the
  *only* experimental hit for this domain.
- **Why AlphaFold instead:** its per-residue confidence was checked
  specifically in the RRM2 region (domain positions 1-75, UniProt 126-200),
  not just read off the whole-protein average (which is dragged down by a
  disordered region elsewhere in the 577-residue full-length protein).
  Measured directly from the model's own per-atom pLDDT (B-factor column):
  **mean pLDDT 93.6, min 84.2, max 97.3** across the RRM2 region — "very
  high" to "high" confidence throughout, not an assumption.
- Saved at `data/raw/pab1/structure/AF-P04147-F1.pdb`; the cryo-EM
  structure is kept for reference at
  `data/raw/pab1/structure/6R5K_experimental_cryoEM.pdb`, unused for
  rendering.

### Sequence alignment and residue numbering (verified, not assumed)

The AlphaFold model's sequence is identical to the DMS dataset's
`target_seq` (both ultimately trace to the same UniProt record) — **no
offset mismatch at all**, confirmed 75/75 positions by
`tests/test_pab1_structure.py` (a cleaner result than GB1's one known
construct difference). Mapping: `pdb_resnum = domain_position + 125`.

### Secondary structure

No DSSP binary is available in this environment, so secondary structure
was computed from the model's own backbone coordinates via phi/psi
dihedral-angle geometry (`src/variantlab/structure.py`'s own classifier —
documented explicitly as *not* DSSP, a simplified but transparent method).
Result matches the canonical RRM fold topology (β1-α1-β2-β3-α2-β4) exactly,
which is itself a sanity check that the classifier and the mapping are
both working correctly — an unrelated-to-RRM-biology bug would have
produced a nonsensical topology, not a textbook-perfect one.

---

## TEM-1 (β-lactamase)

### Structure source

- **PDB ID:** 1XPB ("Structure of beta-lactamase TEM1"), chain A.
- **Method:** X-ray diffraction, 1.90 Å. **Experimentally determined.**
- Clean apo structure — only heteroatoms are water and one sulfate ion
  (crystallization buffer component, not a biologically meaningful ligand).
- Saved at `data/raw/tem1/structure/1XPB.pdb`.

### Sequence alignment and residue numbering (verified, not assumed) — the Ambler-numbering case

Class A β-lactamases are conventionally numbered using **Ambler numbering**,
a historical scheme that does *not* run sequentially — it carries insertion
codes (e.g. residue "51A") and skips certain numbers entirely (57 and 253
do not exist in this scheme) to stay consistent with TEM-1 as the reference
numbering for the whole enzyme family. This means `pdb_resnum =
domain_position + constant` is **not a valid model** for this structure,
unlike GB1 and Pab1.

`proteins.py` therefore supports an explicit `structure_resnum_map`: every
domain position's PDB residue number (including letter-suffixed insertion
codes) was read directly off the structure file in sequence order and
stored as an explicit per-position dictionary, then independently
re-verified residue-by-residue against the reference sequence in
`tests/test_tem1_gfp_structure.py`: **0 mismatches across all 263
residues.** A naive linear-offset formula would have silently drifted out
of register partway through the sequence; the explicit map (built from the
real file, not inferred from a formula) avoids that failure mode entirely.

### Secondary structure

1XPB's own `HELIX`/`SHEET` records, translated through the explicit map: 12
helices and 8 strand segments — consistent with class A β-lactamases' known
mixed α-helical-domain-plus-α/β-domain fold (a genuinely more complex
topology than GB1's or Pab1's single simple fold, which is expected for a
263-residue enzyme rather than a ~55-75-residue binding domain).

---

## GFP (green fluorescent protein)

### Structure source

- **PDB ID:** 1EMA (Ormö, Cubitt, Kallio, Gross, Tsien & Remington, 1996),
  chain A — one of the original, most-cited GFP crystal structures.
- **Method:** X-ray diffraction, 1.90 Å. **Experimentally determined.**
- Saved at `data/raw/gfp/structure/1EMA.pdb`.

### Sequence alignment and residue numbering (verified, not assumed) — two real complications, handled explicitly

**1. The chromophore.** GFP's defining chemistry is that three consecutive
residues (Ser65-Tyr66-Gly67 in the wild-type sequence) autocatalytically
cyclize into a single modified chemical group once the protein folds. Real
crystal structures represent this chemistry accurately: 1EMA's PDB file
does not contain three separate residues at these positions — it contains
one merged group, residue type `CRO`, numbered 66. This is not a data
artifact to work around; it is the actual molecular reality the structure
correctly captures. `proteins.py`'s explicit map reflects this: **domain
positions 63, 64, and 65 all resolve to the same structure residue, `"66"`**
— handled openly, not silently approximated as three separate (and
therefore wrong) positions. `tests/test_tem1_gfp_structure.py` locks this
behavior in explicitly.

**2. Two known crystallization-variant mismatches.** Comparing the
structure's sequence against the DMS dataset's wild-type reference
position-by-position turned up two real amino-acid mismatches beyond the
chromophore, at domain positions 62 and 78. These are not an error in this
project's mapping — they are **F64L and Q80R**, well-documented mutations
present in the specific GFP construct Ormö et al. crystallized (common,
independently-known GFP engineering/cloning variants), which genuinely
differ from the wild-type sequence Sarkisyan et al.'s DMS assay mutated.
Rather than silently coloring those two positions with a residue that is
chemically a different amino acid than the one actually assayed, **domain
positions 62 and 78 are explicitly excluded** from structural
mapping/coloring (`structure_unmapped_domain_positions`), alongside several
genuinely disordered loop positions in the crystal (76, 86, 151, 216) and
the disordered C-terminal tail (228-235, consistent with the structure's
own `REMARK 465` missing-residue list).

Every other position — the large majority of the 236-residue domain — was
verified identical between the structure and the reference sequence
programmatically, not assumed (`tests/test_tem1_gfp_structure.py`).

### Secondary structure

1EMA's own `HELIX`/`SHEET` records: **11 β-strands** forming GFP's famous
β-barrel, plus one short N-terminal helix and a few small internal helical
turns — textbook GFP topology (the central α-helix threading through the
barrel, carrying the chromophore, plus the can-shaped β-sheet). Verified
programmatically in `tests/test_tem1_gfp_structure.py`
(`test_gfp_secondary_structure_is_the_eleven_stranded_barrel`).

---

## What the structural view does and doesn't show (all four proteins)

- Mapping a single-mutant's `DMS_score` onto the 3D structure shows *where*
  mutation sensitivity sits in 3D space — it does not, by itself, prove
  *why* (buried-core packing vs. a binding/catalytic interface vs. backbone
  geometry are all consistent with "sensitive," and distinguishing them
  would need the structure's actual solvent accessibility / contact map,
  which this project does not compute for any of the four proteins).
- Any visual proximity between a sensitive position and a known functional
  site (GB1's IgG contact region, TEM-1's active site, GFP's chromophore
  pocket, Pab1's RNA-binding surface) is a hypothesis this project
  surfaces, never a claim of mechanism.
- Pab1's and the chromophore-adjacent GFP positions carry additional,
  protein-specific caveats (predicted-not-experimental; variant exclusions)
  documented above — read the relevant section before treating either
  structural view as equivalent in certainty to GB1's or TEM-1's.
