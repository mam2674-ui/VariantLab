# Methods and Evaluation Report

All numbers below are from the actual runs saved at
`data/processed/{gb1,pab1,tem1,gfp}_eval_results.json` (or `eval_results.json`
for GB1; seed=42). Nothing here is invented or cherry-picked — reproducing
any of them is `python3 scripts/run_evaluation.py <slug>`.

**Updated 2026-11-08:** a real bug in the train/test splitter was found and
fixed (see "Known limitations" in the original session, now resolved,
below) — it could put a sparse-coverage position's only observed
substitution entirely in the test set, which breaks Setting A's own
definition. The fix changed Setting A's exact split composition for every
protein (a different, now-correct, valid split), which is why GB1's numbers
here differ slightly from earlier reports. Setting B was never affected by
this bug and its numbers are unchanged throughout.

## Data

| Protein | Single mutants | Positions | Coverage | Assay |
|---|---|---|---|---|
| GB1 | 1,045 | 55 | 100% (fully saturated) | IgG-Fc binding (mRNA display) |
| Pab1 (RRM2) | 1,187 | 75 | 83.3% | Yeast growth complementation |
| TEM-1 | 4,783 | 263 | 95.7% | Ampicillin-resistance growth selection |
| GFP | 1,084 | 236 | 24.2% (sparse) | FACS fluorescence sorting |

See `docs/dataset_provenance.md` and `docs/structure_provenance.md` for full
sourcing/verification per protein, and `docs/eda_summary.md` for GB1's
exploratory findings (not yet repeated for the other three).

## Features

Per mutation: original/substituted amino-acid identity (one-hot), and
deltas in Kyte-Doolittle hydrophobicity, Zamyatnin volume, a simplified
charge category, and a polar/nonpolar category, plus the hydrophobicity of
the two sequence-neighboring residues as a crude local-context feature —
identical feature set for all four proteins. Scale sources and their stated
approximations are documented in `src/variantlab/features.py`.

## Models

1. **Mean baseline** — predicts the training-set mean score for every row.
2. **Ridge regression** — alpha selected from {0.01, 0.1, 1, 10, 100} using
   the validation split only (Setting A) or fixed at 1.0 (Setting B, to keep
   the 5-fold loop simple — a documented simplification, not an oversight).
3. **Random Forest** (300 trees, max depth 8, min leaf 2) — same
   hyperparameters in both settings and across all four proteins; no
   per-protein tuning was done.

All three models were evaluated on **identical splits** within each setting
and protein; no run was repeated or discarded.

## Setting A — held-out substitutions at represented positions

Random ~70/15/15 split (exact sizes below; the split guarantees every test
position is also represented in train — see the splitter fix above). This
is the narrower, easier generalization test.

| Protein | n train/val/test | RF ρ (with pos) | RF ρ (without pos) | RF MAE |
|---|---|---|---|---|
| GB1 | 732/157/156 | 0.817 | 0.788 | 0.552 |
| Pab1 | 831/178/178 | 0.779 | 0.749 | 0.154 |
| TEM-1 | 3348/717/718 | 0.702 | 0.617 | 0.276 |
| GFP | 759/163/162 | 0.405 | 0.326 | 0.283 |

**Position-memorization ablation** (every protein shows the same pattern):
removing the raw position feature drops Random Forest's ρ in every single
case — GB1 (0.817→0.788), Pab1 (0.779→0.749), TEM-1 (0.702→0.617, the
largest drop), GFP (0.405→0.326). Some share of apparent Setting-A accuracy
is position memorization on every protein tested so far, not just GB1 —
a pattern that's now been checked four times, not asserted once.

## Setting B — held-out positions (5-fold GroupKFold)

Entire positions withheld from training in each fold — the harder, more
honest generalization test.

| Protein | RF ρ (mean ± std) | RF MAE (mean ± std) |
|---|---|---|
| GB1 | 0.405 ± 0.185 | 1.305 ± 0.120 |
| Pab1 | 0.542 ± 0.141 | 0.253 ± 0.025 |
| TEM-1 | 0.378 ± 0.030 | 0.349 ± 0.006 |
| GFP | 0.297 ± 0.076 | 0.332 ± 0.056 |

**Interpretation:** every protein shows a sharp drop from Setting A to
Setting B — the easier-to-harder gap is not unique to GB1. Pab1's
held-out-position ρ is the highest of the four (0.542), GFP's the lowest
(0.297) — GFP also has by far the sparsest training data (24% coverage vs.
83-100% for the others), a plausible explanation that this project does not
claim to have confirmed (one data point, four proteins, is not enough to
separate "sparse data hurts" from "fluorescence is a harder phenotype to
predict from physicochemistry alone"). TEM-1's fold-to-fold std is
noticeably tighter (±0.030) than the other three (±0.14-0.19) — likely
because it has far more data per fold (718-719 test rows vs. 156-209 for
the others), which is the expected direction for that difference, not a
surprise.

## What these results do and do not establish

- They establish that simple physicochemical deltas carry real,
  generalizable signal on **four different proteins and four different
  assay types** — a materially stronger claim than "this one worked for
  GB1," though still only four data points, not a generalizable law.
- They establish that position memorization inflates Setting A's apparent
  accuracy on every protein checked so far, not just GB1.
- They say **nothing** about any protein beyond these four. Four is not
  "proteins in general," and this project does not claim otherwise anywhere.
- They say nothing about mechanism (folding vs. binding vs. catalysis vs.
  chromophore maturation) for any of the four — see each protein's
  `assay_caveat` in `src/variantlab/proteins.py` and
  `docs/structure_provenance.md`.

## Known limitations / unresolved

- No nested/repeated cross-validation for Ridge's alpha in Setting B (fixed
  at 1.0) — a simplification for time, not a tuned best case, on any protein.
- No position-aware bootstrap for tighter Setting B uncertainty bands.
- No embedding-based model (Section 6's optional pretrained-embedding
  extension) attempted for any protein.
- GB1's exploratory data analysis (`docs/eda_summary.md`) has not yet been
  repeated for Pab1, TEM-1, or GFP.
- ChimeraX static structure renders are generated (one `.cxc` script per
  protein in `scripts/`) but require manual local execution — this sandbox
  has no GUI/WindowServer access to run them automatically (see the
  dashboard's ChimeraX tab for the exact command).
