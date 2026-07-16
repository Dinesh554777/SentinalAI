import joblib
import matplotlib.pyplot as plt

model = joblib.load("models/risk_model.pkl")

features = [
    "login_hour",
    "new_device",
    "new_location",
    "failed_logins",
    "files_downloaded",
    "commands_executed",
    "session_duration",
    "weekend_login"
]

importance = model.feature_importances_

plt.figure(figsize=(8, 5))
plt.barh(features, importance)
plt.xlabel("Importance")
plt.title("Feature Importance")
plt.tight_layout()
plt.show()