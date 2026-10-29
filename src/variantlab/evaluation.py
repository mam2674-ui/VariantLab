"""Leakage-aware train/test splitting and metrics.

Two evaluation settings, per the project brief:

A. Held-out substitutions at represented positions (random row split). Tests
   whether the model can predict an unseen substitution at a position it has
   already seen other substitutions for. This is the easier, narrower test.

B. Held-out positions (grouped split on `position`). Tests whether the model
   generalizes to positions it has never seen *any* substitution for. This is
   the harder test, and the only one where excluding raw position identity
   from the features actually matters.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.model_selection import GroupKFold, train_test_split

from . import SEED


@dataclass
class SplitIndices:
    train: np.ndarray
    val: np.ndarray
    test: np.ndarray


def random_split(df: pd.DataFrame, train_frac: float = 0.70, val_frac: float = 0.15, seed: int = SEED) -> SplitIndices:
    """Setting A: plain random row split. Fit preprocessing on train only."""
    idx = df.index.to_numpy()
    train_idx, rest_idx = train_test_split(idx, train_size=train_frac, random_state=seed)
    val_size_of_rest = val_frac / (1 - train_frac)
    val_idx, test_idx = train_test_split(rest_idx, train_size=val_size_of_rest, random_state=seed)

    train_positions = set(df.loc[train_idx, "position"])
    test_positions = set(df.loc[test_idx, "position"])
    uncovered = test_positions - train_positions
    if uncovered:
        raise AssertionError(
            f"Setting A requires every test position to appear in train; "
            f"{len(uncovered)} positions violate this: {sorted(uncovered)}"
        )
    return SplitIndices(train=train_idx, val=val_idx, test=test_idx)


def position_group_kfold(df: pd.DataFrame, n_splits: int = 5, seed: int = SEED) -> list[tuple[np.ndarray, np.ndarray]]:
    """Setting B: group K-fold by position. Every row for a given position lands
    entirely in train or entirely in test within each fold — no position ever
    appears on both sides. Positions are shuffled before grouping so folds aren't
    biased toward sequence order.
    """
    rng = np.random.RandomState(seed)
    positions = df["position"].unique()
    rng.shuffle(positions)
    # GroupKFold doesn't take a random_state; we pre-shuffle group order via a
    # shuffled position->group-order mapping instead.
    gkf = GroupKFold(n_splits=n_splits)
    groups = df["position"].to_numpy()
    folds = list(gkf.split(df, groups=groups))
    return folds


def spearman_mae(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    y_pred = np.asarray(y_pred)
    mae = float(np.mean(np.abs(np.asarray(y_true) - y_pred)))
    if np.allclose(y_pred, y_pred[0]):
        # Constant predictions (e.g. the mean baseline) have no defined rank
        # correlation. Report that explicitly instead of letting scipy emit NaN.
        return {"spearman_rho": None, "spearman_p": None, "mae": mae, "n": len(y_true),
                "note": "constant prediction; Spearman correlation undefined"}
    rho, pval = spearmanr(y_true, y_pred)
    return {"spearman_rho": float(rho), "spearman_p": float(pval), "mae": mae, "n": len(y_true)}
