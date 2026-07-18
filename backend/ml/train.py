import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib
import os

DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset", "privileged_access_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

data = pd.read_csv(DATA_PATH)
print(f"Dataset loaded: {len(data)} rows, {len(data.columns)} columns")
print(f"\nClass distribution:\n{data['risk'].value_counts().to_string()}")

X = data.drop("risk", axis=1)
y = data["risk"]

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)

model.fit(X_train, y_train)

train_acc = model.score(X_train, y_train)
test_acc = model.score(X_test, y_test)
print(f"\nTrain accuracy: {train_acc:.4f}")
print(f"Test accuracy:  {test_acc:.4f}")

cv_scores = cross_val_score(model, X, y_encoded, cv=5, scoring="accuracy")
print(f"5-fold CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

y_pred = model.predict(X_test)
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=encoder.classes_))
print(f"Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

importances = model.feature_importances_
features = list(X.columns)
print(f"\nFeature Importances:")
for f, imp in sorted(zip(features, importances), key=lambda x: x[1], reverse=True):
    print(f"  {f:25s} {imp:.4f}")

os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(model, os.path.join(MODEL_DIR, "risk_model.pkl"))
joblib.dump(encoder, os.path.join(MODEL_DIR, "encoder.pkl"))
print(f"\nModel saved to {MODEL_DIR}/risk_model.pkl")
print(f"Encoder saved to {MODEL_DIR}/encoder.pkl")
