# VariantLab: Project Brief

## 1. Scientific question

**How well can simple sequence-derived features predict the experimentally
measured effects of single amino-acid substitutions in one protein?**

### What deep mutational scanning (DMS) measures

DMS makes thousands to millions of variants of one gene simultaneously (here,
by randomizing codons across the GB1 domain), subjects the whole pooled
library to a selection step that depends on the property of interest, and
reads out how each variant's relative abundance changed before vs. after
selection using deep sequencing. A variant that gets *enriched* after
selection performed well in the assay; a variant that gets *depleted*
performed poorly. The output is one quantitative score per variant — it is a
population-scale readout, not a single biochemical measurement, and its
precision depends on how many sequencing reads each variant received.

### What this specific assay measures

GB1 is displayed via **mRNA display** and selected for **binding to the Fc
region of human IgG**. The resulting score (`DMS_score`, equal to the
assay's own `lnW`, log enrichment relative to wild type) reflects **both**
how well a variant folds *and* how well it binds IgG-Fc — mRNA display only
detects a protein if it folds well enough to be captured by its binding
partner during selection. A low score could mean "doesn't fold," "folds but
binds poorly," or some mixture. **This project does not assume a reduced
score means instability** — that conflation is called out explicitly
wherever scores are interpreted (see `docs/dataset_provenance.md` and
`docs/eda_summary.md`).

### Why mutations have different effects at different positions

A protein's fold depends on specific residues playing specific structural
roles — packing the hydrophobic core, forming the binding interface,
maintaining backbone geometry at turns. A substitution at a buried,
tightly-packed core position is far more likely to break folding than the
same chemical change at a solvent-exposed loop position. The heatmap in
`docs/figures/02_position_substitution_heatmap.png` makes this directly
visible: horizontal bands of uniformly low scores mark positions where
*almost every* substitution is damaging, consistent with those positions
playing a structural rather than incidental role.

### Association, prediction, and mechanism — kept distinct throughout

- **Association**: e.g., "substitutions that remove a charge tend to score
  lower" is a statistical pattern in this dataset.
- **Prediction**: a trained model outputs a number for an unseen
  substitution; good held-out accuracy means the pattern generalizes within
  this protein and assay, nothing more.
- **Mechanism**: *why* a mutation hurts (misfolding vs. lost binding contact
  vs. backbone strain) requires independent structural or biophysical
  evidence, which this project's V1 does not attempt to establish. Any
  mechanistic language in this project is explicitly flagged as a
  hypothesis, never a conclusion.

## 2. Dataset candidates considered (both independently verified 2026-10-25)

| | **GB1** (selected) | Pab1 RRM2 (alternative) |
|---|---|---|
| Source | Olson, Wu & Sun (2014) *Current Biology* 24(22):2643-2651 | Melamed et al. (2013) *RNA* 19:1537-1551 |
| ProteinGym assay id | `SPG1_STRSG_Olson_2014` | `PABP_YEAST_Melamed_2013` |
| Domain length | 55 residues | 75 residues |
| Single mutants | 1,045 (fully saturated: 55 × 19) | 1,187 |
| Assay | In vitro IgG-Fc binding (mRNA display) | In vivo yeast growth complementation |
| Score meaning | Folding + binding, conflated | Folding + binding + expression + growth fitness, conflated further |

**Why GB1 was chosen:** it is the *cleaner* assay of the two — a direct
in vitro binding selection, versus Pab1's growth-complementation readout
which bundles in whatever else affects yeast fitness (expression level,
proteostasis burden, RNA-binding activity, growth rate pleiotropy). GB1 is
also smaller (full heatmap fits easily on a laptop and in one figure),
fully saturated (no missing single-mutant combinations to explain away),
and has zero disease-relevance framing risk since it's a bacterial
immunoglobulin-binding domain, not a human protein. Pab1 remains documented
here as a verified fallback if a second protein is added later — this
project does not claim GB1 was chosen because it produced better model
performance; it was chosen before any model was trained, for the reasons
above.

## 3. Minimal architecture

```
variantlab/
  data/
    raw/            # preserved original download, never edited
    processed/       # pipeline outputs: cleaned csv, parse report, eval results
  src/variantlab/
    data_prep.py      # load, parse mutations, validate reference, record exclusions
    features.py        # hydrophobicity/volume/charge/polarity deltas, documented scales
    evaluation.py       # leakage-aware splits (Setting A, Setting B), metrics
    modeling.py          # mean baseline, Ridge, Random Forest
  scripts/
    run_evaluation.py    # end-to-end: data -> features -> both eval settings -> json
    run_eda.py            # exploratory plots
    precompute_predictions.py  # out-of-fold + refit predictions for the dashboard
  app/dashboard.py          # Streamlit: heatmap, mutation explorer, eval results, limits
  tests/                      # mutation parsing, reference matching, split leakage, metrics
  docs/                        # this brief, provenance, EDA summary, methods report
```

## 4. Four-week plan (5-7 hrs/week)

**Week 1 (done in this session):** verify and download dataset; build and
test the parsing/validation pipeline; build sequence-derived features; run
EDA; build baseline/linear/tree models under both leakage-aware evaluation
settings; build and smoke-test the Streamlit dashboard.

**Week 2:** tighten the model layer — proper nested hyperparameter search
for the tree model (not just Ridge's alpha), per-region/per-property error
breakdowns where sample size allows, and a position-aware bootstrap to put
uncertainty bands on Setting B's fold-to-fold spread. Expand tests to cover
the modeling and feature layers directly (currently only data_prep and
evaluation have dedicated tests).

**Week 3:** optional structural extension (Section 9) — map scores onto the
GB1 crystal structure (`SPG1_STRSG.pdb`, already referenced in ProteinGym's
metadata) if it doesn't overcomplicate V1; otherwise, polish the dashboard
(better heatmap interactivity, add the property-effects and large-effect
plots as dashboard tabs instead of static files only).

**Week 4:** write the methods/evaluation report and portfolio case study
from real results (no invented numbers); record the two-minute demo;
finalize resume bullet templates; final pass checking every plot for
mislabeling and every claim against what the data actually shows.

## 5. Criteria for a finished first version

- [x] Dataset verified against two independent sources (PubMed/PMC record +
      cross-checked reference sequence), license and provenance documented.
- [x] Parsing pipeline validates every mutation against the reference
      sequence and records every exclusion with a reason (17 tests passing).
- [x] EDA covers distribution, heatmap, property effects, large-effect
      positions, and missing-data coverage, each with a written
      "what this does/doesn't show."
- [x] Three models (baseline, Ridge, Random Forest) compared on **identical**
      splits under **both** required evaluation settings, with an explicit
      position-memorization ablation.
- [x] Dashboard distinguishes observed vs. held-out-predicted vs.
      refit-on-all-data predictions, and never presents a training-set
      prediction as test evidence.
- [ ] Structural extension (optional — not yet attempted).
- [ ] Final written methods/evaluation report, case study, demo script,
      resume bullets (drafted this session in `docs/methods_report.md` and
      the chat response; case study/demo script to be split into their own
      files if you want them as standalone deliverables).
