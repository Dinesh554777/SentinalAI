import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib


data = pd.read_csv(
    "dataset/privileged_access_dataset.csv"
)


X = data.drop("risk", axis=1)
y = data["risk"]


encoder = LabelEncoder()

y = encoder.fit_transform(y)


model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


model.fit(X,y)


joblib.dump(
    model,
    "models/risk_model.pkl"
)

joblib.dump(
    encoder,
    "models/encoder.pkl"
)


print("Model trained successfully")