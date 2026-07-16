import joblib
import pandas as pd

# Load the trained model
model = joblib.load("models/risk_model.pkl")

# Label Mapping
risk_labels = {
    0: "Low",
    1: "Medium",
    2: "High"
}


def predict_risk(
    login_hour,
    new_device,
    new_location,
    failed_logins,
    files_downloaded,
    commands_executed,
    session_duration,
    weekend_login
):
    # Create DataFrame
    sample = pd.DataFrame([{
        "login_hour": login_hour,
        "new_device": new_device,
        "new_location": new_location,
        "failed_logins": failed_logins,
        "files_downloaded": files_downloaded,
        "commands_executed": commands_executed,
        "session_duration": session_duration,
        "weekend_login": weekend_login
    }])

    prediction = model.predict(sample)

    return risk_labels[int(prediction[0])]


# Test
if __name__ == "__main__":

    risk=predict_risk(
    login_hour=3,
    new_device=1,
    new_location=0,
    failed_logins=2,
    files_downloaded=600,
    commands_executed=15,
    session_duration=90,
    weekend_login=1
)

    print("Predicted Risk:", risk)