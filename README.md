# VariantLab: Protein Mutation Analysis with Machine Learning

Can simple sequence-derived features predict the experimentally measured
effect of a single amino-acid substitution in a real protein? This project
answers that for **four proteins** — GB1 (IgG-binding domain), Pab1 (RNA-
binding RRM2 domain), TEM-1 (β-lactamase), and GFP — each with its own real
deep mutational scanning dataset and its own real protein structure, using
publicly sourced data verified against primary literature. No synthetic or
invented measurements anywhere.

**Live dashboard:** https://variantlab-gb1.streamlit.app

Start with `docs/project_brief.md` for the scientific question and
GB1-specific biology (the project's original scope before it grew to four
proteins). See `docs/dataset_provenance.md` and `docs/structure_provenance.md`
for exactly where each protein's data and structure came from and how each
was independently verified, `docs/eda_summary.md` for GB1's exploratory
plots, and `docs/methods_report.md` for the real model evaluation numbers
across all four proteins.

## Setup

```bash
cd variantlab
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Reproduce the analysis

Every pipeline script takes a protein slug (`gb1`, `pab1`, `tem1`, or `gfp`;
defaults to `gb1` when omitted). The GB1-era `data_prep` entry point is
slightly different — see below.

```bash
# GB1 (the original, slug-free entry point):
python3 -m src.variantlab.data_prep

# Pab1 / TEM-1 / GFP: parse + validate each protein's raw data directly
# (see scripts/run_evaluation.py's load_data() for the exact call, or just
# reuse the already-committed data/processed/<slug>_single_mutants.csv)

python3 scripts/run_evaluation.py gb1        # -> data/processed/eval_results.json
python3 scripts/run_evaluation.py pab1       # -> data/processed/pab1_eval_results.json
python3 scripts/run_evaluation.py tem1       # -> data/processed/tem1_eval_results.json
python3 scripts/run_evaluation.py gfp        # -> data/processed/gfp_eval_results.json

python3 scripts/precompute_predictions.py gb1   # out-of-fold + refit predictions, per protein
python3 scripts/precompute_predictions.py pab1
python3 scripts/precompute_predictions.py tem1
python3 scripts/precompute_predictions.py gfp

python3 scripts/run_eda.py                    # GB1 figures -> docs/figures/ (not yet repeated for the others)
python3 -m pytest tests/ -v                     # 42 checks: parsing, structure verification, leakage, metrics
```

Every script uses a fixed random seed (`src/variantlab/__init__.py`, `SEED =
42`); raw data files in `data/raw/` are never modified.

### ChimeraX structure renders (optional, manual)

One `.cxc` script per protein already exists in `scripts/` (e.g.
`render_chimerax_tem1.cxc`). This project's automated sessions have no
GUI/WindowServer access to run ChimeraX headlessly, so these need a real
Terminal:

```bash
/Applications/ChimeraX-1.12.app/Contents/MacOS/ChimeraX scripts/render_chimerax_<slug>.cxc
```

Re-run `scripts/generate_chimerax_scripts.py` first if the underlying
predictions have changed since the `.cxc` files were last generated.

## Run the dashboard

```bash
streamlit run app/dashboard.py
```

Pick a protein with the switcher at the top — the choice is reflected in
the URL (`?protein=tem1`) and shareable.

## Project structure

`src/variantlab/proteins.py` holds every protein-specific fact (reference
sequence, numbering offsets, structure file, assay description) in one
`ProteinConfig` per protein — the rest of the pipeline
(`data_prep.py`, `features.py`, `evaluation.py`, `modeling.py`,
`structure_viz.py`) is written generically against that config rather than
hardcoding any one protein. See `docs/project_brief.md` Section 3 for the
original (GB1-only) layout rationale, still accurate for the shared
pipeline code.
