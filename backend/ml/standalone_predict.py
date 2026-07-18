import joblib
import pandas as pd

# Load trained model and encoder
model = joblib.load("models/risk_model.pkl")
encoder = joblib.load("models/encoder.pkl")


def predict_risk(data: dict):
    """
    Predict risk based on user activity.
    """

    df = pd.DataFrame([data])
    df = df[model.feature_names_in_]

    prediction = model.predict(df)

    risk = encoder.inverse_transform(prediction)[0]

    # Optional risk score
    risk_scores = {
        "Low": 25,
        "Medium": 60,
        "High": 90
    }

    # Explainable reasons
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


# ------------------------------
# Test
# ------------------------------

if __name__ == "__main__":

    sample = {
        "login_hour": 2,
        "new_device": 1,
        "new_location": 1,
        "failed_logins": 5,
        "files_downloaded": 3500,
        "commands_executed": 45,
        "session_duration": 200,
        "weekend_login": 1
    }

    result = predict_risk(sample)

    print(result)