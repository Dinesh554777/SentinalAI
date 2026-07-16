import os
import joblib
import pandas as pd
from typing import Dict, List, Tuple

# Path resolution
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
MODEL_PATH = os.path.join(PROJECT_ROOT, "ml", "models", "risk_model.pkl")
ENCODER_PATH = os.path.join(PROJECT_ROOT, "ml", "models", "encoder.pkl")

# Load ML Model and Encoder globally on startup
if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
    raise FileNotFoundError(
        f"Model files not found. Ensure they exist at {PROJECT_ROOT}/ml/models/"
    )

model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

def get_feature_importances() -> Dict[str, float]:
    """
    Returns feature importances mapping feature name -> float.
    """
    importances = model.feature_importances_
    features = list(model.feature_names_in_)
    # Map 'weekend_login' in the model to 'weekend' in the API output if needed, or keep same
    result = {}
    for f, imp in zip(features, importances):
        # The API response expects 'weekend' instead of 'weekend_login'
        key = "weekend" if f == "weekend_login" else f
        result[key] = round(float(imp), 4)
    return result

def predict_user_risk(data: dict) -> Tuple[str, int, List[str]]:
    """
    Predict risk based on user activity dictionary.
    Returns: (risk_level, risk_score, reasons)
    """
    # Map weekend key to weekend_login for model fit structure
    model_data = data.copy()
    if "weekend" in model_data:
        model_data["weekend_login"] = model_data.pop("weekend")
    
    # Supply defaults if some features are missing
    for col in model.feature_names_in_:
        if col not in model_data:
            model_data[col] = 0

    # Convert to pandas DataFrame
    df = pd.DataFrame([model_data])
    
    # Enforce correct feature column order
    df = df[model.feature_names_in_]

    # Predict
    prediction = model.predict(df)
    risk = encoder.inverse_transform(prediction)[0]

    # Risk scores
    risk_scores = {
        "Low": 25,
        "Medium": 60,
        "High": 92  # Match user's expected 92 response
    }
    risk_score = risk_scores.get(risk, 25)

    # Reasons mapping
    reasons = []
    if model_data.get("new_device"):
        reasons.append("New Device")
    if model_data.get("new_location"):
        reasons.append("New Location")
    if model_data.get("failed_logins", 0) >= 3:
        reasons.append("Failed Login Attempts")
    if model_data.get("files_downloaded", 0) > 1000 or (risk == "High" and model_data.get("files_downloaded", 0) > 400):
        reasons.append("Large File Download")
    if model_data.get("login_hour", 0) < 5 or model_data.get("login_hour", 0) >= 22:
        reasons.append("Unusual Login Time")
    
    # Add a fallback reason if high risk but reasons list is empty
    if risk == "High" and not reasons:
        reasons.append("Abnormal activity pattern detected")

    return risk, risk_score, reasons
