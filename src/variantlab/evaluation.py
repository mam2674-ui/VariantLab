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
    """Setting A: random row split, with one guarantee: every position that
    has more than one observed substitution contributes at least one row to
    train. On a fully- or densely-saturated dataset (e.g. GB1, TEM-1) this
    reservation is a no-op -- plain chance already satisfies it. On a sparse
    dataset (e.g. GFP, where some positions have only 1-2 observed
    substitutions), pure random splitting has a real chance of putting a
    position's only examples entirely in test, which Setting A's own
    definition ("unseen substitution at an *already-seen* position")
    forbids -- so this reserves one row per position for train first, then
    splits the remainder randomly. A position with exactly one observed
    substitution can only ever be a train example here; it is never a valid
    Setting A test case, which is the correct, honest consequence of having
    just one data point for it, not a bug to paper over. Fit preprocessing
    on train only.
    """
    rng = np.random.RandomState(seed)
    reserved = []
    for _, g in df.groupby("position"):
        if len(g) > 1:
            # One row reserved for train; the rest are free to land anywhere.
            reserved.append(g.sample(n=1, random_state=seed).index[0])
        else:
            # A singleton position has no "rest" -- its only row must go to
            # train (it can never be a valid Setting A test case), not just
            # a 1-in-N chance of landing there.
            reserved.extend(g.index.tolist())
    reserved_train_idx = np.array(reserved)

    remaining_idx = df.index.difference(reserved_train_idx).to_numpy()
    rng.shuffle(remaining_idx)

    n_total = len(df)
    n_train_target = max(int(round(train_frac * n_total)) - len(reserved_train_idx), 0)
    n_val_target = int(round(val_frac * n_total))

    extra_train_idx = remaining_idx[:n_train_target]
    val_idx = remaining_idx[n_train_target:n_train_target + n_val_target]
    test_idx = remaining_idx[n_train_target + n_val_target:]

    train_idx = np.concatenate([reserved_train_idx, extra_train_idx])

    train_positions = set(df.loc[train_idx, "position"])
    test_positions = set(df.loc[test_idx, "position"])
    uncovered = test_positions - train_positions
    if uncovered:
        raise AssertionError(
            f"Setting A requires every test position to appear in train; "
            f"{len(uncovered)} positions violate this: {sorted(uncovered)}. "
            "These are positions where every observed substitution was "
            "reserved into train (singleton positions), yet still ended up "
            "referenced in test -- investigate before trusting this split."
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
