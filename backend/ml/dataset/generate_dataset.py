import pandas as pd
import random
import pandas as pd
import random
import os

# Number of records
NUM_ROWS = 5000

data = []

# Your dataset generation code...

# Number of records
NUM_ROWS = 5000

data = []

for _ in range(NUM_ROWS):

    # Generate random features
    login_hour = random.randint(0, 23)

    new_device = random.choice([0, 1])

    new_location = random.choice([0, 1])

    failed_logins = random.randint(0, 8)

    files_downloaded = random.randint(1, 5000)

    commands_executed = random.randint(0, 60)

    session_duration = random.randint(5, 300)

    weekend_login = random.choice([0, 1])

    # ----------------------------
    # Risk Label Logic
    # ----------------------------

    score = 0

    if new_device == 1:
        score += 2

    if new_location == 1:
        score += 2

    if failed_logins >= 3:
        score += 2

    if files_downloaded > 1000:
        score += 3

    if commands_executed > 30:
        score += 2

    if session_duration > 180:
        score += 1

    if login_hour < 5:
        score += 1

    if weekend_login == 1:
        score += 1

    # Assign Risk Level
    if score <= 3:
        risk = "Low"

    elif score <= 7:
        risk = "Medium"

    else:
        risk = "High"

    data.append([
        login_hour,
        new_device,
        new_location,
        failed_logins,
        files_downloaded,
        commands_executed,
        session_duration,
        weekend_login,
        risk
    ])

# Create DataFrame
columns = [
    "login_hour",
    "new_device",
    "new_location",
    "failed_logins",
    "files_downloaded",
    "commands_executed",
    "session_duration",
    "weekend_login",
    "risk"
]

df = pd.DataFrame(data, columns=columns)

# Save CSV
df.to_csv("privileged_access_dataset.csv", index=False)

print("Dataset Created Successfully!")
print(df.head())
print("\nTotal Records:", len(df))
# Save CSV
df.to_csv("privileged_access_dataset.csv", index=False)

# Print the file location
print("Saved at:", os.path.abspath("privileged_access_dataset.csv"))

print("Dataset Created Successfully!")
print(df.head())
print("\nTotal Records:", len(df))