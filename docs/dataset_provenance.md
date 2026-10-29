# Dataset Provenance and Licensing Note

## What this project uses

**Protein:** GB1 — the B1 immunoglobulin-binding domain of Streptococcal protein G
(UniProt mnemonic `SPG1_STRSG`).

**Assay:** mRNA-display selection for binding to the Fc region of human IgG, read out by
deep sequencing (Olson, Wu, and Sun, 2014).

**Mutation scope used in V1:** single amino-acid substitutions only (1,045 of the
536,962 total measured variants; the remainder are double mutants and are excluded
from V1 by design, see Section 4 of the project brief).

## Original publication (verified via NCBI PubMed/PMC, 2026-10-25)

- Olson CA, Wu NC, Sun R. "A comprehensive biophysical description of pairwise
  epistasis throughout an entire protein domain." *Current Biology* 24(22):2643-2651,
  2014.
- DOI: `10.1016/j.cub.2014.09.072`
- PMID: `25455030`
- PMCID: `PMC4254498` (free full text via PubMed Central under the NIH Public Access
  Policy; the work was funded in part by NIH grants R25 CA098010, R21 AI110261,
  R01 AI085583)
- Copyright: © 2014 Elsevier Ltd. The article text itself is **not** CC-BY — it is
  free-to-read via PMC, not freely redistributable as a document.

## Dataset source and version actually downloaded

Because the original paper's supplementary tables sit behind a copyright that governs
the *document*, not the measurements, this project sources the already-extracted,
widely-reused numeric dataset from **ProteinGym** rather than re-scraping Elsevier's
supplement:

- Repository: `OATML-Markslab/ProteinGym_v1` on Hugging Face Datasets
- Config: `DMS_substitutions`, assay id **`SPG1_STRSG_Olson_2014`**
- Downloaded 2026-10-25 from
  `https://huggingface.co/datasets/OATML-Markslab/ProteinGym_v1/resolve/main/DMS_substitutions/train-0000{1,2}-of-00005.parquet`,
  filtered to `DMS_id == "SPG1_STRSG_Olson_2014"`
- Row count after filtering: **536,962** — matches the row count recorded in
  ProteinGym's own reference table (`reference_files/DMS_substitutions.csv`,
  `DMS_total_number_mutants = 536962`, `DMS_number_single_mutants = 1045`) pulled
  directly from `github.com/OATML-Markslab/ProteinGym` the same day.
- Saved immutably at `data/raw/SPG1_STRSG_Olson_2014_full.parquet` — this file is never
  edited in place; all cleaning happens downstream and writes to `data/processed/`.

### License

- ProteinGym's **codebase** is MIT-licensed. That license covers their code, not the
  underlying experimental measurements.
- ProteinGym's documentation does not assert a new license over the measurements
  themselves; it defers to the original publication and asks users to cite it. This is
  the standard practice already followed by other reuse of this exact dataset (e.g.,
  DeepSequence, EVE, ESM variant-effect papers).
- **Practical conclusion for this project:** the GB1 fitness measurements are used here
  for non-commercial, educational/portfolio analysis with full citation of Olson et al.
  2014, consistent with how the computational biology community has reused this
  dataset for over a decade. This is not a CC0/CC-BY grant — if this project were ever
  repurposed commercially, the original authors/publisher would need to be contacted.

## Reference sequence validation (cross-checked against two independent sources)

The ProteinGym metadata encodes GB1 as residues 228-282 of a 448-residue
`target_seq` (a longer multi-domain construct used for the alignment/MSA step, not the
expressed GB1 construct itself). Slicing that region out of the downloaded data and
comparing it against the GB1 sequence independently documented by the `mavenn` Python
package's dataset page gives an **exact match**:

```
ProteinGym target_seq[227:282] : QYKLILNGKTLKGETTTEAVDAATAEKVFKQYANDNGVDGEWTYDDATKTFTVTE
mavenn documented GB1 sequence : QYKLILNGKTLKGETTTEAVDAATAEKVFKQYANDNGVDGEWTYDDATKTFTVTE
```

This project uses the **55-residue domain sequence** above as the reference, numbered
1-55 for clarity (not 228-282), and remaps every mutation accordingly during parsing
(see `src/variantlab/data_prep.py`). The remapping and the match above are logged by
the pipeline's verification step, not merely asserted here.

## Mutation notation and residue numbering

- Raw `mutant` column format: single mutants look like `Q228R` (original residue,
  1-indexed position in the 448-aa precursor numbering, substituted residue); double
  mutants are two such tokens joined by `:`, e.g. `Q228K:T279A`.
- This project **excludes** all `:`-joined rows for V1 (536,962 → 1,045 rows) and
  re-numbers the remaining single mutants to the 1-55 domain frame
  (`domain_position = precursor_position - 227`).

## Assay conditions and score meaning

- Score column used: `DMS_score`, which for this assay equals the raw reported
  phenotype `lnW` (log enrichment of a variant after IgG-binding selection relative to
  wild type), unmodified — ProteinGym's own `raw_DMS_directionality` field for this
  assay is `1`, meaning the sign was already "higher = more fit" in the source data, so
  no sign flip was applied in their curation.
- **Direction:** higher `DMS_score` = better performance in the assay (more stable
  and/or better IgG-Fc binding; WT ≈ 0 by construction of the enrichment ratio).
- **What the assay actually measures:** the assay cannot cleanly separate folding
  stability from binding affinity — a mutant can score low because it fails to fold,
  because it folds but binds IgG-Fc poorly, or some mixture of both. Olson et al. (2014)
  partly address this with a separate ΔΔG stability analysis in the same paper; this
  project's V1 does not attempt that decomposition and will state this as a limitation
  throughout (see `docs/project_brief.md`, Section 3).
- ProteinGym separately records a manual binarization cutoff (`lnW < -4` → "loss of
  function") used for their classification-style benchmarks. This project treats the
  score as continuous and does not adopt that cutoff, but documents it here since it is
  a reasonable, literature-anchored convention for defining "large effect" in the EDA
  step if a threshold is ever needed.

## Missing values and replicates

- No `NaN` scores exist in the 1,045-row single-mutant subset (every one of the 55
  positions × 19 possible substitutions is present — fully saturated single-mutant
  coverage, confirmed by the pipeline's coverage check).
- The source assay is a single pooled selection experiment with deep-sequencing read
  counts per variant, not independent biological replicates; there is therefore no
  replicate-agreement analysis to run for this assay (noted explicitly instead of
  silently skipped — see Section 5 of the project brief).

## Second candidate considered but not selected

`PABP_YEAST_Melamed_2013` (Pab1 RRM2 domain, *S. cerevisiae*; Melamed et al., 2013,
*RNA* 19:1537-1551) — 1,187 single mutants across a 75-residue domain, assayed by yeast
growth complementation (an essential-function readout), also available through the same
ProteinGym assay table. See `docs/project_brief.md` for why GB1 was preferred for V1.
