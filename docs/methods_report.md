# Methods and Evaluation Report

All numbers below are from the actual run saved at
`data/processed/eval_results.json` (seed=42). Nothing here is invented or
cherry-picked — this is the one and only run performed for this session,
and reproducing it is `python3 scripts/run_evaluation.py`.

## Data

1,045 single amino-acid substitutions across all 55 positions of the GB1
domain (55 × 19 = 1,045, fully saturated — no missing single-mutant
combinations). See `docs/dataset_provenance.md` for sourcing/verification
and `docs/eda_summary.md` for exploratory findings.

## Features

Per mutation: original/substituted amino-acid identity (one-hot), and
deltas in Kyte-Doolittle hydrophobicity, Zamyatnin volume, a simplified
charge category, and a polar/nonpolar category, plus the hydrophobicity of
the two sequence-neighboring residues as a crude local-context feature.
Scale sources and their stated approximations are documented in
`src/variantlab/features.py`.

## Models

1. **Mean baseline** — predicts the training-set mean score for every row.
2. **Ridge regression** — alpha selected from {0.01, 0.1, 1, 10, 100} using
   the validation split only (Setting A) or fixed at 1.0 (Setting B, to keep
   the 5-fold loop simple — a documented simplification, not an oversight).
3. **Random Forest** (300 trees, max depth 8, min leaf 2) — same
   hyperparameters in both settings; no tuning was done for Setting B.

All three models were evaluated on **identical splits** within each setting;
no run was repeated or discarded.

## Setting A — held-out substitutions at represented positions

Random 70/15/15 split (731 train / 156 val / 158 test). Every test-set
position is represented in training by *other* substitutions. This is the
narrower, easier generalization test.

| feature set | model | Spearman ρ | MAE |
|---|---|---|---|
| with position | mean baseline | undefined (constant) | 1.615 |
| with position | Ridge (α=100) | 0.640 | 1.195 |
| with position | Random Forest | **0.878** | **0.586** |
| without position | mean baseline | undefined (constant) | 1.615 |
| without position | Ridge (α=100) | 0.626 | 1.211 |
| without position | Random Forest | 0.825 | 0.693 |

**Position-memorization ablation:** removing the raw position feature drops
Random Forest's Spearman ρ from 0.878 to 0.825 (and Ridge's from 0.640 to
0.626). Some, but not most, of the Random Forest's apparent accuracy comes
from memorizing position-specific fitted values rather than learning
substitution chemistry — the model still does well on substitution-level
patterns alone, but the gap is real and worth stating plainly rather than
quietly using the higher number.

## Setting B — held-out positions (5-fold GroupKFold, n=209/fold test)

Entire positions withheld from training in each fold — the harder,
more honest generalization test, and the one more analogous to predicting
an uncharacterized position.

| model | Spearman ρ (mean ± std across folds) | MAE (mean ± std) |
|---|---|---|
| mean baseline | undefined (constant per fold) | 1.505 ± 0.149 |
| Ridge (α=1.0) | 0.385 ± 0.235 | 1.409 ± 0.137 |
| Random Forest | 0.405 ± 0.185 | 1.305 ± 0.120 |

**Interpretation:** both trained models beat the mean baseline on MAE, and
both show *positive* rank correlation with the true scores for genuinely
unseen positions — but performance drops sharply versus Setting A (Random
Forest ρ falls from 0.878 to 0.405) and is noisy fold-to-fold (±0.185–0.235
on a ρ of ~0.4). Positions within a fold are correlated (several
substitutions from the same position land together), so these std values
are rough, not precise confidence intervals — a genuinely rigorous
uncertainty estimate would need position-aware resampling beyond what this
session implemented.

## What these results do and do not establish

- They establish that simple physicochemical deltas carry real, generalizable
  signal about GB1 fitness, even for positions never seen in training (ρ >
  0 and beats baseline in Setting B).
- They establish that a meaningful share of "accuracy" in the easier
  Setting A partly reflects position memorization, not pure substitution
  chemistry.
- They say **nothing** about any protein other than GB1, under any assay
  other than this one. Generalization across proteins was never tested and
  is not claimed.
- They say nothing about mechanism (folding vs. binding) — see
  `docs/project_brief.md` Section 3.

## Known limitations / unresolved in this session

- No nested/repeated cross-validation for Ridge's alpha in Setting B (fixed
  at 1.0 instead) — a simplification for time, not a tuned best case.
- No position-aware bootstrap for tighter Setting B uncertainty bands.
- No embedding-based model (Section 6's optional pretrained-embedding
  extension) attempted yet.
- No structural mapping (Section 9) attempted yet — `SPG1_STRSG.pdb` is
  already identified as the structure file in ProteinGym's metadata for a
  future session.
