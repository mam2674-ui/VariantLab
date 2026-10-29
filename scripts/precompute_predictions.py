"""Precompute, for every single mutant:
  - an out-of-fold (held-out-position) prediction from the GroupKFold Setting B
    splits, i.e. a genuine never-seen-this-position prediction
  - a prediction from a model refit on ALL available data (for inspection only,
    NOT evidence of test performance, since these rows were in that model's
    training set)

Saved to data/processed/predictions.csv for the dashboard to read, so the
dashboard itself never needs to retrain anything at request time.

Run from the project root: python3 scripts/precompute_predictions.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import numpy as np
import pandas as pd

from variantlab import SEED
from variantlab.data_prep import PROCESSED_DIR
from variantlab.evaluation import position_group_kfold
from variantlab.features import build_features
from variantlab.modeling import make_random_forest


def main():
    df = pd.read_csv(PROCESSED_DIR / "gb1_single_mutants.csv")
    feats = build_features(df)
    y = df["dms_score"]

    oof_pred = np.full(len(df), np.nan)
    oof_fold = np.full(len(df), -1)

    folds = position_group_kfold(df, n_splits=5, seed=SEED)
    for fold_i, (train_idx, test_idx) in enumerate(folds):
        model = make_random_forest().fit(feats.iloc[train_idx], y.iloc[train_idx])
        oof_pred[test_idx] = model.predict(feats.iloc[test_idx])
        oof_fold[test_idx] = fold_i

    assert (oof_fold >= 0).all(), "every row should be held out exactly once across folds"

    full_model = make_random_forest().fit(feats, y)
    refit_pred = full_model.predict(feats)

    out = df.copy()
    out["held_out_position_prediction"] = oof_pred
    out["held_out_fold"] = oof_fold
    out["refit_on_all_data_prediction"] = refit_pred
    out.to_csv(PROCESSED_DIR / "predictions.csv", index=False)
    print(f"Saved predictions for {len(out)} mutants to {PROCESSED_DIR / 'predictions.csv'}")


if __name__ == "__main__":
    main()
