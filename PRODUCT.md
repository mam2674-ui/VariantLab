# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the project's author, a Columbia undergraduate with a
biology/neuroscience background and developing computational-biology
skills (Python/R). Two confirmed situations of use:

1. **Personal interview prep** — rehearsing the project, building real
   intuition for the biology/stats/ML choices, defending every decision
   under questioning.
2. **Demoing to recruiters/interviewers** — shared live (link or
   screen-share) as a portfolio piece.

Both are in scope now; the surface must work unattended-but-impressive
(recruiter skim) and also hold up under detailed interview questioning.

## Product Purpose

Investigate how well simple, sequence-derived features predict the
experimentally measured effect of a single amino-acid substitution in one
real protein (GB1), using a verified deep mutational scanning dataset.
Success is a project the author can confidently defend in interviews:
real data with documented provenance, a leakage-aware evaluation design,
and reporting that states the harder result alongside the flattering one.

## Positioning

Unlike a typical "download a dataset, fit a model, report accuracy"
portfolio project, VariantLab (a) traces its dataset back to the primary
publication and independently cross-checks the reference sequence before
trusting it, (b) evaluates under two distinct splitting strategies
(unseen substitution at a known position vs. an entirely unseen position)
specifically to expose a real generalization gap rather than reporting
only the easier number, and (c) keeps observed measurements, genuinely
held-out predictions, and training-fit predictions visually distinct
everywhere they appear — a rigor a less careful competitor project could
not truthfully claim.

## Operating Context

A Streamlit web app (`app/dashboard.py`) with four tabs today: Mutation
Heatmap, Mutation Explorer, Model Evaluation, and a limitations tab
("What this does and doesn't show"). Backed by a reproducible pipeline
(`src/variantlab/{data_prep,features,evaluation,modeling}.py`,
`scripts/run_evaluation.py`, `scripts/precompute_predictions.py`) with 17
passing automated tests (`tests/`). Supporting written deliverables already
exist in `docs/`: `project_brief.md`, `dataset_provenance.md`,
`eda_summary.md`, `methods_report.md`, `case_study.md`, `demo_script.md`,
`resume_bullets.md`.

This redesign is the project's first visual design pass — no DESIGN.md or
prior visual system exists yet.

## Capabilities and Constraints

- Scope is deliberately narrow: one protein (GB1, 55-residue IgG-binding
  domain), one assay (IgG-Fc binding via mRNA display, Olson et al. 2014),
  single amino-acid substitutions only (1,045 of 1,045 possible —
  fully saturated). Do not imply broader coverage.
- Three models are compared on identical splits: mean baseline, Ridge,
  Random Forest. Two evaluation settings: held-out substitutions at known
  positions, and held-out positions (GroupKFold).
- Hard constraint: a training-set/refit-on-all-data prediction must never
  be presented as evidence of test performance, in UI or in copy.
- Hard constraint: no disease/clinical-relevance claims anywhere — GB1 is
  a bacterial domain, and this project does not extrapolate to human
  variant interpretation.
- "Large effect" is defined by the assay's own documented binarization
  cutoff (lnW < -4), not an invented threshold.
- Stack is fixed as already built: Python, pandas, scikit-learn,
  matplotlib, Streamlit. Not up for replacement in this redesign.

## Brand Commitments

Project name "VariantLab" is fixed. No logo or prior visual identity
exists — this is the first visual design pass.

## Evidence on Hand

- Real dataset: 1,045 GB1 single mutants (`data/processed/gb1_single_mutants.csv`),
  sourced via ProteinGym, verified against Olson, Wu & Sun (2014, PMID
  25455030) and independently cross-checked (reference sequence matched a
  second source, the `mavenn` package's documented GB1 sequence).
- Real evaluation results (`data/processed/eval_results.json`): Random
  Forest Spearman ρ = 0.878 (with position feature) / 0.825 (without) on
  held-out substitutions; ρ = 0.405 ± 0.185 across 5 GroupKFold folds on
  held-out positions.
- Four real EDA figures in `docs/figures/` (score distribution,
  position×substitution heatmap, property-effect boxplots, large-effect
  positions).
- No testimonials, logos, press, or customers exist or should be
  fabricated — this is a solo technical portfolio project, not a company.

## Product Principles

1. Report the harder, more honest evaluation setting alongside the easier
   one — never the flattering number alone.
2. Observed, held-out-predicted, and refit-on-all-data values stay
   visually distinct everywhere; never implied as interchangeable.
3. Every claim is scoped to what the data actually establishes — no
   cross-protein generalization, no disease relevance, no mechanism
   claims beyond what the assay can support.
4. Real, verified data only. No synthetic placeholders presented as real.
5. Built for interview-defensibility: every design and methodological
   choice should be something the author can explain and justify without
   the assistant present.

## Accessibility & Inclusion

No product-specific requirement established beyond this surface needing
to hold up in a live screen-share/demo context (see Users). Standard web
accessibility floor applies by default; nothing further was confirmed.
