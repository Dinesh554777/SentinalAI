import requests

BASE = "http://127.0.0.1:8000"

print("=== 1. Test duplicate prevention ===")
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Administrator", "email": "admin@bank.com", "password": "test123", "role": "Admin"
})
print(f"Register duplicate email: {r.status_code} - {r.json()['detail']}")

r = requests.post(f"{BASE}/auth/register", json={
    "name": "Administrator", "email": "new@bank.com", "password": "test123", "role": "Admin"
})
print(f"Register duplicate name: {r.status_code} - {r.json()['detail']}")

r = requests.post(f"{BASE}/auth/register", json={
    "name": "NewUser", "email": "newuser@bank.com", "password": "test123", "role": "Standard"
})
print(f"Register new user: {r.status_code} - {r.json()}")

print("\n=== 2. Test login ===")
r = requests.post(f"{BASE}/auth/login", json={"username": "admin@bank.com", "password": "admin123"})
print(f"Login admin: {r.status_code}")
token = r.json()["access_token"]
user_id = r.json()["user_id"]
name = r.json()["name"]
print(f"  token: {token[:30]}..., user_id: {user_id}, name: {name}")

headers = {"Authorization": f"Bearer {token}"}

print("\n=== 3. Test authenticated requests ===")
r = requests.get(f"{BASE}/dashboard", headers=headers)
print(f"Dashboard: {r.status_code} - active_sessions: {r.json().get('active_sessions', 'N/A')}")

r = requests.get(f"{BASE}/auth/me", headers=headers)
print(f"Me: {r.status_code} - {r.json()}")

r = requests.get(f"{BASE}/auth/sessions", headers=headers)
print(f"Sessions: {r.status_code} - count: {len(r.json())}")

print("\n=== 4. Test concurrent sessions ===")
r2 = requests.post(f"{BASE}/auth/login", json={"username": "admin@bank.com", "password": "admin123"})
print(f"Login admin again: {r2.status_code}")

r = requests.get(f"{BASE}/auth/sessions", headers=headers)
print(f"Active sessions now: {len(r.json())}")

print("\n=== 5. Test rate limiting / lockout ===")
for i in range(6):
    r = requests.post(f"{BASE}/auth/login", json={"username": "admin@bank.com", "password": "wrongpassword"})
    print(f"  Attempt {i+1}: {r.status_code} - {r.json().get('detail', 'N/A')[:60]}")

print("\n=== 6. Test logout ===")
r = requests.post(f"{BASE}/auth/logout", headers=headers)
print(f"Logout: {r.status_code} - {r.json()}")

r = requests.get(f"{BASE}/dashboard", headers=headers)
print(f"After logout, dashboard: {r.status_code}")
