from predict import predict_risk


risk=predict_risk(
    new_device=1,
    new_location=1,
    failed_logins=5,
    files_downloaded=400,
    commands_executed=50,
    login_hour=2,
    weekend=1
)


# print(result)