"""Model definitions: mean baseline, regularized linear model, tree-based model.

All models are wrapped as (fit on train only) -> (predict), and any
preprocessing (imputation, scaling) lives inside an sklearn Pipeline so it is
always fit on the training fold only, never on validation/test data.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from . import SEED


class MeanBaseline:
    """Predicts the training-set mean DMS score for every row. The floor any
    useful model must beat."""

    def fit(self, X: pd.DataFrame, y: pd.Series) -> "MeanBaseline":
        self.mean_ = float(np.mean(y))
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        return np.full(len(X), self.mean_)


def make_ridge(alpha: float = 1.0) -> Pipeline:
    return Pipeline([
        ("impute", SimpleImputer(strategy="constant", fill_value=0.0)),
        ("scale", StandardScaler()),
        ("ridge", Ridge(alpha=alpha, random_state=SEED)),
    ])


def make_random_forest(n_estimators: int = 300, max_depth: int | None = 8) -> Pipeline:
    return Pipeline([
        ("impute", SimpleImputer(strategy="constant", fill_value=0.0)),
        ("rf", RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_leaf=2,
            random_state=SEED,
            n_jobs=-1,
        )),
    ])


def select_ridge_alpha(X_train, y_train, X_val, y_val, alphas=(0.01, 0.1, 1.0, 10.0, 100.0)) -> float:
    """Model selection using train+val only, as required before touching test."""
    from .evaluation import spearman_mae

    best_alpha, best_rho = alphas[0], -np.inf
    for alpha in alphas:
        model = make_ridge(alpha=alpha).fit(X_train, y_train)
        preds = model.predict(X_val)
        rho = spearman_mae(y_val, preds)["spearman_rho"]
        if rho > best_rho:
            best_alpha, best_rho = alpha, rho
    return best_alpha
