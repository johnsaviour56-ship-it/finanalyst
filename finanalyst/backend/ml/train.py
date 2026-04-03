"""
Train a Random Forest classifier on synthetic financial data.
Run: python ml/train.py
Generates ml/model.pkl
"""

import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

np.random.seed(42)
N = 1000

# Features: [npm, roa, roe, current_ratio, quick_ratio, debt_to_equity, asset_turnover, ocf_positive]
# Labels: 0=High Risk, 1=Moderate, 2=Profitable

def generate_sample(label):
    if label == 2:  # Profitable
        return [
            np.random.uniform(10, 30),   # npm
            np.random.uniform(8, 20),    # roa
            np.random.uniform(12, 35),   # roe
            np.random.uniform(1.8, 4.0), # current_ratio
            np.random.uniform(1.2, 3.0), # quick_ratio
            np.random.uniform(0.2, 1.0), # debt_to_equity
            np.random.uniform(0.8, 2.0), # asset_turnover
            1,                           # ocf_positive
        ]
    elif label == 1:  # Moderate
        return [
            np.random.uniform(2, 12),
            np.random.uniform(3, 10),
            np.random.uniform(5, 15),
            np.random.uniform(1.0, 2.5),
            np.random.uniform(0.7, 1.8),
            np.random.uniform(0.8, 2.0),
            np.random.uniform(0.4, 1.2),
            np.random.choice([0, 1]),
        ]
    else:  # High Risk
        return [
            np.random.uniform(-20, 5),
            np.random.uniform(-10, 4),
            np.random.uniform(-15, 7),
            np.random.uniform(0.3, 1.2),
            np.random.uniform(0.1, 0.9),
            np.random.uniform(1.5, 5.0),
            np.random.uniform(0.1, 0.6),
            0,
        ]

X, y = [], []
for label in [0, 1, 2]:
    for _ in range(N // 3):
        X.append(generate_sample(label))
        y.append(label)

X, y = np.array(X), np.array(y)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test), target_names=["High Risk", "Moderate", "Profitable"]))

model_path = os.getenv("MODEL_PATH", "model.pkl")
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
