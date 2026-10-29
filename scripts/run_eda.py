"""Exploratory analysis for the GB1 single-mutant dataset. Saves figures to
docs/figures/ and prints the numeric summaries that back the written
interpretation in docs/eda_summary.md.

Run from the project root: python3 scripts/run_eda.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from variantlab.data_prep import PROCESSED_DIR, REFERENCE_SEQUENCE
from variantlab.features import CHARGE, HYDROPHOBICITY, POLAR

FIG_DIR = Path(__file__).resolve().parents[1] / "docs" / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

# Assay-documented convention for "large effect": ProteinGym records this
# exact assay's own manual binarization cutoff as lnW < -4 (loss of function).
# We reuse that cutoff rather than inventing a new threshold.
LARGE_EFFECT_CUTOFF = -4.0

AA_ORDER = sorted(HYDROPHOBICITY.keys())


def load():
    return pd.read_csv(PROCESSED_DIR / "gb1_single_mutants.csv")


def plot_distribution(df: pd.DataFrame):
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.hist(df["dms_score"], bins=40, color="#4C72B0", edgecolor="white")
    ax.axvline(0, color="black", linestyle="--", linewidth=1, label="WT (score = 0)")
    ax.axvline(LARGE_EFFECT_CUTOFF, color="red", linestyle=":", linewidth=1.5,
               label=f"large-effect cutoff ({LARGE_EFFECT_CUTOFF})")
    ax.set_xlabel("DMS score (log enrichment vs. WT; higher = more fit)")
    ax.set_ylabel("count of single mutants")
    ax.set_title("Distribution of GB1 single-mutant fitness scores (n=1045)")
    ax.legend()
    fig.tight_layout()
    fig.savefig(FIG_DIR / "01_score_distribution.png", dpi=150)
    plt.close(fig)


def plot_heatmap(df: pd.DataFrame):
    pivot = df.pivot(index="position", columns="new_aa", values="dms_score")
    pivot = pivot.reindex(columns=AA_ORDER)
    fig, ax = plt.subplots(figsize=(8, 11))
    im = ax.imshow(pivot.values, aspect="auto", cmap="RdBu_r", vmin=-6, vmax=2)
    ax.set_xticks(range(len(AA_ORDER)))
    ax.set_xticklabels(AA_ORDER)
    ax.set_yticks(range(0, 55, 5))
    ax.set_yticklabels(range(1, 56, 5))
    ax.set_xlabel("substituted amino acid")
    ax.set_ylabel("GB1 domain position (1-55)")
    ax.set_title("GB1 single-mutant fitness heatmap\n(blank cell = missing data; there are none here)")
    fig.colorbar(im, ax=ax, label="DMS score")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "02_position_substitution_heatmap.png", dpi=150)
    plt.close(fig)
    missing_cells = pivot.isna().sum().sum()
    total_cells = pivot.shape[0] * pivot.shape[1]
    return missing_cells, total_cells


def plot_property_effects(df: pd.DataFrame):
    d = df.copy()
    d["delta_hydro"] = d["new_aa"].map(HYDROPHOBICITY) - d["orig_aa"].map(HYDROPHOBICITY)
    d["charge_orig"] = d["orig_aa"].map(CHARGE)
    d["charge_new"] = d["new_aa"].map(CHARGE)
    d["charge_change"] = np.where(
        d["charge_orig"] == d["charge_new"], "no change",
        np.where(d["charge_orig"].abs() < d["charge_new"].abs(), "more charged", "less/different charge"),
    )
    d["hydro_bin"] = pd.cut(
        d["delta_hydro"], bins=[-10, -3, -0.5, 0.5, 3, 10],
        labels=["much more\npolar", "slightly more\npolar", "~no change", "slightly more\nhydrophobic", "much more\nhydrophobic"],
    )

    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))

    d.boxplot(column="dms_score", by="charge_change", ax=axes[0], grid=False)
    axes[0].set_title("Fitness by charge-category change")
    axes[0].set_xlabel("")
    axes[0].set_ylabel("DMS score")

    d.boxplot(column="dms_score", by="hydro_bin", ax=axes[1], grid=False)
    axes[1].set_title("Fitness by hydrophobicity change\n(Kyte-Doolittle delta, binned)")
    axes[1].set_xlabel("")
    axes[1].tick_params(axis="x", labelsize=8)

    fig.suptitle("")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "03_property_effects.png", dpi=150)
    plt.close(fig)
    return d


def plot_large_effect_positions(df: pd.DataFrame):
    frac_large = df.groupby("position")["dms_score"].apply(lambda s: (s < LARGE_EFFECT_CUTOFF).mean())
    fig, ax = plt.subplots(figsize=(10, 4))
    colors = ["#C44E52" if v >= 0.5 else "#4C72B0" for v in frac_large.values]
    ax.bar(frac_large.index, frac_large.values, color=colors)
    ax.axhline(0.5, color="black", linestyle="--", linewidth=1)
    ax.set_xlabel("GB1 domain position (1-55)")
    ax.set_ylabel(f"fraction of 19 substitutions with score < {LARGE_EFFECT_CUTOFF}")
    ax.set_title("Positions with consistently large deleterious effects\n(red = majority of substitutions are large-effect)")
    fig.tight_layout()
    fig.savefig(FIG_DIR / "04_large_effect_positions.png", dpi=150)
    plt.close(fig)
    consistently_large = frac_large[frac_large >= 0.5].index.tolist()
    return consistently_large, frac_large


def main():
    df = load()
    print(f"Loaded {len(df)} single mutants.")

    plot_distribution(df)
    missing_cells, total_cells = plot_heatmap(df)
    print(f"Heatmap coverage: {total_cells - missing_cells}/{total_cells} position-substitution "
          f"combinations observed ({missing_cells} missing).")

    plot_property_effects(df)

    consistently_large, frac_large = plot_large_effect_positions(df)
    print(f"Positions with >=50% of substitutions scoring below {LARGE_EFFECT_CUTOFF} "
          f"(consistently large effect, n={len(consistently_large)}): {consistently_large}")

    print("\nReplicate agreement: not applicable. SPG1_STRSG_Olson_2014 is a single "
          "pooled selection + deep-sequencing experiment with no independent "
          "biological replicates, so no replicate-agreement plot is produced "
          "(see docs/dataset_provenance.md).")

    print(f"\nFigures saved to {FIG_DIR}")


if __name__ == "__main__":
    main()
