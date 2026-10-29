# Design notes

## Inputs found
- `~/DESIGN.md`: a Vercel/Geist analysis (ink-on-near-white, hairlines, Geist Sans + Mono, 6px controls, mesh gradient in the hero). It lives in the home folder, not in this project, so it was treated as a reference rather than a locked system. Note: line 54 of that file has stray text inside the `label-sm` fontWeight value; it was ignored.
- Hallmark (`~/.agents/skills/hallmark`), design-taste-frontend (`~/.agents/skills/design-taste-frontend`) and Impeccable (`~/.claude/skills/impeccable`, with its edit hook active) were all present.

## How conflicts were resolved
- **Canvas:** Vercel's #fafafa warmed to paper (#f6f4ee) per the brief; restrained dark mode added.
- **Colour:** Vercel's mesh gradient dropped (the brief bans decorative gradients). The only colour budget is a semantic structural palette, one hue per component type, reused in every diagram and paired with non-colour cues (shapes, line styles, numbers).
- **Type:** Geist for UI/text (from DESIGN.md), Newsreader serif for editorial display headings (the brief asked for an editorial atlas), Geist Mono only for measurements and IDs. Vercel's mono uppercase eyebrows were dropped: Hallmark and Impeccable both ban eyebrows and tracked-caps labels.
- **Cards:** used only for panels that hold a tool (viewer, detail panel); lists are hairline-ruled rows, not card grids.
- **Motion:** one explanatory motion (arrows drawing along the mRNA route) and a short fade on step changes, both disabled under reduced motion.
- **3D (v1):** not used; superseded in v2 below, where 3D is optional and falls back to the 2D SVG.

## Review tools run
- Impeccable hook on every UI edit: no findings.
- Hallmark sloplint: 2 REFLEX (off-scale spacing) + 1 WARN fixed; now clean. Render tier unavailable (no puppeteer-core).
- Manual review at 1280px and 375px, light and dark, via the in-app browser and Playwright screenshots. Fixes made: wordmark colour (CSS layer order), line-up readability, HSV DNA path, hydration rounding, stage label and route-diagram sizing, an inaccurate T4 caption.

## v2 redesign (2026-10-28)

The user asked for the look and flow of colossal.com with blue accents, then for a typeface that does not read as AI-generated.

- **Taken from the reference:** near-black cinematic surfaces; a full-viewport hero with a full-width wordmark; a top bar of numbered page links in hairline-divided columns with an "Index" overlay listing every virus; numbered section labels over large all-caps headings; a solid-colour statistics band; scroll-staged reveals. No Colossal logo, copy, imagery or wording is reused.
- **Blue accent:** electric blue (#3d7bff) for actions, focus, selection and the statistics band only. The structural palette stays separate (capsid moved to a lighter sky blue so it never reads as "interactive").
- **Typeface:** IBM Plex Sans (variable; condensed width 75% for display caps), IBM Plex Mono for data and section numbers. Replaced Archivo Expanded and Geist, which read as a template.
- **Removed as template tells:** "+" prefixes, fake "000-000" codes, gutter registration marks, a hatched rule.
- **Statistics band:** every number is computed from the dataset at build time and carries its citation. An early draft heading compared TMV to bacterial width; it was removed because no source in the atlas supports it.
- **3D:** procedural models redrawn in a molecular-graphics style after ChimeraX: N8AO ambient occlusion, a custom depth-edge silhouette shader, matte materials, capsids built from subunit rings on geodesic lattices.
- **Hero:** the rotating virus changed from SARS-CoV-2 to human adenovirus 5, whose capsomer lattice and fibres read as more realistic.
- **Waivers recorded in the CSS stamp:** mono labels and section numbers (Hallmark rule 9), by explicit request.

## v3 (2026-10-28)

The user asked for more viruses, a more human-made look, animated transitions between "slides", streamlined options and a different body font.

- **Body font:** Source Serif 4 (optical sizing) for paragraphs, list items and captions; IBM Plex stays for interface, data and the caps section heads. Smaller headings became serif, sentence-case subheads.
- **Human-made details:** plain numbering ("No. 04 of 18") instead of codes, a colophon in the footer, serif captions, hanging punctuation.
- **Transitions:** React `<ViewTransition>` on the main region gives every navigation a short exit and a slower rise-in; each virus thumbnail in the atlas morphs into the silhouette on its profile. The home page is a sequence of full-screen slides with gentle scroll-snap and scroll-linked entrances (`animation-timeline: view()` where supported). All of it is off under reduced motion.
- **Streamlined options:** the structure viewer's four control groups became one toolbar: 2D/3D, then "Show inside", "Full names" and (in 3D) "Pull apart". Atlas filters keep search, genome and envelope visible; host, shape and size sit under "More filters", which shows how many are on.
