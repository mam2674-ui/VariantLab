---
version: 1
slug: "app-dashboard-py"
primary_target: "app/dashboard.py"
related_targets: []
---

## Scope and visitor mode

Primary surface: app/dashboard.py (VariantLab's only UI). Mode: Persuade for
the new hero/banner/principles layer, Operate for the existing data-tool body
(heatmap, explorer, eval tables) which it wraps. User-pinned redesign
replacing the just-shipped "Lab Notebook" system.

## Audience, job, action, proof, constraints

Audience: a recruiter/interviewer skimming on a laptop (seconds), and the
author rehearsing defending the work (minutes, deep). Job: believe this is
real, rigorous computational biology, not a toy. Action: scroll, then try a
mutation. Proof: the real GB1 crystal structure (1PGB, verified), the real
ρ 0.88→0.41 generalization gap, the real evidence-card distinction. Constraints:
no fabricated team/customers/claims; GB1 is bacterial, no disease framing;
stack stays Python/Streamlit; existing data pipeline/tests untouched.

## Direction contract

**THESIS:** A biotech company's confident "meet the team, here's our
standard" page, re-authored around what VariantLab actually has instead of
people: real structural and statistical evidence. The category default this
refuses: the flat, uniform-card data-dashboard look most portfolio ML
projects ship (which the "Lab Notebook" pass itself was closer to) — this
surface instead opens with atmosphere and a stated standard, the way a
serious science company opens its culture, not its data.

**OWN-WORLD:** Committed deep structural-blue (#1a3a5c-family) carrying the
hero and banner sections at page scale, on warm paper elsewhere. A
soft radial glow gradient (evoking fluorescence/cryo-EM imaging, not literal
sky) behind the hero headline. Bold rounded display face (Space Grotesk) for
headlines, kept distinct from the body/data face. A floating pill-shaped
sticky nav. Rounded-square cards in a grid for both the "principles" section
(translating Until's team-photo grid into VariantLab's five confirmed
Product Principles) and a new "concepts" section (translating it into
protein-biology explainer cards). The functional evidence-card semantics
(verified teal / caution amber / neutral ink) carry over unchanged — they
encode real epistemic meaning, not decoration, and the world change doesn't
touch what they mean.

**STORY:** Visitor lands on an atmospheric, confident opening that states
VariantLab's actual standard ("we report the harder number") the way Until
states its hiring standard. Scrolls through principle cards (real, from
PRODUCT.md) and concept cards (real biology, from docs/project_brief.md).
Reaches the structural section: an interactive 3D viewer of the real,
verified GB1 crystal structure colored by mutation fitness, a 2D topology
diagram derived from that same structure's own HELIX/SHEET records, and
(once available) static ChimeraX renders. Then the existing heatmap/explorer/
eval tool, now subordinate sections rather than the whole page.

**FIRST VIEWPORT:** Full-bleed deep-blue gradient hero, floating pill nav at
top (logo mark + anchor links + nothing decorative), a small monospace
parenthetical tagline above a huge bold "Does sequence predict a mutation's
fate?"-class headline, the ρ 0.88→0.41 finding stated in one sentence below
it in lighter weight, all centered, filling the first screen the way Until's
"Our Team" hero does.

**FORM:** User-pinned (untillabs.com/our-team), not rolled. seed: none
(unavailable — pinned direction, concept-seed not run).

**FINISH:** unreviewed and undocumented is unfinished; this build ends with
the finish review, the verdict, DESIGN.md, and every shipping raster
carrying its provenance.

## Unresolved decisions

- Exact gradient hex stops (resolve during build, from the structural-blue
  family).
- Whether ChimeraX static renders ship in this pass or a follow-up (depends
  on install completing + scripting working).
