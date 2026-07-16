from predict import predict_risk

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