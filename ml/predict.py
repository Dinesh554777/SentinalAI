import joblib
import pandas as pd

# Load trained model
model = joblib.load("models/risk_model.pkl")

# Risk labels
risk_labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}


def predict_risk(data: dict):

    df = pd.DataFrame([data])

    prediction = model.predict(df)

    risk = risk_labels[int(prediction[0])]

    risk_scores = {
        "Low": 25,
        "Medium": 60,
        "High": 90
    }

    reasons = []

    if data["new_device"]:
        reasons.append("Login from a new device")

    if data["new_location"]:
        reasons.append("Login from a new location")

    if data["failed_logins"] >= 3:
        reasons.append("Multiple failed login attempts")

    if data["files_downloaded"] > 1000:
        reasons.append("Large number of downloaded files")

    if data["login_hour"] < 5:
        reasons.append("Login during unusual hours")

    if data["weekend_login"]:
        reasons.append("Weekend login detected")

    return {
        "risk": risk,
        "risk_score": risk_scores[risk],
        "reasons": reasons
    }