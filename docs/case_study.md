# Portfolio Case Study — VariantLab (draft)

**Read this note first:** this draft was scaffolded by an AI coding
assistant in one working session — the data verification, pipeline code,
tests, evaluation, and dashboard were written and run by the assistant, with
you reviewing and directing decisions in the chat (dataset choice,
scope boundaries, what the project should and shouldn't claim). Before using
this anywhere (resume, interview, GitHub README), **you should personally
re-run the pipeline, read the code, and be able to explain every decision
below without the AI present.** That's not a formality — an interviewer
will ask "why GroupKFold by position instead of random k-fold," and the
honest answer needs to come from you having understood it, not memorized
it. Treat this file as a first draft to rewrite in your own words once
you've done that.

## The question

Can features computed directly from a protein's sequence — no structure, no
evolutionary alignment, no pretrained model — predict how a single
amino-acid substitution affects real, experimentally measured protein
function?

## The data

GB1, the 55-residue IgG-binding domain of Streptococcal protein G. Olson,
Wu & Sun (2014, *Current Biology*) measured the fitness of all 1,045
possible single substitutions using mRNA display selected for IgG-Fc
binding, read out by deep sequencing. I sourced the processed measurements
through ProteinGym and independently verified the reference sequence against
a second source (the `mavenn` Python package's documented GB1 sequence)
before trusting it — see `docs/dataset_provenance.md` for that verification
trail.

## What I built

- A validation pipeline that parses every mutation string, checks it against
  the reference sequence, and records *why* any row was excluded rather than
  silently dropping it (17 automated tests cover this).
- Sequence-derived features (hydrophobicity, volume, charge, polarity
  deltas) from documented scales, not invented numbers.
- Two evaluation settings, not one: predicting unseen substitutions at known
  positions is a fundamentally easier problem than predicting substitutions
  at positions the model has never seen anything about. I measured both
  with proper group-aware splitting so no position's data leaked across the
  train/test boundary.
- A Streamlit dashboard that keeps observed measurements, genuinely
  held-out predictions, and training-set predictions visually and
  explicitly separate — a design choice specifically to avoid the common
  mistake of showing a model's fit-on-training-data output as if it were
  evidence of accuracy.

## What I found

A Random Forest on these simple features reached Spearman ρ ≈ 0.88 when
predicting unseen substitutions at already-seen positions, but dropped to
ρ ≈ 0.41 (± 0.19 across folds) when predicting entirely unseen positions —
a ~2x gap that makes the harder, more honest test case explicit rather than
reporting only the flattering number. I also quantified how much of the
easier setting's accuracy came from the model memorizing position identity
rather than learning substitution chemistry (ablating the raw position
feature dropped ρ from 0.878 to 0.825). See `docs/methods_report.md` for the
full numbers.

## What this does *not* show

- Nothing about any protein besides GB1, or any assay besides this one.
- Nothing about disease relevance — GB1 is a bacterial domain, and even
  for human proteins, an assay-specific functional score is not a measure
  of clinical risk.
- Nothing about mechanism — a low score could reflect misfolding, poor
  binding, or both; this project didn't attempt to separate them.

## Skills this demonstrates

Data provenance verification (not just downloading a Kaggle CSV), leakage-
aware ML evaluation design, honest reporting of a performance gap instead of
hiding it, and biological interpretation grounded in what an assay can and
cannot measure.
