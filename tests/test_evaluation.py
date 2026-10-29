import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import numpy as np
import pandas as pd
import pytest

from variantlab import SEED
from variantlab.evaluation import position_group_kfold, random_split, spearman_mae
from variantlab.features import build_features


def make_toy_df(n_positions=10, n_subs=5, seed=0):
    rng = np.random.RandomState(seed)
    rows = []
    aas = list("ACDEFGHIKL")
    for pos in range(1, n_positions + 1):
        orig = aas[pos % len(aas)]
        subs = rng.choice([a for a in aas if a != orig], size=n_subs, replace=False)
        for new in subs:
            rows.append({"orig_aa": orig, "position": pos, "new_aa": new,
                         "dms_score": rng.normal()})
    return pd.DataFrame(rows)


def test_random_split_no_row_overlap():
    df = make_toy_df()
    split = random_split(df, train_frac=0.6, val_frac=0.2, seed=SEED)
    train_set, val_set, test_set = set(split.train), set(split.val), set(split.test)
    assert train_set.isdisjoint(val_set)
    assert train_set.isdisjoint(test_set)
    assert val_set.isdisjoint(test_set)
    assert len(train_set) + len(val_set) + len(test_set) == len(df)


def test_random_split_every_test_position_in_train():
    df = make_toy_df()
    split = random_split(df, train_frac=0.6, val_frac=0.2, seed=SEED)
    train_positions = set(df.loc[split.train, "position"])
    test_positions = set(df.loc[split.test, "position"])
    assert test_positions.issubset(train_positions)


def test_random_split_reproducible_with_same_seed():
    df = make_toy_df()
    split1 = random_split(df, seed=123)
    split2 = random_split(df, seed=123)
    assert list(split1.train) == list(split2.train)
    assert list(split1.test) == list(split2.test)


def test_random_split_differs_with_different_seed():
    df = make_toy_df()
    split1 = random_split(df, seed=1)
    split2 = random_split(df, seed=2)
    assert list(split1.train) != list(split2.train)


def test_position_group_kfold_no_position_leakage():
    df = make_toy_df(n_positions=20)
    folds = position_group_kfold(df, n_splits=5, seed=SEED)
    for train_idx, test_idx in folds:
        train_positions = set(df.iloc[train_idx]["position"])
        test_positions = set(df.iloc[test_idx]["position"])
        assert train_positions.isdisjoint(test_positions), (
            "A position appeared in both train and test within a fold — this is "
            "exactly the leakage Setting B is designed to prevent."
        )


def test_spearman_mae_constant_prediction_is_flagged():
    y_true = np.array([1.0, 2.0, 3.0, 4.0])
    y_pred = np.full(4, 2.5)
    result = spearman_mae(y_true, y_pred)
    assert result["spearman_rho"] is None
    assert result["mae"] == pytest.approx(1.0)


def test_spearman_mae_perfect_correlation():
    y_true = np.array([1.0, 2.0, 3.0, 4.0])
    y_pred = np.array([10.0, 20.0, 30.0, 40.0])  # same rank order, different scale
    result = spearman_mae(y_true, y_pred)
    assert result["spearman_rho"] == pytest.approx(1.0)


def test_build_features_no_nan_outside_sequence_boundary():
    df = make_toy_df(n_positions=10)
    feats = build_features(df)
    # neighbor_hydro_minus1 should only be NaN at position 1 (no position 0)
    nan_rows = feats[feats["neighbor_hydro_minus1"].isna()]
    assert set(df.loc[nan_rows.index, "position"]) == {1}
