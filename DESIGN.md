---
name: VariantLab
description: A biotech-standard interface for exploring GB1 mutation fitness, structure, and predictions
colors:
  ink: "#14171a"
  ink-secondary: "#52585e"
  paper: "#ffffff"
  paper-subtle: "#f6f4f1"
  hairline: "#d9d4cb"
  structural-blue-deep: "#0d1f3c"
  structural-blue: "#1c3f6e"
  structural-blue-light: "#3f6ea8"
  on-blue: "#eef3fa"
  on-blue-secondary: "#aebedb"
  verified-teal: "#0b6e62"
  verified-teal-bg: "#eaf4f2"
  caution-amber: "#9a5b12"
  caution-amber-bg: "#faf2e6"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  sectionHeading:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(1.4rem, 2.2vw, 1.8rem)"
    fontWeight: 700
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  tagline:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.82rem"
  measurement:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "1.5rem"
    fontWeight: 600
rounded:
  card: "10px"
  nav: "999px"
spacing:
  card-padding: "0.9rem 1.05rem"
  card-gap: "0.9rem"
components:
  evidence-card-observed:
    backgroundColor: "{colors.paper-subtle}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  evidence-card-verified:
    backgroundColor: "{colors.verified-teal-bg}"
    textColor: "{colors.verified-teal}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  evidence-card-caution:
    backgroundColor: "{colors.caution-amber-bg}"
    textColor: "{colors.caution-amber}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  pill-nav:
    backgroundColor: "{colors.structural-blue-deep}"
    textColor: "{colors.on-blue}"
    rounded: "{rounded.nav}"
---

# Design System: VariantLab

## Overview

**Creative North Star: "The Standard, Stated Plainly"**

VariantLab's interface now opens the way a serious biotech company opens
its culture page — with atmosphere, a stated standard, and confidence —
then immediately substitutes what a solo technical project actually has in
place of a team: verified data, a verified structure, and an honestly
reported performance gap. This is a **redesign**, not a refinement: it
replaces the prior "Lab Notebook" system (flat, restrained, ink-on-paper)
rather than polishing it, per a user-pinned reference
(untillabs.com/our-team).

**Confirmed visual rejection:** the prior Lab Notebook system is retired as
the dominant world — its functional color semantics (Verified Teal /
Caution Amber for evidentiary status) survive unchanged because they encode
real meaning, not decoration, but the dominant restrained-neutral palette
and IBM Plex Sans display face do not carry forward.

**Translation discipline:** every pattern borrowed from the pinned
reference was re-grounded in VariantLab's own real content, never copied
as a skin. Until's team-photo grid became a grid of PRODUCT.md's five
confirmed Product Principles. Its "What We Care About" value-statement
cards became the same pattern with real principles as content. Its dark
"we value X" banner became "We report the harder number." Its gradient
hero atmosphere became a structural-blue glow (independently justified:
blue is the convention for ribbon/cartoon protein rendering, not borrowed
for its own sake). One deliberate deviation from the pinned reference: its
category-label-above-statement ("THOUGHTFUL URGENCY" above "Every minute
counts.") is dropped — that is Impeccable's one hard-banned pattern (a
kicker/eyebrow above a heading) regardless of what the brief pins, so the
bold statement itself carries the full weight instead.

**Key Characteristics:**
- Committed structural blue at page scale (hero + banner) — a color
  strategy earned by Persuade-mode permission, not a restrained accent.
- Space Grotesk for every display/heading voice; IBM Plex Sans for body;
  IBM Plex Mono still reserved exclusively for measured/computed values
  (that rule survived the world change intact).
- A sticky pill-shaped nav, translating the reference's floating capsule
  nav directly — one of the few elements kept nearly literal, since it's
  structural chrome, not content.
- The evidentiary evidence-card system (neutral / verified-teal /
  dashed-caution-amber) is unchanged from the prior system and remains
  load-bearing: it is the mechanism that keeps observed, held-out-predicted,
  and refit-on-all-data values visually distinct everywhere.

## Colors

Two registers: a committed structural blue carrying the hero and banner at
page scale, and a warm-neutral register (inherited from the prior system)
for every content section between them.

### Primary
- **Structural Blue** (#1c3f6e) on **Structural Blue Deep** (#0d1f3c): the
  hero and banner backgrounds, and the pill nav. A radial glow (Structural
  Blue Light, #3f6ea8, plus a Verified Teal wash) sits behind the hero
  headline — evoking fluorescence/cartoon-rendering convention, not a
  literal sky.

### Secondary
- **Verified Teal** (#0b6e62) on its wash (#eaf4f2): unchanged in meaning
  from the prior system — marks a value as genuine held-out evidence.
  Doubles as the keyboard-focus ring and active-tab underline color.

### Tertiary
- **Caution Amber** (#9a5b12) on its wash (#faf2e6), always paired with a
  **dashed** border: unchanged — marks a value that is not test evidence.

### Neutral
- **Paper** (#ffffff) / **Paper Subtle** (#f6f4f1): every content section
  background between the blue hero/banner.
- **On-Blue** (#eef3fa) / **On-Blue Secondary** (#aebedb): text on the
  structural-blue sections.
- **Ink** (#14171a) / **Ink Secondary** (#52585e): text on paper sections.
- **Hairline** (#d9d4cb): dividers and card borders at rest.

### Named Rules
**The Semantic Color Rule.** Verified Teal and Caution Amber never appear
decoratively — only to mark a value's evidentiary status. Unchanged from
the prior system; the world replacement did not touch this.

**The Committed-Blue Rule.** Structural blue owns whole regions at page
scale (the hero, the banner, the nav) — it is never used as a scattered
accent on paper sections, which stay neutral.

## Typography

**Display Font:** Space Grotesk (with system sans-serif fallback) —
chosen for a confident, rounded-but-technical character distinct from a
system default, matching the pinned reference's bold rounded display
voice without literally using its (unidentified, likely custom) face.
**Body Font:** IBM Plex Sans.
**Measurement Font:** IBM Plex Mono — unchanged rule from the prior system.

### Hierarchy
- **Hero Display** (700, `clamp(2.2rem,4.4vw,3.6rem)`, Space Grotesk): the
  single page H1, centered, max 18ch, over the structural-blue gradient.
- **Banner Statement** (700, `clamp(1.6rem,2.6vw,2.1rem)`, Space Grotesk):
  the one-sentence standard stated in the dark banner.
- **Section Heading** (700, `clamp(1.4rem,2.2vw,1.8rem)`, Space Grotesk):
  "What this project holds itself to," "Understanding the science," "The
  verified structure," "Explore the data" — one per major section, strict
  H1→H2→H3 hierarchy maintained throughout (no skipped levels, a fix
  carried over from the prior accessibility pass).
- **Tile Statement/Title** (600, 1.05rem, Space Grotesk): the bold line in
  each principle/concept card — carries the full weight Impeccable's
  anti-kicker rule requires, since no label sits above it.
- **Tagline** (IBM Plex Mono, 0.82rem): the small parenthetical line above
  the hero headline — the one place mono is used outside an actual
  measured value, as a deliberate typographic quotation mark, not data.
- **Measurement** (600, 1.5rem, IBM Plex Mono): unchanged from the prior
  system.

### Named Rules
**The Measurement-Mono Rule.** Unchanged: IBM Plex Mono renders only
measured/computed values (plus the one tagline exception above, which
reads as a typographic device, not a data value).

**The No-Kicker Rule.** No label, tag, or eyebrow sits above any heading
or bold statement anywhere in the system — including the principle and
concept cards, where the pinned reference's own pattern used one. The
statement always carries its own weight.

## Layout

A full-bleed structural-blue hero and banner (no content max-width) give
way to a `max-width: 1120px` centered content column for every section
from "What this project holds itself to" onward. Section order follows a
deliberate pace: atmosphere (hero) → standard (banner) → principles grid →
concepts grid → structure (interactive 3D / 2D / ChimeraX) → the original
Operate-mode tool (heatmap / explorer / eval / limitations tabs). The pill
nav is `position: sticky` at the top and anchor-links to each major
section. Card grids use `repeat(auto-fit, minmax(220px,1fr))` — reflow to
a single column under ~700px with no manual breakpoint, verified at mobile
(375px) and desktop widths.

## Elevation & Depth

**Still flat by design**, carried over from the prior system: no shadows
anywhere. The hero's atmosphere comes from layered radial gradients, not
elevation. The pill nav's `backdrop-filter: blur()` is a material effect
(translucency against whatever scrolls beneath it), not a shadow-based
depth cue — it's the one new material technique in this pass, used once,
for the one floating element that need it.

## Shapes

10px corner radius on content cards (up from the prior system's 6px — a
deliberate step toward the pinned reference's softer, rounder language).
999px (full pill) radius on the nav only — reserved for that one chrome
element, never used for content cards or buttons, so the pill reads as
navigation, not as a decorative shape repeated everywhere.

## Components

### Pill Nav (signature component, new)
- Sticky, full-pill radius, translucent structural-blue-deep background
  with backdrop blur, logo mark left, anchor links right.

### Hero (new)
- Full-bleed structural-blue gradient, centered content, mono tagline
  above a Space Grotesk H1, the project's actual finding stated in prose
  below it with both numbers in Measurement weight inline — never
  extracted into a stat-card grid (the direction contract named this
  explicitly to avoid the hero-metric-template default).

### Standard Banner (new)
- Flat structural-blue-deep, a bold statement (left, flex) beside a
  supporting paragraph (right, flex) — translates the pinned reference's
  "We value X" pattern directly onto PRODUCT.md's actual positioning.

### Principle / Concept Tile (new, signature)
- `paper-subtle` background, hairline border, 10px radius. A bold Space
  Grotesk statement/title with no label above it, then Ink-Secondary body
  text. The one component most directly shaped by the No-Kicker Rule.

### Evidence Card (unchanged from the prior system)
- Three variants (observed / verified / caution) exactly as before — see
  the Semantic Color Rule and Dashed-Border Rule, both carried forward
  intact across the world replacement.

### Structure Viewer (new, signature)
- A three-tab component: an interactive py3Dmol cartoon (real, rotatable,
  colored by mean DMS score per position), a 2D topology diagram generated
  from the structure's own HELIX/SHEET records, and a ChimeraX static-
  render slot that degrades honestly to a plain-text instruction card
  (paper-subtle, hairline border, no dramatization) when the renders don't
  yet exist — never a fake placeholder image.

### Navigation (tabs, unchanged from the prior accessibility pass)
- Active-tab Ink-on-white at 600 weight, Verified Teal underline, 44px
  minimum touch target, mobile fade-edge scroll cue, visible 2px Verified
  Teal focus ring.

## Do's and Don'ts

### Do:
- **Do** keep the structural blue committed at page scale (hero, banner,
  nav) — never scatter it as an accent on paper sections.
- **Do** keep every accent color (Verified Teal, Caution Amber) tied to
  evidentiary meaning, unchanged from the prior system.
- **Do** state a project finding in a real sentence with inline
  Measurement-weight numbers before reaching for a stat-card grid.
- **Do** let a bold statement carry its own weight — no label above it.

### Don't:
- **Don't** add a kicker/eyebrow label above any heading or card
  statement, however strongly a reference brief suggests one.
- **Don't** add a shadow anywhere — the system is flat by design.
- **Don't** use a dashed border for anything except "not test evidence."
- **Don't** fabricate a structural render or placeholder image when the
  real one isn't available yet — degrade to an honest text instruction
  instead (see the Structure Viewer's ChimeraX fallback).
- **Don't** put Verified Teal, Caution Amber, or the committed structural
  blue on an element that isn't doing one of their specific jobs.
