"""End-to-end run: load processed data, build features, evaluate baseline /
ridge / random forest under both leakage-aware splitting settings, and save
a results JSON + printed comparison table.

Run from the project root: python3 scripts/run_evaluation.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import numpy as np
import pandas as pd

from variantlab import SEED
from variantlab.data_prep import PROCESSED_DIR
from variantlab.evaluation import position_group_kfold, random_split, spearman_mae
from variantlab.features import POSITION_IDENTITY_COLUMNS, build_features
from variantlab.modeling import MeanBaseline, make_random_forest, make_ridge, select_ridge_alpha

RESULTS_PATH = PROCESSED_DIR / "eval_results.json"


def load_data():
    df = pd.read_csv(PROCESSED_DIR / "gb1_single_mutants.csv")
    feats = build_features(df)
    y = df["dms_score"]
    return df, feats, y


def run_setting_a(df, feats, y, drop_position: bool):
    """Held-out substitutions at represented positions."""
    split = random_split(df, train_frac=0.70, val_frac=0.15, seed=SEED)
    X = feats.drop(columns=POSITION_IDENTITY_COLUMNS) if drop_position else feats

    X_train, y_train = X.loc[split.train], y.loc[split.train]
    X_val, y_val = X.loc[split.val], y.loc[split.val]
    X_test, y_test = X.loc[split.test], y.loc[split.test]

    results = {}

    baseline = MeanBaseline().fit(X_train, y_train)
    results["mean_baseline"] = spearman_mae(y_test, baseline.predict(X_test))

    best_alpha = select_ridge_alpha(X_train, y_train, X_val, y_val)
    ridge = make_ridge(alpha=best_alpha).fit(X_train, y_train)
    results["ridge"] = {**spearman_mae(y_test, ridge.predict(X_test)), "selected_alpha": best_alpha}

    rf = make_random_forest().fit(X_train, y_train)
    results["random_forest"] = spearman_mae(y_test, rf.predict(X_test))

    results["_split_sizes"] = {"train": len(split.train), "val": len(split.val), "test": len(split.test)}
    return results


def run_setting_b(df, feats, y, n_splits: int = 5):
    """Held-out positions: GroupKFold by position. Reports mean +/- std across
    folds since positions within a fold are correlated (multiple substitutions
    at the same held-out position aren't independent test points)."""
    folds = position_group_kfold(df, n_splits=n_splits, seed=SEED)
    X = feats  # position kept: see docs/methods_report.md for why this differs from setting A

    per_model_fold_metrics = {"mean_baseline": [], "ridge": [], "random_forest": []}

    for train_idx, test_idx in folds:
        X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
        X_test, y_test = X.iloc[test_idx], y.iloc[test_idx]

        baseline = MeanBaseline().fit(X_train, y_train)
        per_model_fold_metrics["mean_baseline"].append(spearman_mae(y_test, baseline.predict(X_test)))

        ridge = make_ridge(alpha=1.0).fit(X_train, y_train)
        per_model_fold_metrics["ridge"].append(spearman_mae(y_test, ridge.predict(X_test)))

        rf = make_random_forest().fit(X_train, y_train)
        per_model_fold_metrics["random_forest"].append(spearman_mae(y_test, rf.predict(X_test)))

    summary = {}
    for model_name, fold_results in per_model_fold_metrics.items():
        rhos = [r["spearman_rho"] for r in fold_results]
        maes = [r["mae"] for r in fold_results]
        rho_defined = all(r is not None for r in rhos)
        summary[model_name] = {
            "spearman_rho_mean": float(np.mean(rhos)) if rho_defined else None,
            "spearman_rho_std": float(np.std(rhos)) if rho_defined else None,
            "mae_mean": float(np.mean(maes)),
            "mae_std": float(np.std(maes)),
            "per_fold": fold_results,
        }
    return summary


def main():
    df, feats, y = load_data()

    print("=" * 70)
    print("SETTING A: held-out substitutions at represented positions")
    print("(random 70/15/15 split; every test position appears in train)")
    print("=" * 70)
    setting_a_with_pos = run_setting_a(df, feats, y, drop_position=False)
    setting_a_without_pos = run_setting_a(df, feats, y, drop_position=True)

    def fmt(v):
        return f"{v:.3f}" if v is not None else "undefined"

    for label, res in [("WITH raw position feature", setting_a_with_pos), ("WITHOUT raw position feature", setting_a_without_pos)]:
        print(f"\n-- {label} --  (n_test={res['_split_sizes']['test']})")
        for model in ["mean_baseline", "ridge", "random_forest"]:
            m = res[model]
            print(f"  {model:16s} spearman={fmt(m['spearman_rho'])}  mae={m['mae']:.3f}")

    print("\n" + "=" * 70)
    print("SETTING B: held-out positions (5-fold GroupKFold by position)")
    print("=" * 70)
    setting_b = run_setting_b(df, feats, y, n_splits=5)
    for model in ["mean_baseline", "ridge", "random_forest"]:
        m = setting_b[model]
        rho_str = f"{m['spearman_rho_mean']:.3f} (+/-{m['spearman_rho_std']:.3f})" if m["spearman_rho_mean"] is not None else "undefined"
        print(f"  {model:16s} spearman={rho_str}  mae={m['mae_mean']:.3f} (+/-{m['mae_std']:.3f})")

    all_results = {
        "seed": SEED,
        "setting_a_with_position": setting_a_with_pos,
        "setting_a_without_position": setting_a_without_pos,
        "setting_b_position_groupkfold": setting_b,
    }
    with open(RESULTS_PATH, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\nSaved full results to {RESULTS_PATH}")


if __name__ == "__main__":
    main()
