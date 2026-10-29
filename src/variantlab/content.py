"""Explanatory content surfaced in the dashboard, pulled verbatim in meaning
from docs/project_brief.md and PRODUCT.md's confirmed Product Principles —
no new claims invented for the redesign, only better-surfaced existing ones.
"""
from __future__ import annotations

# Translates PRODUCT.md's five confirmed Product Principles into the
# "what we care about" card pattern.
PRINCIPLES = [
    {
        "label": "HARDER NUMBER",
        "statement": "Report the number that hurts.",
        "body": "Every evaluation shows the easy split next to the hard one — "
                "never the flattering result alone.",
    },
    {
        "label": "VISUAL HONESTY",
        "statement": "Observed and predicted never look alike.",
        "body": "A measurement, a held-out prediction, and a refit-on-all-data "
                "prediction stay visually distinct everywhere, always.",
    },
    {
        "label": "SCOPED CLAIMS",
        "statement": "Say only what the data proves.",
        "body": "No cross-protein claims, no disease relevance, no mechanism "
                "beyond what this one assay can actually support.",
    },
    {
        "label": "REAL DATA",
        "statement": "Nothing here is synthetic.",
        "body": "Every score, every structure, every number traces back to a "
                "verified, cited, independently cross-checked source.",
    },
    {
        "label": "DEFENSIBLE",
        "statement": "Built to survive the question.",
        "body": "Every design and methodological choice is one its author can "
                "explain and justify without an AI assistant present.",
    },
]

# Translates project_brief.md Section 1 & 3 into the "understanding the
# science" concept-card pattern.
CONCEPTS = [
    {
        "label": "SUBSTITUTION",
        "title": "What a single mutation is",
        "body": "One amino acid at one of GB1's 55 positions is swapped for "
                "another — the smallest possible change to a protein's "
                "sequence, and the unit this entire project measures.",
    },
    {
        "label": "FOLD",
        "title": "Why position matters",
        "body": "A buried, tightly-packed core residue is far more likely to "
                "break folding than the same change at an exposed loop. "
                "The heatmap's horizontal dark bands mark exactly these "
                "structurally critical positions.",
    },
    {
        "label": "ASSAY",
        "title": "What was actually measured",
        "body": "GB1 was displayed via mRNA display and selected for IgG-Fc "
                "binding. The resulting score reflects both folding "
                "stability and binding affinity, conflated — a low score "
                "never implies instability alone.",
    },
    {
        "label": "SCALE",
        "title": "How deep mutational scanning works",
        "body": "Thousands of gene variants are pooled, selected together, "
                "and read out by how their relative abundance shifted "
                "before vs. after selection — a population-scale readout, "
                "not a single biochemical measurement.",
    },
    {
        "label": "DISTINCTION",
        "title": "Association vs. prediction vs. mechanism",
        "body": "A statistical pattern in the data is association. A "
                "model's held-out accuracy is prediction. Why a mutation "
                "hurts — misfolding vs. lost contact vs. backbone strain — "
                "is mechanism, and this project never claims it without "
                "independent structural evidence.",
    },
    {
        "label": "SCOPE",
        "title": "What this project does not claim",
        "body": "GB1 is a bacterial domain. Good performance here says "
                "nothing about any other protein, and nothing here "
                "generalizes to human disease variants.",
    },
]
