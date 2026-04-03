"""
ML-based profitability prediction using Random Forest.
Falls back to rule-based scoring if model is not trained yet.
"""

import os
import joblib
import numpy as np
from services.ratios import compute_ratios, compute_score, score_to_prediction

MODEL_PATH = os.getenv("MODEL_PATH", "./ml/model.pkl")


def get_features(ratios: dict) -> list:
    return [
        ratios.get("net_profit_margin", 0),
        ratios.get("roa", 0),
        ratios.get("roe", 0),
        ratios.get("current_ratio", 0),
        ratios.get("quick_ratio", 0),
        ratios.get("debt_to_equity", 0),
        ratios.get("asset_turnover", 0),
        1 if ratios.get("operating_cf_positive") else 0,
    ]


def predict(financial_data: dict) -> dict:
    ratios = compute_ratios(financial_data)
    score = compute_score(ratios)

    # Try ML model first
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            features = np.array([get_features(ratios)])
            label_map = {0: "High Risk", 1: "Moderate", 2: "Profitable"}
            pred_idx = model.predict(features)[0]
            proba = model.predict_proba(features)[0]
            prediction = label_map.get(pred_idx, "Moderate")
            confidence = round(float(max(proba)) * 100, 1)
            _, explanation = score_to_prediction(score)
            explanation = f"[ML Model, {confidence}% confidence] " + explanation
            return {
                "ratios": ratios,
                "score": score,
                "prediction": prediction,
                "explanation": explanation,
                "method": "ml",
            }
        except Exception:
            pass  # Fall through to rule-based

    # Rule-based fallback
    prediction, explanation = score_to_prediction(score)
    return {
        "ratios": ratios,
        "score": score,
        "prediction": prediction,
        "explanation": explanation,
        "method": "rule-based",
    }
