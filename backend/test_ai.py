import requests
import json

BASE = "http://127.0.0.1:8000"

r = requests.post(f"{BASE}/auth/login", json={"username": "admin@bank.com", "password": "admin123"})
token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

print("=== AI Status ===")
r = requests.get(f"{BASE}/ai/status", headers=headers)
print(json.dumps(r.json(), indent=2))

print("\n=== Threat Analysis (High Risk) ===")
r = requests.post(f"{BASE}/ai/threat-analysis", json={
    "new_device": 1, "new_location": 1, "failed_logins": 4,
    "files_downloaded": 1500, "commands_executed": 35,
    "login_hour": 2, "weekend": 1, "session_duration": 180
}, headers=headers)
data = r.json()
print("Risk:", data["risk"], "-", data["risk_score"], "/100")
print("AI Enabled:", data["ai_enabled"])
print("Threat Type:", data["ai_analysis"].get("threat_type", "N/A"))
print("Summary:", data["ai_analysis"].get("summary", "N/A")[:300])
print("Actions:", data["ai_analysis"].get("recommended_actions", []))

print("\n=== Security Summary ===")
r = requests.get(f"{BASE}/ai/summary", headers=headers)
data = r.json()
print("AI Enabled:", data["ai_enabled"])
print("Executive Summary:", data["ai_summary"].get("executive_summary", "N/A")[:300])
print("Key Findings:", data["ai_summary"].get("key_findings", []))

print("\n=== Predict + AI Narrative ===")
r = requests.post(f"{BASE}/predict-risk", json={
    "new_device": 1, "new_location": 0, "failed_logins": 3,
    "files_downloaded": 800, "commands_executed": 25,
    "login_hour": 1, "weekend": 0, "session_duration": 150
}, headers=headers)
data = r.json()
print("Risk:", data["risk"], "-", data["risk_score"], "/100")
print("AI Narrative:", data.get("ai_narrative", "N/A")[:300])

print("\n=== All endpoints working ===")
