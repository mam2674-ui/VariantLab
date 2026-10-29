---
target: the homepage (app/dashboard.py)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/marcelomoraruiz/Coding/variantlab/app/dashboard.py"
target_fingerprint: "sha256:95a57537c171ceccfbb9d548073c6bed9ecbc2a72c0a116bdd5b617b1c4c4b15"
target_path: /Users/marcelomoraruiz/Coding/variantlab/app/dashboard.py
timestamp: 2026-10-28T21-29-00Z
slug: app-dashboard-py
---
Method: dual-agent (A: a70bcb874042ce640 · B: a2ee1af1962bb4ddd)
Detector note: standalone `impeccable detect` CLI could not run (no Chrome/Chromium/Edge/Brave on this machine); Assessment B substituted direct browser/DOM evidence instead.

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Streamlit's rerun indicator covers most changes; no custom feedback beyond it |
| 2 | Match System / Real World | 2 | Raw `None` in eval tables; snake_case labels shown as-is |
| 3 | User Control and Freedom | 3 | Low-stakes surface; selectors easy to change, no traps |
| 4 | Consistency and Standards | 3 | Internally consistent — but that sameness is itself issue #8 |
| 5 | Error Prevention | 3 | Dropdowns pre-filtered to valid combinations only |
| 6 | Recognition Rather Than Recall | 2 | No link from heatmap cell to Explorer pre-filled with that mutation |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, no shareable URL state for a mutation |
| 8 | Aesthetic and Minimalist Design | 2 | Clean whitespace, but core visual-distinction promise fails (P0) |
| 9 | Error Recovery | 3 | Clear warning on the one edge case; may be unreachable dead code |
| 10 | Help and Documentation | 1 | Doc references are plain text paths, not links |
| **Total** | | **23/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict
LLM (A): Content-specific but visually generic — copy is deeply authored, chrome is almost entirely Streamlit defaults. All rigor currently lives in words, none in the visual system.
Deterministic (B): Zero console errors, zero failed requests (69 requests, all 200 OK) across all 4 tabs — nothing broken, gaps are structural/visual.

## Overall Impression
Nothing broken; error-prevention genuinely well-built. But the page contradicts its own stated promise: PRODUCT.md and the Limitations tab both claim observed/held-out/refit values "stay visually distinct" — confirmed live that all three render identically except a hover-only tooltip on two of three. Biggest opportunity: no headline moment anywhere for the project's actual finding (ρ 0.878 → 0.405 across splits).

## What's Working
1. Metric tooltips (dashboard.py:104-117) carry genuinely rigorous methodological text — just hover-only, not glanceable.
2. Structurally-enforced error prevention — UI cannot offer a nonexistent mutation.
3. Limitations tab content is unusually candid and matches stated positioning precisely — only placement is the problem.

## Priority Issues

[P0] Observed/held-out/refit-on-all-data metrics are visually identical.
Why it matters: contradicts PRODUCT.md's hard constraint and the Limitations tab's own claim, which is currently false in the live render.
Fix: distinct, non-hover-dependent treatment per metric (neutral/confidence-color/outlined-flagged).
Suggested command: /impeccable colorize

[P1] Accessibility floor not met — four concrete WCAG failures (B's measurements).
- Active tab label contrast 3.30:1 (WCAG 1.4.3, needs 4.5:1)
- Keyboard focus outline present in CSS but outline-style:none, never renders (WCAG 2.4.7)
- Heading structure skips H2 everywhere, H1 to H3 (WCAG 1.3.1/2.4.6)
- Heatmap's only img has alt="0", non-descriptive placeholder (WCAG 1.1.1); color-only signal with no fallback
Why it matters: PRODUCT.md confirms this must hold up in live screen-share/demo with a default WCAG AA floor.
Suggested command: /impeccable audit, then /impeccable harden

[P1] No headline framing of the project's central finding.
What: the generalization-gap result (0.878 to 0.405+/-0.185) is one unstyled table row, easier number shown first.
Why it matters: PRODUCT.md requires "unattended-but-impressive" recruiter skim; nothing currently signals what's different about this project.
Fix: compact callout contrasting both numbers near the top — doubles as the hero element.
Suggested command: /impeccable shape

[P2] Doc cross-references are inert file paths, not links.
Three places point to docs/*.md as plain text — dead ends in a deployed/screen-share demo.
Suggested command: /impeccable harden

[P2] Mobile tab bar overflows with no scroll affordance; undersized touch targets.
Tab strip is scrollable (not a dead end) but has zero visible cue; 4th tab (Limitations) invisible on first mobile load. Touch targets: tabs 40px, fullscreen icon 22x22px, kebab 28x28px, Deploy 28px tall — all below 44x44 minimum.
Suggested command: /impeccable layout

## Persona Red Flags
Alex (Power User): one lookup is fast, but exploratory use is punished — no shortcuts, no shareable URL, no comparison view, confirmed scroll-reset to top after selectbox change.
Sam (Accessibility-dependent): heatmap signal is color-only with no fallback; focus-visible confirmed suppressed via CSS; the one protective explanation (observed vs predicted) lives only in hover tooltips on 2 of 3 metrics.
Jordan/Casey (recruiter first impression): opens into a dense matrix with no orienting headline; doc links do nothing; mobile users may never discover the Limitations tab exists.

## Minor Observations
- Raw Python None renders literally in 4 eval-table cells (statistically correct, reads as a bug).
- "DMS_score" and "MAE" never expanded in-UI for a non-specialist skimmer.
- Heatmap is a fixed-size static image, ~3 full scroll-screens on desktop.
- Streamlit's native Deploy chrome visible top-right — expected given fixed stack, undercuts "custom portfolio piece" feel.
- False positives to ignore: 0x0px dataframe toolbar buttons are a Streamlit hover-reveal artifact, not real 0px targets; all 4 tabpanels existing simultaneously in the DOM is normal st.tabs() behavior.

## Questions to Consider
- If a recruiter gives this 10 seconds, what's the one sentence that should greet them first?
- Should the observed-vs-predicted distinction be enforced by color/shape instead of hover-text alone?
- Would a single static screenshot still communicate what's distinctive about VariantLab?
