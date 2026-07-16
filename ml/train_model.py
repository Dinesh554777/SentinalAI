import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from sklearn.ensemble import IsolationForest

from xgboost import XGBClassifier

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv("dataset/privileged_access_dataset.csv")

print("Dataset Loaded Successfully!")
print(df.head())

# -----------------------------
# Encode Target Labels
# -----------------------------

encoder = LabelEncoder()

df["risk"] = encoder.fit_transform(df["risk"])

# -----------------------------
# Split Features and Target
# -----------------------------

X = df.drop("risk", axis=1)

y = df["risk"]

# -----------------------------
# Train-Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# Train Isolation Forest
# -----------------------------

anomaly_model = IsolationForest(
    contamination=0.05,
    random_state=42
)

anomaly_model.fit(X_train)

# -----------------------------
# Train XGBoost
# -----------------------------

risk_model = XGBClassifier(
    objective="multi:softmax",
    num_class=3,
    random_state=42
)

risk_model.fit(X_train, y_train)

# -----------------------------
# Predict
# -----------------------------

predictions = risk_model.predict(X_test)

# -----------------------------
# Accuracy
# -----------------------------

accuracy = accuracy_score(y_test, predictions)

print("\nAccuracy:", accuracy)

print("\nClassification Report:\n")

print(classification_report(y_test, predictions))

# -----------------------------
# Save Models
# -----------------------------

os.makedirs("models", exist_ok=True)

joblib.dump(anomaly_model, "models/anomaly_model.pkl")

joblib.dump(risk_model, "models/risk_model.pkl")

print("\nModels Saved Successfully!")
