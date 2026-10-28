# Portfolio case study: Virus Atlas (template)

Fill the bracketed parts yourself; keep claims to what you can show.

## One-line summary
An interactive atlas that lets undergraduates compare virus structure, size, genomes and replication, with every fact cited and every diagram labelled as schematic.

## Problem
[Why existing figures are hard to compare: mixed scales, family vs species values blurred, Baltimore vs taxonomy conflated.]

## My role and how AI was used
- **Designed (me):** scope (which six viruses and why), evidence model (status + scope per fact), page structure, what to show and what to refuse to show.
- **Researched (me, with AI assistance):** facts gathered from ICTV MSL41, NCBI, ICTV profiles, ViralZone and primary papers; AI helped locate and extract, and I [describe how you checked them].
- **Implemented (with an AI coding assistant, Claude Code):** Next.js app, SVG renderers, tests. [Describe what you reviewed, changed or rewrote yourself.]
- **Evaluated:** automated tests (46 unit, 17 browser). [User test results, if run.] [AI tutor eval results, if run.]

## Key decisions
1. Facts store scope and evidence status, so a family range never masquerades as a measurement.
2. Baltimore class and ICTV taxonomy shown side by side, never merged; rule-based compare text says when a similarity is mechanism, not ancestry.
3. Code-drawn SVG instead of 3D: precise, accessible, light; 3D would add little for teaching layers.
4. Size outlines derived from data at one uniform scale; log view labelled as non-proportional.
5. AI tutor optional and grounded: server-side key, structured output, citation validation, fallback to curated passages.

## Results
[Only measured numbers. Example: "In a 6-person think-aloud, 5 of 6 completed task 2…"]

## Limitations and next steps
Six viruses; several family-level sizes; three unverified items; no expert review yet; tutor quality unmeasured.
