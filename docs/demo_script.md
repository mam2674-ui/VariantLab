# Two-Minute Demo Script (draft — personalize before using)

**0:00-0:20 — The question**
"I built a tool to test how well simple, sequence-only features can predict
the measured effect of a protein mutation. I used a real deep mutational
scanning dataset — GB1, a small bacterial antibody-binding domain, where
researchers measured the IgG-binding fitness of all 1,045 possible single
mutations."

**0:20-0:50 — The heatmap (show Mutation Heatmap tab)**
"This is every one of those 1,045 measurements. Each row is a position,
each column a substituted amino acid. You can already see structure here
without any model: these horizontal dark bands are positions where almost
every substitution is damaging — likely residues buried in the protein
core. And this column — proline — is damaging almost everywhere, which
matches known biology: proline breaks the regular backbone geometry most
secondary structure needs."

**0:50-1:30 — The model, and the honest test (show Mutation Explorer +
Model Evaluation tabs)**
"I trained a Random Forest on physicochemical features — hydrophobicity,
charge, size deltas. If I test it on substitutions at positions it's already
seen, it gets Spearman correlation of 0.88 with the real measurements. But
that's the easy test. The harder, more honest question is: can it predict
a position it's *never* seen at all? For that I used grouped
cross-validation so no position's data ever leaks across the split —
and the correlation drops to about 0.41. I'm showing both numbers, not just
the flattering one."

**1:30-1:50 — Why this matters**
"This gap is the point: a lot of apparent ML performance in protein fitness
prediction comes from memorizing positions rather than learning
generalizable chemistry, and a careful evaluation has to be designed to
catch that, not hide it."

**1:50-2:00 — Scope and close**
"This is one protein and one assay — I'm not claiming this generalizes
anywhere else, and nothing here is disease-related. The next steps are
extending the feature set and testing a structural context."
