"""Sequence-derived features for single amino-acid substitutions.

All property scales are documented approximations, not exact physical constants
under every condition. Sources are cited per-table below.
"""
from __future__ import annotations

import pandas as pd

from .data_prep import REFERENCE_SEQUENCE

# Kyte & Doolittle (1982) J. Mol. Biol. 157:105-132 hydrophobicity scale.
# Higher = more hydrophobic.
HYDROPHOBICITY = {
    "A": 1.8, "R": -4.5, "N": -3.5, "D": -3.5, "C": 2.5, "Q": -3.5, "E": -3.5,
    "G": -0.4, "H": -3.2, "I": 4.5, "L": 3.8, "K": -3.9, "M": 1.9, "F": 2.8,
    "P": -1.6, "S": -0.8, "T": -0.7, "W": -0.9, "Y": -1.3, "V": 4.2,
}

# Zamyatnin (1972) Prog. Biophys. Mol. Biol. 24:107-123 average residue volume
# (cubic angstroms), as commonly tabulated (e.g. Expasy ProtScale). Used here as
# an approximation of side-chain size.
VOLUME = {
    "A": 88.6, "R": 173.4, "N": 114.1, "D": 111.1, "C": 108.5, "Q": 143.8,
    "E": 138.4, "G": 60.1, "H": 153.2, "I": 166.7, "L": 166.7, "K": 168.6,
    "M": 162.9, "F": 189.9, "P": 112.7, "S": 89.0, "T": 116.1, "W": 227.8,
    "Y": 193.6, "V": 140.0,
}

# Simplified charge category at ~physiological pH. This is a textbook approximation,
# not an exact protonation state under every assay condition (e.g. histidine's charge
# is genuinely pH-sensitive near physiological pH and is treated here as neutral).
CHARGE = {
    "D": -1, "E": -1,
    "K": 1, "R": 1, "H": 0,
    **{aa: 0 for aa in "ACFGILMNPQSTVWY"},
}

# Standard categorical polar/nonpolar grouping (Nelson & Cox, Lehninger Principles
# of Biochemistry). Categorical convention, not a continuous physical measurement.
POLAR = {aa: True for aa in "RNDQEHKSTYC"}
POLAR.update({aa: False for aa in "AVLIMFWPG"})

AA_LIST = sorted(HYDROPHOBICITY.keys())

assert set(HYDROPHOBICITY) == set(VOLUME) == set(CHARGE) == set(POLAR) == set("ACDEFGHIKLMNPQRSTVWY")


def _neighbor_aa(position: int, offset: int) -> str | None:
    idx = position - 1 + offset
    if 0 <= idx < len(REFERENCE_SEQUENCE):
        return REFERENCE_SEQUENCE[idx]
    return None


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Given a dataframe with orig_aa, position, new_aa columns, return a new
    dataframe of sequence-derived features (one row per mutation, same order).
    """
    feats = pd.DataFrame(index=df.index)

    feats["position"] = df["position"]

    feats["hydrophobicity_orig"] = df["orig_aa"].map(HYDROPHOBICITY)
    feats["hydrophobicity_new"] = df["new_aa"].map(HYDROPHOBICITY)
    feats["delta_hydrophobicity"] = feats["hydrophobicity_new"] - feats["hydrophobicity_orig"]

    feats["volume_orig"] = df["orig_aa"].map(VOLUME)
    feats["volume_new"] = df["new_aa"].map(VOLUME)
    feats["delta_volume"] = feats["volume_new"] - feats["volume_orig"]

    feats["charge_orig"] = df["orig_aa"].map(CHARGE)
    feats["charge_new"] = df["new_aa"].map(CHARGE)
    feats["delta_charge"] = feats["charge_new"] - feats["charge_orig"]

    feats["polar_orig"] = df["orig_aa"].map(POLAR).astype(int)
    feats["polar_new"] = df["new_aa"].map(POLAR).astype(int)
    feats["polarity_changed"] = (feats["polar_orig"] != feats["polar_new"]).astype(int)

    # Local sequence context: hydrophobicity of immediate neighbors in the WT
    # sequence. An approximation of local environment, not a structural feature.
    neighbor_minus1 = df["position"].apply(lambda p: _neighbor_aa(p, -1))
    neighbor_plus1 = df["position"].apply(lambda p: _neighbor_aa(p, 1))
    feats["neighbor_hydro_minus1"] = neighbor_minus1.map(HYDROPHOBICITY)
    feats["neighbor_hydro_plus1"] = neighbor_plus1.map(HYDROPHOBICITY)

    # One-hot identity of orig/new amino acid. These let a model memorize
    # "substitution X->Y is generally good/bad" but not a specific position.
    for aa in AA_LIST:
        feats[f"orig_is_{aa}"] = (df["orig_aa"] == aa).astype(int)
        feats[f"new_is_{aa}"] = (df["new_aa"] == aa).astype(int)

    return feats


# Feature columns that encode raw position identity. Including these lets a model
# memorize position-specific fitted values rather than generalizing a substitution
# rule — see docs/methods_report.md for why these are excluded from the
# held-out-position evaluation and used only in the held-out-substitution evaluation.
POSITION_IDENTITY_COLUMNS = ["position"]
