"""VariantLab dashboard: explore GB1 single-mutant fitness data, the verified
protein structure, and model predictions.

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
from variantlab.data_prep import PROCESSED_DIR, REFERENCE_SEQUENCE
from variantlab.features import AA_LIST, build_features
from variantlab.structure_viz import build_3d_view, per_position_summary, plot_2d_topology

st.set_page_config(page_title="VariantLab — GB1", layout="wide")

STRUCTURE_RENDER_DIR = Path(__file__).resolve().parents[1] / "data" / "processed" / "structure_renders"

# --------------------------------------------------------------------------
# Design system v2 — "Until We Know" world (redesign, replacing the Lab
# Notebook system). Committed structural blue at page scale (hero + banner),
# warm paper between. Space Grotesk for display, IBM Plex Sans for body, IBM
# Plex Mono still reserved for measured values only (that rule survives the
# world change). See DESIGN.md and .impeccable/surfaces/app-dashboard-py.md
# for the full direction contract.
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

    /* ---- Hero ---- */
    .vlab-hero {
        position: relative; overflow: hidden;
        padding: 3.5rem 1.5rem 4rem 1.5rem; margin-top: -3.2rem;
        background:
            radial-gradient(ellipse 70% 55% at 30% 15%, rgba(63,110,168,0.55), transparent 60%),
            radial-gradient(ellipse 60% 50% at 75% 75%, rgba(11,110,98,0.30), transparent 60%),
            linear-gradient(170deg, var(--structural-blue-deep) 10%, var(--structural-blue) 100%);
        text-align: center;
    }
    .vlab-hero .vlab-tagline {
        font-family: 'IBM Plex Mono', monospace; color: var(--on-blue-secondary);
        font-size: 0.82rem; letter-spacing: 0.02em; margin: 4.5rem 0 1.4rem 0;
    }
    .vlab-hero h1 {
        font-family: 'Space Grotesk', sans-serif; font-weight: 700;
        font-size: clamp(2.2rem, 4.4vw, 3.6rem); letter-spacing: -0.02em; line-height: 1.08;
        color: var(--on-blue); max-width: 18ch; margin: 0 auto 1.3rem auto;
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
def load_predictions() -> pd.DataFrame:
    return pd.read_csv(PROCESSED_DIR / "predictions.csv")


@st.cache_data
def load_eval_results() -> dict:
    with open(PROCESSED_DIR / "eval_results.json") as f:
        return json.load(f)


def fig_to_html_img(fig, alt_text: str, style: str = "max-width:100%; height:auto;") -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f'<img src="data:image/png;base64,{encoded}" alt="{alt_text}" style="{style}" />'


def fmt_rho(value) -> str:
    return "n/a (constant predictor)" if value is None else f"{value:.3f}"


df = load_predictions()
eval_results = load_eval_results()

RHO_EASY = eval_results["setting_a_with_position"]["random_forest"]["spearman_rho"]
RHO_HARD = eval_results["setting_b_position_groupkfold"]["random_forest"]["spearman_rho_mean"]
RHO_HARD_STD = eval_results["setting_b_position_groupkfold"]["random_forest"]["spearman_rho_std"]

# --------------------------------------------------------------------- Hero
st.markdown(
    f"""
    <div class="vlab-hero">
        <div class="vlab-tagline">( one protein. one assay. the honest number. )</div>
        <h1>Does sequence alone predict a mutation's fate?</h1>
        <p class="vlab-finding">
            A Random Forest trained on simple physicochemical features reaches
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
    """
    <div class="vlab-banner">
        <h2 class="vlab-display">We report the harder number.</h2>
        <p>
            Olson, Wu &amp; Sun (2014) measured every one of GB1's 1,045 possible
            single substitutions by mRNA display selected for IgG-Fc binding.
            Everything below is built on that one verified, cited dataset and
            the protein's real crystal structure — not a synthetic stand-in,
            and never dressed up as more certain than the splits actually show.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown('<div class="vlab-content">', unsafe_allow_html=True)

with st.expander("Dataset, provenance, and methodology details"):
    st.markdown(
        """
- **1,045 of 1,045 possible single substitutions** (55 positions × 19 amino acids —
  fully saturated, no missing combinations).
- **License & redistribution:** sourced via ProteinGym (MIT-licensed codebase);
  the underlying measurements follow the original publication's terms — used
  here for non-commercial, educational/portfolio analysis with full citation.
- **What the assay actually measures:** `DMS_score` is the raw reported `lnW`
  (log enrichment vs. wild type after IgG-Fc binding selection). It conflates
  folding stability with binding affinity — a low score could mean either, or
  both. This project does not assume a reduced score means instability.
- **"Large effect" positions** use this assay's own documented binarization
  cutoff (`lnW < -4`), not an invented threshold.
- No claim of clinical, therapeutic, or disease relevance is made anywhere —
  GB1 is a bacterial domain, and this project does not extrapolate to human
  variant interpretation.
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

concept_tiles = "".join(
    f"""<div class="vlab-tile">
        <div class="vlab-tile-title vlab-display">{c['title']}</div>
        <p>{c['body']}</p>
    </div>""" for c in CONCEPTS
)
st.markdown(f'<div class="vlab-grid">{concept_tiles}</div>', unsafe_allow_html=True)

# -------------------------------------------------------------- Structure
st.markdown('<div id="structure" class="vlab-section-heading vlab-display">The verified structure</div>', unsafe_allow_html=True)
st.markdown(
    '<p class="vlab-section-sub">PDB 1PGB (Gallagher, Alexander, Bryan &amp; Gilliland, 1994) — the exact '
    'crystal structure paper Olson et al. (2014) cite for GB1, 1.92 Å X-ray, no missing residues. The reference-'
    'sequence mapping onto this structure is independently verified position by position in '
    '<code>docs/structure_provenance.md</code>. Colored by each position\'s mean observed DMS score.</p>',
    unsafe_allow_html=True,
)

position_summary = per_position_summary(df.rename(columns={"dms_score": "dms_score"}) if "dms_score" in df.columns else df)

tab_3d, tab_2d, tab_chimerax = st.tabs(["Interactive 3D", "2D topology diagram", "ChimeraX renders"])

with tab_3d:
    st.caption("Drag to rotate, scroll to zoom. Cartoon colored by mean DMS score per position (RdBu_r scale — red = more fit, blue = less fit); domain position 1 (no verified structural match, see provenance) renders neutral gray.")
    view = build_3d_view(position_summary)
    components.html(view._make_html(), height=540)

with tab_2d:
    st.caption("A 2D topology diagram built directly from 1PGB's own HELIX/SHEET records (not a generic cartoon) — GB1's β-grasp fold: four β-strands packed against one α-helix.")
    fig = plot_2d_topology(position_summary)
    alt = (
        "2D topology diagram of GB1's secondary structure (four beta strands and one alpha helix, "
        "derived from the 1PGB crystal structure's own annotations), colored by mean DMS score per position."
    )
    st.markdown(fig_to_html_img(fig, alt), unsafe_allow_html=True)

with tab_chimerax:
    chimerax_3d = STRUCTURE_RENDER_DIR / "gb1_3d_view.png"
    chimerax_2d = STRUCTURE_RENDER_DIR / "gb1_2d_flat_view.png"
    if chimerax_3d.exists() and chimerax_2d.exists():
        st.caption("Rendered with real UCSF ChimeraX, colored by the same mean-DMS-score scale as the interactive view above.")
        c1, c2 = st.columns(2)
        c1.image(str(chimerax_3d), caption="3D angled cartoon view")
        c2.image(str(chimerax_2d), caption="Rotated flat view")
    else:
        st.markdown(
            """
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
            <code class="vlab-mono">cd ~/Coding/variantlab &amp;&amp; /Applications/ChimeraX-1.12.app/Contents/MacOS/ChimeraX scripts/render_chimerax.cxc</code>
            <br><br>
            Re-run the dashboard afterward and this tab will show them automatically.
            </div>
            """,
            unsafe_allow_html=True,
        )

st.markdown('<div id="explore" class="vlab-section-heading vlab-display">Explore the data</div>', unsafe_allow_html=True)
st.markdown('<p class="vlab-section-sub">The underlying tool: every one of the 1,045 measurements, a mutation-by-mutation explorer, and the full model evaluation.</p>', unsafe_allow_html=True)

tab_heatmap, tab_explorer, tab_eval, tab_limits = st.tabs(
    ["Mutation heatmap", "Mutation explorer", "Model evaluation", "What this does and doesn't show"]
)

# ---------------------------------------------------------------- Heatmap tab
with tab_heatmap:
    st.header("Experimental fitness heatmap")
    st.write(
        "Every cell is an **observed** experimental measurement (`DMS_score`), not "
        "a prediction. White cells on the diagonal-equivalent are WT residues — "
        "not mutations, so not part of this dataset. The color scale alone "
        "compresses fine distinctions for colorblind viewers; the **Mutation "
        "explorer** tab gives the same data as exact numeric values per mutation."
    )
    pivot = df.pivot(index="position", columns="new_aa", values="dms_score").reindex(columns=AA_LIST)
    hm_fig, ax = plt.subplots(figsize=(9, 11))
    im = ax.imshow(pivot.values, aspect="auto", cmap="RdBu_r", vmin=-6, vmax=2)
    ax.set_xticks(range(len(AA_LIST)))
    ax.set_xticklabels(AA_LIST)
    ax.set_yticks(range(0, 55, 5))
    ax.set_yticklabels(range(1, 56, 5))
    ax.set_xlabel("substituted amino acid")
    ax.set_ylabel("GB1 domain position (1-55)")
    hm_fig.colorbar(im, ax=ax, label="DMS score (higher = more fit)")
    alt = (
        "Heatmap of GB1 single-mutant fitness scores: 55 domain positions (rows) by "
        "19 substituted amino acids (columns). Most substitutions score near or "
        "above wild type (red); positions 26, 30, 40, 42 and 51 are deleterious "
        "across nearly all substitutions (blue bands), and proline substitutions "
        "are deleterious at nearly every position."
    )
    st.markdown(fig_to_html_img(hm_fig, alt), unsafe_allow_html=True)

# --------------------------------------------------------- Mutation explorer
with tab_explorer:
    st.header("Select a supported single substitution")
    st.write(
        "Only single amino-acid substitutions that exist in the GB1 deep "
        "mutational scan can be selected — this project does not extrapolate "
        "to mutation formats outside that scope (e.g. double mutants, indels, "
        "other proteins)."
    )

    qp = st.query_params
    qp_position = int(qp.get("position", 1)) if str(qp.get("position", "1")).isdigit() else 1
    qp_position = qp_position if 1 <= qp_position <= 55 else 1

    col1, col2 = st.columns(2)
    with col1:
        position = st.selectbox(
            "Position (1-55)", options=list(range(1, 56)),
            index=qp_position - 1,
        )
    wt_aa = REFERENCE_SEQUENCE[position - 1]
    st.write(f"Wild-type residue at position {position}: **{wt_aa}**")

    available_subs = sorted(df.loc[df["position"] == position, "new_aa"].unique())
    qp_aa = qp.get("aa", available_subs[0])
    aa_index = available_subs.index(qp_aa) if qp_aa in available_subs else 0
    with col2:
        new_aa = st.selectbox("Substituted amino acid", options=available_subs, index=aa_index)

    st.query_params["position"] = str(position)
    st.query_params["aa"] = new_aa
    st.caption("This selection is reflected in the page URL — copy the link to share this exact mutation.")

    row = df[(df["position"] == position) & (df["new_aa"] == new_aa)]
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
                    <div class="vlab-note">Measured directly in the Olson et al. assay.</div>
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
        feat_row = build_features(pd.DataFrame([{"orig_aa": wt_aa, "position": position, "new_aa": new_aa}])).iloc[0]
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

# --------------------------------------------------------------- Limits tab
with tab_limits:
    st.header("What this dashboard does and doesn't show")
    st.markdown(
        """
- **Observed vs. predicted are always visually separated** (see the Mutation
  Explorer tab's three distinctly-colored cards) — a prediction is never
  presented as if it were a measurement.
- **Setting B (held-out positions) is the only honest generalization test**
  shown per-mutation here; the "refit on all data" number is for inspection
  of the deployable model only, never for judging accuracy.
- **This is one protein, one assay.** Good performance here says nothing
  about any other protein — GB1 is a small, fast-folding, single-domain
  protein, and the assay conflates folding stability with IgG binding (see
  the "Dataset, provenance, and methodology details" expander above).
- **No claim of clinical, therapeutic, or disease relevance is made or
  implied anywhere in this project.** GB1 is a bacterial domain; nothing
  here generalizes to human disease variants.
- **"Large effect" positions** are defined using this assay's own documented
  binarization cutoff (`lnW < -4`), not a universal biological threshold.
- **Structural proximity is a hypothesis generator, not proof of mechanism**
  (see `docs/structure_provenance.md`): a sensitive position's location in
  3D space is consistent with several explanations (core packing, binding
  interface, backbone geometry) and this project does not pick one.
        """
    )

st.markdown("</div>", unsafe_allow_html=True)
