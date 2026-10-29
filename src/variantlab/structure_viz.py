"""Visualizations that map single-mutant fitness scores onto the verified
GB1 structure (1PGB): a per-position summary, a 2D secondary-structure
topology diagram, and an interactive 3D viewer (py3Dmol).
"""
from __future__ import annotations

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import pandas as pd

from .structure import (
    SECONDARY_STRUCTURE,
    UNMAPPED_DOMAIN_POSITIONS,
    domain_position_to_pdb_resnum,
    load_pdb_text,
)


def per_position_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Mean and min DMS score per domain position, across its substitutions."""
    g = df.groupby("position")["dms_score"]
    return pd.DataFrame({"mean_score": g.mean(), "min_score": g.min(), "n": g.count()})


def _score_to_color(score: float, vmin: float, vmax: float, cmap_name: str = "RdBu_r") -> str:
    cmap = plt.get_cmap(cmap_name)
    norm = (score - vmin) / (vmax - vmin) if vmax > vmin else 0.5
    norm = min(max(norm, 0.0), 1.0)
    r, g, b, _ = cmap(norm)
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"


def plot_2d_topology(position_summary: pd.DataFrame, value_col: str = "mean_score") -> plt.Figure:
    """A 2D topology diagram: beta strands as arrows, the helix as a coil
    ribbon, laid out left-to-right in sequence order, colored by per-position
    fitness. Derived directly from 1PGB's own HELIX/SHEET records (see
    docs/structure_provenance.md) -- not a generic cartoon.
    """
    vmin, vmax = position_summary[value_col].min(), position_summary[value_col].max()
    fig, ax = plt.subplots(figsize=(11, 3.2))

    x_cursor = 0.0
    unit = 0.32  # width per residue

    for el in SECONDARY_STRUCTURE:
        lo, hi = el["domain_range"]
        length = hi - lo + 1
        width = length * unit

        if el["kind"] == "strand":
            # Draw as a sequence of small colored segments ending in an arrowhead.
            for i, pos in enumerate(range(lo, hi + 1)):
                seg_x = x_cursor + i * unit
                score = position_summary.loc[pos, value_col] if pos in position_summary.index else np.nan
                color = _score_to_color(score, vmin, vmax) if not np.isnan(score) else "#e0e0e0"
                is_last = i == length - 1
                if is_last:
                    ax.add_patch(mpatches.FancyArrow(
                        seg_x, 0, unit * 0.95, 0, width=0.42, head_width=0.75,
                        head_length=unit * 0.9, length_includes_head=True,
                        facecolor=color, edgecolor="none"))
                else:
                    ax.add_patch(mpatches.Rectangle((seg_x, -0.21), unit * 1.02, 0.42,
                                                      color=color, linewidth=0))
        else:  # helix: draw as a coiled ribbon of small circles
            for i, pos in enumerate(range(lo, hi + 1)):
                seg_x = x_cursor + i * unit
                score = position_summary.loc[pos, value_col] if pos in position_summary.index else np.nan
                color = _score_to_color(score, vmin, vmax) if not np.isnan(score) else "#e0e0e0"
                y_wave = 0.18 * np.sin(i * 1.3)
                ax.add_patch(mpatches.Circle((seg_x + unit / 2, y_wave), 0.22, color=color, linewidth=0))

        ax.text(x_cursor + width / 2, -0.55, f"{el['name']}\n({lo}-{hi})",
                ha="center", va="top", fontsize=7, color="#52585e")
        x_cursor += width + unit * 1.6  # gap (loop) between elements

    # Unmapped position-1 note
    ax.text(-unit, 0, "pos 1\n(unmapped)", ha="right", va="center", fontsize=6.5, color="#9a5b12")

    ax.set_xlim(-unit * 3, x_cursor)
    ax.set_ylim(-1.0, 0.8)
    ax.axis("off")
    ax.set_title(
        "GB1 secondary-structure topology, colored by mean DMS score per position\n"
        "(from 1PGB's own HELIX/SHEET records — see docs/structure_provenance.md)",
        fontsize=10, color="#14171a",
    )
    fig.tight_layout()
    return fig


def build_3d_view(position_summary: pd.DataFrame, value_col: str = "mean_score"):
    """Return a py3Dmol view of 1PGB cartoon, colored per-residue by the
    chosen score column, mapped through the verified PDB<->domain offset.
    Domain position 1 (no verified structural match) renders gray.
    """
    import py3Dmol

    vmin, vmax = position_summary[value_col].min(), position_summary[value_col].max()
    view = py3Dmol.view(width=760, height=520)
    view.addModel(load_pdb_text(), "pdb")
    view.setStyle({}, {"cartoon": {"color": "#d9d4cb"}})

    for domain_pos, row in position_summary.iterrows():
        if domain_pos in UNMAPPED_DOMAIN_POSITIONS:
            continue
        pdb_resnum = domain_position_to_pdb_resnum(domain_pos)
        if pdb_resnum is None:
            continue
        color = _score_to_color(row[value_col], vmin, vmax)
        view.setStyle({"resi": str(pdb_resnum)}, {"cartoon": {"color": color}})

    view.setBackgroundColor("0xffffff")
    view.zoomTo()
    return view
