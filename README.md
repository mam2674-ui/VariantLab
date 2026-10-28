# Virus Atlas

An interactive, source-cited atlas for comparing virus structure, size, genomes and replication strategies. Built for undergraduate biology students. Local only; not deployed.

Six representative viruses chosen for contrast:

| Virus | Genome | Envelope | Structure | Host |
|---|---|---|---|---|
| Influenza A virus | −ssRNA, 8 segments | yes | helical RNPs, no icosahedral capsid | vertebrates |
| SARS-CoV-2 | +ssRNA | yes | helical nucleocapsid, no icosahedral capsid | vertebrates |
| Herpes simplex virus 1 | dsDNA, linear | yes | T=16 capsid + tegument + envelope | vertebrates |
| Human adenovirus 5 | dsDNA, linear | no | pseudo T=25 capsid with fibres | vertebrates |
| Human papillomavirus 16 | dsDNA, circular | no | T=7 capsid | vertebrates |
| Bacteriophage T4 | dsDNA, linear | no | prolate head + contractile tail | bacteria |

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

## Results at the time of writing (2026-10-28)

- `tsc --noEmit`: 0 errors
- `eslint`: 0 problems
- Vitest: 46 tests passed (5 files)
- `next build`: succeeded; all pages prerendered
- Playwright: 17 passed, 1 skipped (the mobile-only test is skipped in the desktop project), across desktop Chrome and Pixel 7
- Hallmark `sloplint`: clean (0 FAIL / 0 REFLEX / 0 WARN) after fixing two off-scale spacings and one missing text colour. Its screenshot tier did not run (no `puppeteer-core` installed); screenshots were taken with Playwright and the in-app browser instead.
- Impeccable design hook: ran on every UI file edit with no findings.
- The AI tutor has **not** been exercised with a real key in this session. The no-key path and the citation validator are tested; generated-answer quality is unmeasured.

## Project layout

```
src/data/            scientific records (JSON), sources.json, diagram specs, glossary, Baltimore classes
src/lib/schema.ts    Zod schema: facts carry value + status + scope + sourceIds
src/lib/data.ts      loads and cross-validates everything (bad data fails build and tests)
src/lib/units.ts     nm/µm/Å conversion, formatting, linear and log scales
src/lib/filter.ts    atlas filters        src/lib/compare.ts  comparison rows + rule-based insights
src/lib/urlState.ts  URL <-> filters/comparison
src/lib/silhouette.ts true-proportion outlines from recorded dimensions
src/lib/retrieval.ts passages + keyword ranking   src/lib/tutor.ts  tutor schema, guard, prompt
src/components/diagrams/  one SVG renderer per structural model
src/app/             pages: / , /virus/[id], /compare, /size, /genomes, /sources, /tutor, /methods
tests/unit           Vitest   tests/e2e  Playwright
docs/                fact-check checklist, AI eval set, user-test plan, demo script, case study, design notes
```

## Data sources

Taxonomy: ICTV Virus Metadata Resource, MSL41 (VMR v1, 2026-07-29), read directly from the spreadsheet. Genome lengths: NCBI Nucleotide reference sequences. Structure and size: ICTV taxonomy profiles (J Gen Virol, CC BY 4.0) and report chapters, ViralZone (SIB, cited for text only; no images reused), and primary papers (Ke et al. 2020 Nature; Fokine et al. 2004 PNAS; Chen et al. 2001 J Virol; Rao et al. 2023 Viruses; Leiman et al. 2010 Virol J). Full list with DOIs and licences: `src/data/sources.json` and the `/sources` page.

All diagrams are original code-drawn SVG schematics. Nothing here is medical advice, and no laboratory methods are included.
