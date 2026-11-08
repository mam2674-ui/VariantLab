"""VariantLab dashboard: explore single-mutant fitness data, verified protein
structures, and model predictions, for any protein defined in proteins.py.

Run from the project root: streamlit run app/dashboard.py
"""
from __future__ import annotations

import base64
import io
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

from variantlab.content import CONCEPTS, PRINCIPLES
from variantlab.features import AA_LIST, build_features
from variantlab.proteins import GB1, PAB1, PROTEINS
from variantlab.structure_viz import build_3d_view, per_position_summary, plot_2d_topology

st.set_page_config(page_title="VariantLab", layout="wide")

STRUCTURE_RENDER_DIR = Path(__file__).resolve().parents[1] / "data" / "processed" / "structure_renders"

# --------------------------------------------------------------------------
# Design system v2 — "Until We Know" world. Committed structural blue at
# page scale (hero + banner), warm paper between. Space Grotesk for display,
# IBM Plex Sans for body, IBM Plex Mono reserved for measured values only.
# See DESIGN.md and .impeccable/surfaces/app-dashboard-py.md for the full
# direction contract.
# --------------------------------------------------------------------------
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

    :root {
        --ink: #14171a;
        --ink-secondary: #52585e;
        --paper: #ffffff;
        --paper-subtle: #f6f4f1;
        --hairline: #d9d4cb;
        --structural-blue-deep: #0d1f3c;
        --structural-blue: #1c3f6e;
        --structural-blue-light: #3f6ea8;
        --on-blue: #eef3fa;
        --on-blue-secondary: #aebedb;
        --accent-verified: #0b6e62;
        --accent-verified-bg: #eaf4f2;
        --accent-caution: #9a5b12;
        --accent-caution-bg: #faf2e6;
        --accent-predicted: #5b3f9a;
        --accent-predicted-bg: #f1ecfa;
    }

    html, body, [class*="css"] { font-family: 'IBM Plex Sans', sans-serif; }
    code, .vlab-mono { font-family: 'IBM Plex Mono', monospace; }
    .vlab-display { font-family: 'Space Grotesk', sans-serif; }

    #MainMenu, footer, header[data-testid="stHeader"] { visibility: hidden; height: 0; }
    .block-container { padding-top: 0 !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }

    *:focus-visible {
        outline: 2px solid var(--accent-verified) !important;
        outline-offset: 2px !important;
    }

    [data-baseweb="tab-list"] button[aria-selected="true"] p { color: var(--ink) !important; font-weight: 600 !important; }
    [data-baseweb="tab-highlight"] { background-color: var(--accent-verified) !important; height: 3px !important; }
    [data-baseweb="tab-list"] button[aria-selected="false"] p { color: var(--ink-secondary) !important; }
    [data-baseweb="tab-list"] {
        -webkit-mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
        mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
    }
    [data-baseweb="tab-list"] button { min-height: 44px; }

    /* ---- Pill nav ---- */
    .vlab-nav {
        position: sticky; top: 0.9rem; z-index: 999;
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; max-width: 980px; margin: 0.9rem auto 0 auto;
        background: rgba(13, 31, 60, 0.82); backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 999px; padding: 0.6rem 0.6rem 0.6rem 1.1rem;
        box-shadow: 0 10px 30px rgba(13,31,60,0.25);
    }
    .vlab-nav .vlab-logo { color: var(--on-blue); font-weight: 700; font-size: 0.95rem; white-space: nowrap; }
    .vlab-nav .vlab-links { display: flex; gap: 1.1rem; flex-wrap: wrap; }
    .vlab-nav .vlab-links a {
        color: var(--on-blue-secondary); text-decoration: none; font-size: 0.82rem; font-weight: 500;
    }
    .vlab-nav .vlab-links a:hover { color: var(--on-blue); }

    /* ---- Protein switcher ---- */
    div[data-testid="stHorizontalBlock"] div[role="radiogroup"] {
        background: var(--paper-subtle); border: 1px solid var(--hairline);
        border-radius: 999px; padding: 0.3rem; display: inline-flex; gap: 0.2rem;
    }
    div[role="radiogroup"] label {
        border-radius: 999px !important; padding: 0.3rem 0.9rem !important; margin: 0 !important;
    }

    /* ---- Hero ---- */
    .vlab-hero {
        position: relative; overflow: hidden;
        padding: 2rem 1.5rem 4rem 1.5rem; margin-top: -1.5rem;
        background:
            radial-gradient(ellipse 70% 55% at 30% 15%, rgba(63,110,168,0.55), transparent 60%),
            radial-gradient(ellipse 60% 50% at 75% 75%, rgba(11,110,98,0.30), transparent 60%),
            linear-gradient(170deg, var(--structural-blue-deep) 10%, var(--structural-blue) 100%);
        text-align: center;
    }
    .vlab-hero .vlab-tagline {
        font-family: 'IBM Plex Mono', monospace; color: var(--on-blue-secondary);
        font-size: 0.82rem; letter-spacing: 0.02em; margin: 2.5rem 0 1.4rem 0;
    }
    .vlab-hero h1 {
        font-family: 'Space Grotesk', sans-serif; font-weight: 700;
        font-size: clamp(2.2rem, 4.4vw, 3.6rem); letter-spacing: -0.02em; line-height: 1.08;
        color: var(--on-blue); max-width: 20ch; margin: 0 auto 1.3rem auto;
    }
    .vlab-hero .vlab-finding {
        color: var(--on-blue-secondary); font-size: 1.1rem; line-height: 1.6;
        max-width: 62ch; margin: 0 auto;
    }
    .vlab-hero .vlab-finding .vlab-num { font-family: 'IBM Plex Mono', monospace; font-weight: 600; color: var(--on-blue); }

    /* ---- Standard banner ---- */
    .vlab-banner {
        background: var(--structural-blue-deep); color: var(--on-blue);
        padding: 2.6rem 1.5rem; display: flex; gap: 2.5rem; flex-wrap: wrap;
        align-items: flex-start; justify-content: center;
    }
    .vlab-banner h2 {
        font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(1.6rem, 2.6vw, 2.1rem);
        max-width: 16ch; margin: 0; flex: 1 1 320px;
    }
    .vlab-banner p { color: var(--on-blue-secondary); max-width: 46ch; line-height: 1.6; flex: 1 1 340px; margin: 0; }

    /* ---- Content wrapper (everything on paper) ---- */
    .vlab-content { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }
    .vlab-section-heading {
        font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--ink);
        font-size: clamp(1.4rem, 2.2vw, 1.8rem); margin: 3rem 0 0.5rem 0;
    }
    .vlab-section-sub { color: var(--ink-secondary); max-width: 70ch; line-height: 1.6; margin: 0 0 1.5rem 0; }

    .vlab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.9rem; margin-bottom: 1rem; }
    .vlab-tile {
        background: var(--paper-subtle); border: 1px solid var(--hairline); border-radius: 10px;
        padding: 1.2rem 1.3rem;
    }
    .vlab-tile .vlab-tile-statement {
        font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: var(--ink);
        font-size: 1.05rem; line-height: 1.3; margin-bottom: 0.5rem;
    }
    .vlab-tile .vlab-tile-title {
        font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: var(--structural-blue);
        font-size: 1.02rem; line-height: 1.3; margin-bottom: 0.5rem;
    }
    .vlab-tile p { color: var(--ink-secondary); font-size: 0.9rem; line-height: 1.55; margin: 0; }

    .vlab-cards { display: flex; gap: 0.9rem; flex-wrap: wrap; margin: 0.75rem 0 0.25rem 0; }
    .vlab-card { flex: 1 1 220px; padding: 0.9rem 1.05rem; border-radius: 10px; background: var(--paper-subtle); border: 1px solid var(--hairline); }
    .vlab-card .vlab-label { font-size: 0.78rem; color: var(--ink-secondary); margin-bottom: 0.35rem; }
    .vlab-card .vlab-value { font-family: 'IBM Plex Mono', monospace; font-size: 1.5rem; font-weight: 600; color: var(--ink); }
    .vlab-card .vlab-note { font-size: 0.78rem; color: var(--ink-secondary); margin-top: 0.4rem; line-height: 1.45; }
    .vlab-card--verified { background: var(--accent-verified-bg); border-color: var(--accent-verified); }
    .vlab-card--verified .vlab-value { color: var(--accent-verified); }
    .vlab-card--caution { background: var(--accent-caution-bg); border: 1px dashed var(--accent-caution); }
    .vlab-card--caution .vlab-value { color: var(--accent-caution); }
    .vlab-card--caution .vlab-note { font-weight: 500; }

    .vlab-structure-note {
        background: var(--paper-subtle); border: 1px solid var(--hairline); border-radius: 10px;
        padding: 1rem 1.2rem; color: var(--ink-secondary); font-size: 0.88rem; line-height: 1.55; margin: 1rem 0;
    }
    .vlab-predicted-note {
        background: var(--accent-predicted-bg); border: 1px dashed var(--accent-predicted); border-radius: 10px;
        padding: 0.9rem 1.1rem; color: var(--ink); font-size: 0.85rem; line-height: 1.55; margin: 0.75rem 0;
    }
    </style>

    <div class="vlab-nav">
        <div class="vlab-logo vlab-display">VariantLab</div>
        <div class="vlab-links">
            <a href="#principles">Standard</a>
            <a href="#concepts">Science</a>
            <a href="#structure">Structure</a>
            <a href="#explore">Explore</a>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


@st.cache_data
def load_predictions(protein_slug: str) -> pd.DataFrame:
    return pd.read_csv(PROTEINS[protein_slug].predictions_csv_path)


@st.cache_data
def load_eval_results(protein_slug: str) -> dict:
    with open(PROTEINS[protein_slug].eval_results_path) as f:
        return json.load(f)


def fig_to_html_img(fig, alt_text: str, style: str = "max-width:100%; height:auto;") -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f'<img src="data:image/png;base64,{encoded}" alt="{alt_text}" style="{style}" />'


def fmt_rho(value) -> str:
    return "n/a (constant predictor)" if value is None else f"{value:.3f}"


# ------------------------------------------------------------- Protein switch
qp = st.query_params
qp_protein = qp.get("protein", "gb1")
if qp_protein not in PROTEINS:
    qp_protein = "gb1"

PROTEIN_ORDER = ["gb1", "pab1", "tem1", "gfp"]

st.markdown('<div style="text-align:center; margin: 1rem 0 0.5rem 0;">', unsafe_allow_html=True)
protein_slug = st.radio(
    "Protein", options=PROTEIN_ORDER,
    format_func=lambda s: PROTEINS[s].display_name.split(" (")[0],
    index=PROTEIN_ORDER.index(qp_protein),
    horizontal=True, label_visibility="collapsed",
)
st.markdown("</div>", unsafe_allow_html=True)
st.query_params["protein"] = protein_slug

protein = PROTEINS[protein_slug]
n_positions = len(protein.reference_sequence)

df = load_predictions(protein_slug)
eval_results = load_eval_results(protein_slug)

RHO_EASY = eval_results["setting_a_with_position"]["random_forest"]["spearman_rho"]
RHO_HARD = eval_results["setting_b_position_groupkfold"]["random_forest"]["spearman_rho_mean"]
RHO_HARD_STD = eval_results["setting_b_position_groupkfold"]["random_forest"]["spearman_rho_std"]

N_SINGLE = len(df)
N_POSSIBLE = n_positions * 19
SATURATION_PCT = 100 * N_SINGLE / N_POSSIBLE

# --------------------------------------------------------------------- Hero
st.markdown(
    f"""
    <div class="vlab-hero">
        <div class="vlab-tagline">( one protein. one assay. the honest number. )</div>
        <h1>Does sequence alone predict a mutation's fate?</h1>
        <p class="vlab-finding">
            On <strong>{protein.display_name}</strong>, a Random Forest trained on simple
            physicochemical features reaches
            <span class="vlab-num">ρ = {RHO_EASY:.2f}</span> on substitutions at
            positions it has already seen — and only
            <span class="vlab-num">ρ = {RHO_HARD:.2f} ± {RHO_HARD_STD:.2f}</span>
            on positions it has never seen at all. This project reports both
            numbers, not just the flattering one.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ------------------------------------------------------------------ Banner
st.markdown(
    f"""
    <div class="vlab-banner">
        <h2 class="vlab-display">We report the harder number.</h2>
        <p>
            {protein.first_author} et al. ({protein.year}) measured {N_SINGLE:,} of the
            {N_POSSIBLE:,} possible single substitutions in {protein.display_name} by
            {protein.assay_description}. Everything below is built on that one verified,
            cited dataset and the protein's real structure — not a synthetic stand-in,
            and never dressed up as more certain than the splits actually show.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown('<div class="vlab-content">', unsafe_allow_html=True)

with st.expander("Dataset, provenance, and methodology details"):
    st.markdown(
        f"""
- **{N_SINGLE:,} of {N_POSSIBLE:,} possible single substitutions** ({n_positions} positions ×
  19 amino acids) — {"fully saturated, no missing combinations" if N_SINGLE == N_POSSIBLE else f"{SATURATION_PCT:.1f}% coverage; this assay's library was not fully saturating"}.
- **Source:** {protein.first_author} et al. ({protein.year}), *{protein.journal_citation}*.
- **License & redistribution:** sourced via ProteinGym (MIT-licensed codebase);
  the underlying measurements follow the original publication's terms — used
  here for non-commercial, educational/portfolio analysis with full citation.
- **What the assay actually measures:** {protein.assay_description}.
  {protein.assay_caveat}
- **"Large effect" positions** use this assay's own documented binarization
  cutoff (`{protein.large_effect_cutoff}`), not an invented threshold.
- **Structure:** {protein.structure_source}.
  {"⚠️ This is a **predicted** model, not an experimentally determined structure — see docs/structure_provenance.md for why, and for the per-residue confidence check." if protein.structure_is_predicted else ""}
- No claim of clinical, therapeutic, or disease relevance is made anywhere —
  this project does not extrapolate to human variant interpretation.
        """
    )

# -------------------------------------------------------------- Principles
st.markdown('<div id="principles" class="vlab-section-heading vlab-display">What this project holds itself to</div>', unsafe_allow_html=True)
st.markdown('<p class="vlab-section-sub">Five standards that shaped every decision in this build — confirmed in PRODUCT.md before a line of code was written.</p>', unsafe_allow_html=True)

principle_tiles = "".join(
    f"""<div class="vlab-tile">
        <div class="vlab-tile-statement vlab-display">{p['statement']}</div>
        <p>{p['body']}</p>
    </div>""" for p in PRINCIPLES
)
st.markdown(f'<div class="vlab-grid">{principle_tiles}</div>', unsafe_allow_html=True)

# --------------------------------------------------------------- Concepts
st.markdown('<div id="concepts" class="vlab-section-heading vlab-display">Understanding the science</div>', unsafe_allow_html=True)
st.markdown('<p class="vlab-section-sub">The biology and statistics behind every number on this page, pulled from this project\'s own written methodology.</p>', unsafe_allow_html=True)

# SUBSTITUTION, ASSAY, and SCOPE are protein-specific templates; SCALE and
# DISTINCTION are genuine general biology/statistics, unchanged per protein.
protein_short_name = protein.display_name.split(" (")[0]
organism_clause = f"{protein_short_name} originates from {protein.organism}."
template_fill = {
    "protein": protein_short_name,
    "n_positions": n_positions,
    "assay_description": protein.assay_description[0].upper() + protein.assay_description[1:],
    "assay_caveat": protein.assay_caveat,
    "organism_clause": organism_clause,
}
concepts_for_protein = [
    {**c, "body": c["body"].format(**template_fill)} for c in CONCEPTS
]

concept_tiles = "".join(
    f"""<div class="vlab-tile">
        <div class="vlab-tile-title vlab-display">{c['title']}</div>
        <p>{c['body']}</p>
    </div>""" for c in concepts_for_protein
)
st.markdown(f'<div class="vlab-grid">{concept_tiles}</div>', unsafe_allow_html=True)

# -------------------------------------------------------------- Structure
st.markdown('<div id="structure" class="vlab-section-heading vlab-display">The verified structure</div>', unsafe_allow_html=True)
st.markdown(
    f'<p class="vlab-section-sub">{protein.structure_source}. The reference-sequence mapping '
    'onto this structure is independently verified position by position in '
    '<code>docs/structure_provenance.md</code>. Colored by each position\'s mean observed DMS score.</p>',
    unsafe_allow_html=True,
)
if protein.structure_is_predicted:
    st.markdown(
        '<div class="vlab-predicted-note">⚠️ <strong>Predicted structure, not experimental.</strong> '
        'No comparable experimental structure of this domain exists (the only alternative on file is '
        'a 4.8 Å cryo-EM structure of a large multi-protein complex). This AlphaFold model was chosen '
        'because its per-residue confidence is independently verified high in exactly this domain — '
        'see docs/structure_provenance.md for the actual pLDDT numbers, not just an assertion.</div>',
        unsafe_allow_html=True,
    )

position_summary = per_position_summary(df)

tab_3d, tab_2d, tab_chimerax = st.tabs(["Interactive 3D", "2D topology diagram", "ChimeraX renders"])

with tab_3d:
    st.caption("Drag to rotate, scroll to zoom. Cartoon colored by mean DMS score per position (RdBu_r scale — red = more fit, blue = less fit)."
               + (f" Domain position(s) {', '.join(str(p) for p in sorted(protein.unmapped_domain_positions))} (no verified structural match, see provenance) render neutral gray." if protein.unmapped_domain_positions else ""))
    view = build_3d_view(protein, position_summary)
    components.html(view._make_html(), height=540)

with tab_2d:
    st.caption(f"A 2D topology diagram built from {protein.secondary_structure[0].source if protein.secondary_structure else 'the structure'} (not a generic cartoon).")
    fig = plot_2d_topology(protein, position_summary)
    alt = (
        f"2D topology diagram of {protein.display_name}'s secondary structure, "
        "colored by mean DMS score per position."
    )
    st.markdown(fig_to_html_img(fig, alt), unsafe_allow_html=True)

with tab_chimerax:
    chimerax_3d = STRUCTURE_RENDER_DIR / f"{protein.slug}_3d_view.png"
    chimerax_2d = STRUCTURE_RENDER_DIR / f"{protein.slug}_2d_flat_view.png"
    if chimerax_3d.exists() and chimerax_2d.exists():
        st.caption("Rendered with real UCSF ChimeraX, colored by the same mean-DMS-score scale as the interactive view above.")
        c1, c2 = st.columns(2)
        c1.image(str(chimerax_3d), caption="3D angled cartoon view")
        c2.image(str(chimerax_2d), caption="Rotated flat view")
    else:
        st.markdown(
            f"""
            <div class="vlab-structure-note">
            UCSF ChimeraX 1.12 is installed on this machine, and
            <code>scripts/render_chimerax.cxc</code> is ready to run — but this
            dashboard process has no GUI/WindowServer access to drive ChimeraX's
            renderer headlessly (confirmed: no OSMesa software-rendering library
            is bundled with this build, and no Homebrew is available to install
            one). Static ChimeraX renders are therefore not auto-generated here.
            <br><br>
            To produce them yourself (one command, from a real Terminal window):
            <br>
            <code class="vlab-mono">cd ~/Coding/variantlab &amp;&amp; /Applications/ChimeraX-1.12.app/Contents/MacOS/ChimeraX scripts/render_chimerax_{protein.slug}.cxc</code>
            <br><br>
            Re-run the dashboard afterward and this tab will show them automatically.
            </div>
            """,
            unsafe_allow_html=True,
        )

st.markdown(f'<div id="explore" class="vlab-section-heading vlab-display">Explore the data</div>', unsafe_allow_html=True)
st.markdown(f'<p class="vlab-section-sub">The underlying tool: every one of the {N_SINGLE:,} measurements, a mutation-by-mutation explorer, and the full model evaluation.</p>', unsafe_allow_html=True)

tab_heatmap, tab_explorer, tab_eval, tab_limits = st.tabs(
    ["Mutation heatmap", "Mutation explorer", "Model evaluation", "What this does and doesn't show"]
)

# ---------------------------------------------------------------- Heatmap tab
with tab_heatmap:
    st.header("Experimental fitness heatmap")
    st.write(
        "Every cell is an **observed** experimental measurement (`DMS_score`), not "
        "a prediction. The color scale alone compresses fine distinctions for "
        "colorblind viewers; the **Mutation explorer** tab gives the same data "
        "as exact numeric values per mutation."
    )
    pivot = df.pivot(index="position", columns="new_aa", values="dms_score").reindex(columns=AA_LIST)
    hm_fig, ax = plt.subplots(figsize=(9, max(6, n_positions * 0.16)))
    im = ax.imshow(pivot.values, aspect="auto", cmap="RdBu_r")
    ax.set_xticks(range(len(AA_LIST)))
    ax.set_xticklabels(AA_LIST)
    ax.set_yticks(range(0, n_positions, 5))
    ax.set_yticklabels(range(1, n_positions + 1, 5))
    ax.set_xlabel("substituted amino acid")
    ax.set_ylabel(f"{protein.display_name.split(' (')[0]} domain position (1-{n_positions})")
    hm_fig.colorbar(im, ax=ax, label="DMS score (higher = more fit)")
    alt = (
        f"Heatmap of {protein.display_name} single-mutant fitness scores: {n_positions} domain "
        "positions (rows) by 19 substituted amino acids (columns), colored by DMS score."
    )
    st.markdown(fig_to_html_img(hm_fig, alt), unsafe_allow_html=True)

# --------------------------------------------------------- Mutation explorer
with tab_explorer:
    st.header("Select a supported single substitution")
    st.write(
        "Only single amino-acid substitutions that exist in this deep "
        "mutational scan can be selected — this project does not extrapolate "
        "to mutation formats outside that scope (e.g. double mutants, indels, "
        "other proteins)."
    )

    qp_position_raw = qp.get("position", "1")
    qp_position = int(qp_position_raw) if str(qp_position_raw).isdigit() else 1
    qp_position = qp_position if 1 <= qp_position <= n_positions else 1

    col1, col2 = st.columns(2)
    with col1:
        position = st.selectbox(
            f"Position (1-{n_positions})", options=list(range(1, n_positions + 1)),
            index=qp_position - 1,
        )
    wt_aa = protein.reference_sequence[position - 1]
    st.write(f"Wild-type residue at position {position}: **{wt_aa}**")

    available_subs = sorted(df.loc[df["position"] == position, "new_aa"].unique())
    qp_aa = qp.get("aa", available_subs[0] if available_subs else "A")
    aa_index = available_subs.index(qp_aa) if qp_aa in available_subs else 0
    with col2:
        if available_subs:
            new_aa = st.selectbox("Substituted amino acid", options=available_subs, index=aa_index)
        else:
            new_aa = None
            st.selectbox("Substituted amino acid", options=["(none observed at this position)"], disabled=True)

    st.query_params["position"] = str(position)
    if new_aa:
        st.query_params["aa"] = new_aa
    st.caption("This selection is reflected in the page URL — copy the link to share this exact mutation.")

    row = df[(df["position"] == position) & (df["new_aa"] == new_aa)] if new_aa else pd.DataFrame()
    if row.empty:
        st.warning(
            "This substitution is not present in the dataset "
            "(outside observed data coverage) — no observation or prediction "
            "is available for it."
        )
    else:
        row = row.iloc[0]
        st.subheader(f"{wt_aa}{position}{new_aa}")

        st.markdown(
            f"""
            <div class="vlab-cards">
                <div class="vlab-card">
                    <div class="vlab-label">Observed DMS score</div>
                    <div class="vlab-value">{row['dms_score']:.3f}</div>
                    <div class="vlab-note">Measured directly in the {protein.first_author} et al. assay.</div>
                </div>
                <div class="vlab-card vlab-card--verified">
                    <div class="vlab-label">Held-out-position prediction</div>
                    <div class="vlab-value">{row['held_out_position_prediction']:.3f}</div>
                    <div class="vlab-note">Genuine generalization evidence — trained with this
                    mutation's entire position excluded (GroupKFold fold {int(row['held_out_fold'])}).</div>
                </div>
                <div class="vlab-card vlab-card--caution">
                    <div class="vlab-label">Refit-on-all-data prediction</div>
                    <div class="vlab-value">{row['refit_on_all_data_prediction']:.3f}</div>
                    <div class="vlab-note">Not test evidence — this model was trained on every
                    row including this one. Shown only to inspect the deployable model's output.</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("**Feature values for this mutation**")
        feat_row = build_features(
            pd.DataFrame([{"orig_aa": wt_aa, "position": position, "new_aa": new_aa}]),
            reference_sequence=protein.reference_sequence,
        ).iloc[0]
        display_feats = feat_row[[c for c in feat_row.index if not c.startswith(("orig_is_", "new_is_"))]]
        st.dataframe(display_feats.rename("value").to_frame())

# ------------------------------------------------------------------ Eval tab
with tab_eval:
    st.header("Model evaluation (identical splits across models)")

    st.subheader("Setting A — held-out substitutions at represented positions")
    st.caption("Random 70/15/15 split. Every test position was seen (with other substitutions) in training. Tests narrow generalization.")
    rows = []
    for label, key in [("with raw position feature", "setting_a_with_position"),
                        ("without raw position feature", "setting_a_without_position")]:
        res = eval_results[key]
        for model in ["mean_baseline", "ridge", "random_forest"]:
            m = res[model]
            rows.append({"feature set": label, "model": model,
                         "spearman_rho": fmt_rho(m["spearman_rho"]), "mae": f"{m['mae']:.3f}"})
    st.dataframe(pd.DataFrame(rows), hide_index=True)
    st.caption(
        "Comparing the 'with' vs 'without raw position feature' rows shows how much "
        "of the model's apparent accuracy comes from memorizing position-specific "
        "fitted values rather than learning substitution chemistry. 'n/a (constant "
        "predictor)' marks the mean baseline, where rank correlation is mathematically "
        "undefined because every prediction is identical."
    )

    st.subheader("Setting B — held-out positions (5-fold GroupKFold)")
    st.caption("Entire positions withheld from training. Tests generalization to unseen positions — the harder, more honest test.")
    rows_b = []
    for model in ["mean_baseline", "ridge", "random_forest"]:
        m = eval_results["setting_b_position_groupkfold"][model]
        rows_b.append({
            "model": model,
            "spearman_rho_mean": fmt_rho(m["spearman_rho_mean"]),
            "spearman_rho_std": "n/a" if m["spearman_rho_std"] is None else f"{m['spearman_rho_std']:.3f}",
            "mae_mean": f"{m['mae_mean']:.3f}",
            "mae_std": f"{m['mae_std']:.3f}",
        })
    st.dataframe(pd.DataFrame(rows_b), hide_index=True)
    st.caption(
        "Note the wide fold-to-fold spread: positions within a fold are correlated "
        "(several substitutions from the same position land in the same fold), so "
        "treat these as noisy estimates, not precise numbers."
    )

    st.subheader("Cross-protein comparison")
    st.write(
        "The identical pipeline (same features, same models, same two split settings) "
        "run on all four proteins. Every number below is real and unselected — nothing "
        "here was cherry-picked to make a cleaner story."
    )
    cross_rows = []
    for slug in PROTEIN_ORDER:
        p = PROTEINS[slug]
        r = load_eval_results(slug)["setting_b_position_groupkfold"]["random_forest"]
        cross_rows.append({
            "protein": p.display_name.split(" (")[0],
            "n single mutants": len(load_predictions(slug)),
            "assay type": p.assay_description.split(" -- ")[0].split(",")[0][:40],
            "Setting B ρ (held-out positions)": fmt_rho(r["spearman_rho_mean"]),
        })
    st.dataframe(pd.DataFrame(cross_rows), hide_index=True)
    st.write(
        "No consistent pattern by assay type or protein size is visible across just "
        "four proteins — and four data points is nowhere near enough to conclude one "
        "exists. This table exists to make that honestly checkable, not to claim a trend."
    )

# --------------------------------------------------------------- Limits tab
with tab_limits:
    st.header("What this dashboard does and doesn't show")
    st.markdown(
        f"""
- **Observed vs. predicted are always visually separated** (see the Mutation
  Explorer tab's three distinctly-colored cards) — a prediction is never
  presented as if it were a measurement.
- **Setting B (held-out positions) is the only honest generalization test**
  shown per-mutation here; the "refit on all data" number is for inspection
  of the deployable model only, never for judging accuracy.
- **Good performance on one protein says nothing about another.** This
  dashboard now covers two proteins precisely to make that point concrete
  rather than asserted — see the cross-protein comparison in the Model
  Evaluation tab. It still says nothing about any protein beyond these two.
- **{protein.display_name}:** {protein.assay_caveat}
- **No claim of clinical, therapeutic, or disease relevance is made or
  implied anywhere in this project.** Nothing here generalizes to human
  disease variants.
- **"Large effect" positions** are defined using each assay's own documented
  binarization cutoff, not a universal biological threshold.
- **Structural proximity is a hypothesis generator, not proof of mechanism**
  (see `docs/structure_provenance.md`): a sensitive position's location in
  3D space is consistent with several explanations (core packing, binding
  interface, backbone geometry) and this project does not pick one.
  {"**This structure is predicted, not experimental** — treat the 3D/2D views as a well-justified best estimate, not ground truth geometry." if protein.structure_is_predicted else ""}
        """
    )

st.markdown("</div>", unsafe_allow_html=True)
