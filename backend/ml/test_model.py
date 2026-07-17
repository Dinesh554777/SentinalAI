import joblib

model = joblib.load("models/risk_model.pkl")

print("✅ Model loaded successfully")
print("Model type:", type(model))
print("Classes:", model.classes_)
print("Expected features:", model.n_features_in_)
print("Feature names:", model.feature_names_in_)