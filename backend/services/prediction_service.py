import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BACKEND_DIR, "ml", "models", "risk_model.pkl")
ENCODER_PATH = os.path.join(BACKEND_DIR, "ml", "models", "encoder.pkl")

if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
    raise FileNotFoundError(
        f"Model files not found. Ensure they exist at {BACKEND_DIR}/ml/models/"
    )

model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

FEATURE_DESCRIPTIONS = {
    "new_device": "Login from an unrecognized device",
    "new_location": "Login from an unfamiliar geographic location",
    "failed_logins": "Multiple failed login attempts detected",
    "files_downloaded": "Unusually high file download volume",
    "commands_executed": "Elevated command execution frequency",
    "session_duration": "Abnormally long session duration",
    "login_hour": "Activity outside normal business hours",
    "weekend_login": "Access on weekend/off-schedule",
}


def get_feature_importances() -> Dict[str, float]:
    importances = model.feature_importances_
    features = list(model.feature_names_in_)
    result = {}
    for f, imp in zip(features, importances):
        key = "weekend" if f == "weekend_login" else f
        result[key] = round(float(imp), 4)
    return result


def _compute_reasons(features: dict, importances: Dict[str, float]) -> List[str]:
    scored = []
    for fname, imp in importances.items():
        api_name = "weekend" if fname == "weekend_login" else fname
        val = features.get(api_name, 0)
        contribution = imp * 100

        if fname == "new_device" and val == 1:
            scored.append((contribution * 1.5, FEATURE_DESCRIPTIONS[fname]))
        elif fname == "new_location" and val == 1:
            scored.append((contribution * 1.4, FEATURE_DESCRIPTIONS[fname]))
        elif fname == "failed_logins" and val >= 3:
            scored.append((contribution * (1 + val * 0.1), f"{FEATURE_DESCRIPTIONS[fname]} ({val} attempts)"))
        elif fname == "files_downloaded" and val > 500:
            multiplier = 1 + (val / 5000)
            scored.append((contribution * multiplier, f"{FEATURE_DESCRIPTIONS[fname]} ({val} files)"))
        elif fname == "commands_executed" and val > 20:
            multiplier = 1 + (val / 200)
            scored.append((contribution * multiplier, f"{FEATURE_DESCRIPTIONS[fname]} ({val} cmds)"))
        elif fname == "session_duration" and val > 120:
            multiplier = 1 + (val / 300)
            scored.append((contribution * multiplier, f"{FEATURE_DESCRIPTIONS[fname]} ({val} min)"))
        elif fname in ("login_hour", "weekend_login") and val:
            if fname == "login_hour" and (val < 6 or val >= 22):
                scored.append((contribution * 1.2, FEATURE_DESCRIPTIONS[fname]))
            elif fname == "weekend_login" and val == 1:
                scored.append((contribution * 1.1, FEATURE_DESCRIPTIONS[fname]))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [desc for _, desc in scored[:5]] if scored else ["Normal activity pattern"]


def predict_user_risk(data: dict) -> Tuple[str, float, float, List[str], Dict[str, float]]:
    model_data = data.copy()
    if "weekend" in model_data:
        model_data["weekend_login"] = model_data.pop("weekend")

    for col in model.feature_names_in_:
        if col not in model_data:
            model_data[col] = 0

    df = pd.DataFrame([model_data])
    df = df[model.feature_names_in_]

    prediction = model.predict(df)
    risk = encoder.inverse_transform(prediction)[0]

    probabilities = model.predict_proba(df)[0]
    class_labels = encoder.classes_
    prob_dict = {cls: float(probabilities[i]) for i, cls in enumerate(class_labels)}

    confidence = prob_dict.get(risk, 0.0)

    high_prob = prob_dict.get("High", 0)
    med_prob = prob_dict.get("Medium", 0)
    low_prob = prob_dict.get("Low", 0)
    risk_score = round(high_prob * 95 + med_prob * 55 + low_prob * 15, 1)
    risk_score = max(0, min(100, risk_score))

    importances = get_feature_importances()
    reasons = _compute_reasons(model_data, importances)

    return risk, risk_score, confidence, reasons, importances
