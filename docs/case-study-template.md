# Portfolio case study: Virus Atlas (template)

Fill the bracketed parts yourself; keep claims to what you can show.

## One-line summary
An interactive atlas that lets undergraduates compare virus structure, size, genomes and replication, with every fact cited and every diagram labelled as schematic.

## Problem
[Why existing figures are hard to compare: mixed scales, family vs species values blurred, Baltimore vs taxonomy conflated.]

## My role and how AI was used
- **Designed (me):** scope (which twelve viruses and why: one or more per Baltimore class, three host types), evidence model (status + scope per fact), page structure, what to show and what to refuse to show.
- **Researched (me, with AI assistance):** facts gathered from ICTV MSL41, NCBI, ICTV profiles, ViralZone and primary papers; AI helped locate and extract, and I [describe how you checked them].
- **Implemented (with an AI coding assistant, Claude Code):** Next.js app, SVG renderers, tests. [Describe what you reviewed, changed or rewrote yourself.]
- **Evaluated:** automated tests (60 unit, 25 browser). [User test results, if run.] [AI tutor eval results, if run.]

## Key decisions
1. Facts store scope and evidence status, so a family range never masquerades as a measurement.
2. Baltimore class and ICTV taxonomy shown side by side, never merged; rule-based compare text says when a similarity is mechanism, not ancestry.
3. 2D code-drawn SVG schematics first (precise, accessible), with optional lazy-loaded 3D that falls back to 2D; protein views use real PDB coordinates rather than drawings.
4. Size outlines derived from data at one uniform scale; log view labelled as non-proportional.
5. AI tutor optional and grounded: server-side key, structured output, citation validation, fallback to curated passages.

## Results
[Only measured numbers. Example: "In a 6-person think-aloud, 5 of 6 completed task 2…"]

## Limitations and next steps
Twelve viruses; several family-level sizes; a few unverified items; 3D virus models are schematic; most protein structures are fragments or related strains; no expert review yet; tutor quality unmeasured.
