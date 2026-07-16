# SentinalAI
# SentinelAI - AI/ML Module

## Overview

The AI/ML module of SentinelAI is responsible for detecting privileged access misuse and insider threats by analyzing user behavior and predicting the risk level.

It uses Machine Learning models to classify user activities into:

- Low Risk
- Medium Risk
- High Risk

This module is designed to support Security Operations Center (SOC) analysts by providing intelligent risk predictions based on user activity.

---

# Objectives

- Detect abnormal privileged user behavior
- Predict insider threat risk
- Classify users into Low, Medium, or High risk
- Support real-time risk assessment
- Integrate with the FastAPI backend

---

# Features Used

The model uses the following user activity features:

| Feature | Description |
|----------|-------------|
| login_hour | Hour of login (0–23) |
| new_device | Login from a new device |
| new_location | Login from a new location |
| failed_logins | Number of failed login attempts |
| files_downloaded | Number of downloaded files |
| commands_executed | Number of executed commands |
| session_duration | Login session duration (minutes) |
| weekend_login | Login on a weekend |

---

# Machine Learning Models

## Isolation Forest

Purpose:

- Detect abnormal user behavior
- Identify anomalous privileged activities

Examples:

- Large file downloads
- Unusual login time
- Suspicious login locations

---

## XGBoost Classifier

Purpose:

Predict user risk level.

Output:

- Low
- Medium
- High

---

# Dataset

A synthetic dataset was created for training.

Dataset contains:

- User login activities
- Device information
- Login location
- Failed login attempts
- File download count
- Session duration
- Weekend activity
- Risk label

---

# Project Structure

```
ml/
│
├── dataset/
│   ├── generate_dataset.py
│   └── privileged_access_dataset.csv
│
├── models/
│   ├── anomaly_model.pkl
│   └── risk_model.pkl
│
├── train_model.py
├── predict.py
└── README.md
```

---

# Model Training

Run:

```bash
python train_model.py
```

The script will:

- Load dataset
- Preprocess data
- Train Isolation Forest
- Train XGBoost classifier
- Evaluate accuracy
- Save trained models

Saved Models:

```
models/
├── anomaly_model.pkl
└── risk_model.pkl
```

---

# Model Prediction

Run:

```bash
python predict.py
```

Example Output

```
Predicted Risk: High
```

---

# Model Performance

Accuracy:

```
98.7%
```

Classification:

- Low Risk
- Medium Risk
- High Risk

---

# Technologies Used

- Python
- Pandas
- NumPy
- Scikit-Learn
- XGBoost
- Joblib

---

# Integration

The backend can import the prediction module.

Example:

```python
from predict import predict_risk
```

Example Input

```python
predict_risk(
    login_hour=2,
    new_device=1,
    new_location=1,
    failed_logins=5,
    files_downloaded=3500,
    commands_executed=45,
    session_duration=200,
    weekend_login=1
)
```

Example Output

```python
High
```

---

# Future Enhancements

- Real-time behavior monitoring
- Continuous model retraining
- SHAP Explainable AI
- Deep Learning models
- Kafka event streaming
- User behavior profiling
- Dynamic risk scoring
- Quantum-safe security integration

---

# Contributors

AI/ML Module

- Dataset Generation
- Feature Engineering
- Isolation Forest
- XGBoost Model
- Risk Prediction
- Model Evaluation
- Backend Integration Support

---

# SentinelAI

AI-Powered Privileged Access Misuse & Insider Threat Detection System for Banking Security.