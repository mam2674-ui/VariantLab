# Resume Bullet Templates (fill in placeholders, verify before using)

Only use numbers that match a run you've personally reproduced — the
bracketed values below are the actual numbers from this session's one run
(`data/processed/eval_results.json`), but re-run `scripts/run_evaluation.py`
yourself and confirm before putting any number on a resume.

1. Built an end-to-end ML pipeline analyzing [1,045] deep-mutational-scanning
   measurements of a real protein (GB1), with leakage-aware train/test
   splitting (grouped by residue position) that exposed a [~2x] gap between
   easy-case and hard-case model generalization (Spearman ρ [0.88] → [0.41]).

2. Designed and verified a reproducible bioinformatics data pipeline that
   validates [1,045] parsed mutations against a reference protein sequence,
   with [17] automated tests covering parsing correctness, train/test
   leakage prevention, and metric computation.

3. Built an interactive Streamlit dashboard for exploring protein mutation
   effects that explicitly distinguishes observed experimental data from
   model predictions, including [X] out-of-fold predictions computed via
   grouped cross-validation to avoid presenting training-fit results as test
   evidence.
