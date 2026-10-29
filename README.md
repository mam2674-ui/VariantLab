# VariantLab: Protein Mutation Analysis with Machine Learning

Can simple sequence-derived features predict the experimentally measured
effect of a single amino-acid substitution in a real protein? This project
answers that for one protein (GB1, the IgG-binding domain of Streptococcal
protein G) and one deep mutational scanning assay, using real, verified,
publicly sourced data — no synthetic or invented measurements.

Start with `docs/project_brief.md` for the scientific question, biology,
and project plan. See `docs/dataset_provenance.md` for exactly where the
data came from and how it was verified, `docs/eda_summary.md` for what the
exploratory plots show, and `docs/methods_report.md` for the real model
evaluation numbers.

## Setup

```bash
cd variantlab
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Reproduce the analysis

```bash
python3 -m src.variantlab.data_prep      # parse + validate raw data -> data/processed/gb1_single_mutants.csv
python3 scripts/run_eda.py                # figures -> docs/figures/
python3 scripts/run_evaluation.py          # model comparison -> data/processed/eval_results.json
python3 scripts/precompute_predictions.py   # out-of-fold + refit predictions for the dashboard
python3 -m pytest tests/ -v                  # 17 checks: parsing, leakage, metrics, reproducibility
```

Every script uses a fixed random seed (`src/variantlab/__init__.py`, `SEED =
42`); the raw data file in `data/raw/` is never modified.

## Run the dashboard

```bash
streamlit run app/dashboard.py
```

## Project structure

See `docs/project_brief.md` Section 3 for the full layout and rationale.
