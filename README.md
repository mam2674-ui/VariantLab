# Virus Atlas

An interactive, source-cited atlas for comparing virus structure, size, genomes and replication strategies. Built for undergraduate biology students. Local only; not deployed.

Eighteen representative viruses, chosen so every Baltimore class is covered, hosts span vertebrates, invertebrates, plants and bacteria, and shapes range from 25 nm shells to filaments and bricks:

| Virus | ICTV genome | Baltimore | Envelope | Structure | Host |
|---|---|---|---|---|---|
| Influenza A virus | ssRNA(−), 8 segments | V | yes | helical RNPs | vertebrates |
| SARS-CoV-2 | ssRNA(+) | IV | yes | helical nucleocapsid | vertebrates |
| HIV-1 | ssRNA-RT | VI | yes | cone-shaped core | vertebrates |
| Hepatitis B virus | dsDNA-RT, relaxed circle | VII | yes | icosahedral nucleocapsid | vertebrates |
| Herpes simplex virus 1 | dsDNA | I | yes | T=16 capsid + tegument | vertebrates |
| Human adenovirus 5 | dsDNA | I | no | pseudo T=25 capsid + fibres | vertebrates |
| Human papillomavirus 16 | dsDNA, circular | I | no | T=7 capsid | vertebrates |
| Poliovirus 1 | ssRNA(+) | IV | no | pseudo T=3 capsid | vertebrates |
| Rotavirus A | dsRNA, 11 segments | III | no | triple-layered capsid | vertebrates |
| Tobacco mosaic virus | ssRNA(+) | IV | no | helical rod | plants |
| Bacteriophage T4 | dsDNA | I | no | head + contractile tail | bacteria |
| Bacteriophage phiX174 | ssDNA(+), circular | II | no | T=1 capsid with spikes | bacteria |
| Ebola virus | ssRNA(−) | V | yes | filament with helical RNP core | vertebrates |
| Rabies virus | ssRNA(−) | V | yes | bullet with helical nucleocapsid | vertebrates |
| Vaccinia virus | dsDNA | I | yes (membrane) | brick with core and lateral bodies | vertebrates |
| Zika virus | ssRNA(+) | IV | yes | small smooth sphere | vertebrates and invertebrates |
| Norwalk virus | ssRNA(+) | IV | no | T=3 capsid with cup-shaped depressions | vertebrates |
| Bacteriophage MS2 | ssRNA(+) | IV | no | T=3 shell, one A protein | bacteria |

## What is in it

- **Design**: dark editorial layout; IBM Plex for interface and headings, Source Serif 4 for body text; animated page transitions (React ViewTransition) with thumbnail-to-profile morphs; the home page runs as full-screen slides with scroll-linked entrances. All motion is disabled under reduced-motion settings.
- **Atlas** with search and filters (genome class incl. reverse-transcribing classes, envelope, host, morphology, size), URL-synced.
- **Structure viewer** per virus, controlled from one toolbar (2D/3D, Show inside, Full names, Pull apart): 2D schematic or 3D model (React Three Fiber, lazy-loaded, WebGL fallback to 2D), exterior/cutaway, layer toggles, "separate layers" exploded view, numbered components with cited descriptions. 3D uses a molecular-graphics look: ambient occlusion (N8AO), depth-edge silhouettes, subunit lattices.
- **Protein structures**: 36 experimental structures from the PDB (particle components, enzymes, and complexes with host receptors), linked from the matching diagram component, shown as a 2D Cα trace with a secondary-structure map, and in 3D as cartoon, approximate surface or trace. Each page lists what the experiment did and did not capture.
- **Genome maps**: 709 coding sequences from the NCBI reference records, drawn as linear tracks by strand, rings for circular genomes and one track per segment, plus a 3D strand view coloured by gene.
- **Compare** 2–3 viruses (rule-based, cited insights; URL-shareable).
- **Size explorer**: linear to-scale, logarithmic, and labelled-illustration views; nm/µm table.
- **Genomes & replication**: genome glyphs, Baltimore routes, and an animated cell map that moves to where each replication stage happens (animal, plant or bacterial cell).
- **Sources**: 90 sources with reverse index and a "known gaps" list.
- **Tutor**: optional, grounded in curated passages; works without a key.

## Setup

Requires Node 22+ (tested on Node 24.18).

```bash
cd ~/Coding/virus-atlas
```

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Everything works without an API key.

### Optional AI tutor

```bash
echo 'ANTHROPIC_API_KEY=your-key-here' > .env.local
```

The key is read only in `src/app/api/tutor/route.ts` (a server route). It is never prefixed `NEXT_PUBLIC_` and never reaches the browser bundle. `TUTOR_MODEL` overrides the default model (`claude-opus-5-5`).

## Verify

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

```bash
npx playwright install chromium
```

```bash
E2E_PORT=3218 npm run test:e2e
```

The e2e suite starts `next start` on the given port (after `npm run build`) with `ANTHROPIC_API_KEY` blanked, so it also proves the site works without credentials.

## Results at the time of writing (2026-10-28, v3)

- `tsc --noEmit`: 0 errors; `eslint`: 0 problems
- Vitest: 60 tests passed (6 files) over 18 viruses, including cross-checks that genome annotations sum to each reference length, that protein chains match their coordinate files, and that all seven Baltimore classes are covered
- `next build`: succeeded
- Playwright: 27 passed, 1 skipped (mobile-only test in the desktop project), desktop Chrome and Pixel 7, with the API key blanked
- Hallmark `sloplint`: see design notes; Impeccable hook: no findings on edited UI files
- 3D rendering checked headlessly (software WebGL) for all 18 virus models and protein styles; no page errors
- Not done: the AI tutor has not been run with a real key; no user testing or expert review

## Project layout

```
src/data/            scientific records (JSON), sources.json, diagram specs, glossary, Baltimore classes,
                     proteins.ts (PDB entries), genomes.json (NCBI CDS annotations)
public/structures/   Cα/P coordinates extracted from PDB mmCIF files (CC0)
src/lib/schema.ts    Zod schema: facts carry value + status + scope + sourceIds
src/lib/data.ts      loads and cross-validates everything (bad data fails build and tests)
src/lib/units.ts     nm/µm/Å conversion, formatting, linear and log scales
src/lib/filter.ts    atlas filters        src/lib/compare.ts  comparison rows + rule-based insights
src/lib/urlState.ts  URL <-> filters/comparison
src/lib/silhouette.ts true-proportion outlines from recorded dimensions
src/lib/retrieval.ts passages + keyword ranking   src/lib/tutor.ts  tutor schema, guard, prompt
src/components/diagrams/  one SVG renderer per structural model
src/components/three/     3D models, molecular-graphics post-processing
src/components/protein/   protein 2D/3D viewer   src/components/genome/  genome map 2D/3D
src/app/             pages: / , /virus/[id], /compare, /size, /genomes, /proteins, /proteins/[pdbId], /sources, /tutor, /methods
tests/unit           Vitest   tests/e2e  Playwright
docs/                fact-check checklist, AI eval set, user-test plan, demo script, case study, design notes
```

## Data sources

Taxonomy: ICTV Virus Metadata Resource, MSL41 (VMR v1, 2026-07-29), read directly from the spreadsheet. Genome lengths: NCBI Nucleotide reference sequences. Protein coordinates: RCSB Protein Data Bank (CC0), Cα/P atoms extracted from the deposited mmCIF files. Gene annotations: NCBI feature tables (RefSeq records for HBV and TMV). Structure and size: ICTV taxonomy profiles (J Gen Virol, CC BY 4.0) and report chapters, ViralZone (SIB, cited for text only; no images reused), and primary papers (Ke et al. 2020 Nature; Fokine et al. 2004 PNAS; Chen et al. 2001 J Virol; Rao et al. 2023 Viruses; Leiman et al. 2010 Virol J). Full list with DOIs and licences: `src/data/sources.json` and the `/sources` page.

All diagrams are original code-drawn SVG schematics. Nothing here is medical advice, and no laboratory methods are included.
