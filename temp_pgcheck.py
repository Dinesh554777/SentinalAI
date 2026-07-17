import sqlite3
import json
import base64
from hashlib import sha256

conn = sqlite3.connect(r'C:\Users\hp\AppData\Roaming\pgAdmin\pgadmin4.db')
cursor = conn.cursor()

# Get the stored password for server id=2 (local postgres)
cursor.execute("SELECT password FROM server WHERE id=2")
row = cursor.fetchone()
encrypted_pwd = row[0] if row else None

if encrypted_pwd:
    print(f"Encrypted password (first 80 chars): {encrypted_pwd[:80]}")
    print(f"Encrypted password length: {len(encrypted_pwd)}")
else:
    print("No password found")

# Check user table for master password hash
cursor.execute("PRAGMA table_info(user)")
cols = [r[1] for r in cursor.fetchall()]
print(f"\nUser columns: {cols}")

cursor.execute("SELECT * FROM user")
users = cursor.fetchall()
for u in users:
    print(f"User: {u}")

conn.close()
