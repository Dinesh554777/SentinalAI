from predict import predict_risk


sample = {
    "new_device": 1,
    "new_location": 1,
    "failed_logins": 5,
    "files_downloaded": 400,
    "commands_executed": 50,
    "login_hour": 2,
    "session_duration": 120,
    "weekend_login": 1
}

risk = predict_risk(sample)
print("Risk analysis result:", risk)