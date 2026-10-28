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
- **3D:** not used. SVG keeps layers precise and accessible; no WebGL fallback needed.

## Review tools run
- Impeccable hook on every UI edit: no findings.
- Hallmark sloplint: 2 REFLEX (off-scale spacing) + 1 WARN fixed; now clean. Render tier unavailable (no puppeteer-core).
- Manual review at 1280px and 375px, light and dark, via the in-app browser and Playwright screenshots. Fixes made: wordmark colour (CSS layer order), line-up readability, HSV DNA path, hydration rounding, stage label and route-diagram sizing, an inaccurate T4 caption.
