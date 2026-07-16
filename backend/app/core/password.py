import hashlib
import os
from secrets import compare_digest


def get_password_hash(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return salt.hex() + ":" + dk.hex()


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_hex, key_hex = hashed_password.split(":")
    except ValueError:
        return False

    salt = bytes.fromhex(salt_hex)
    expected_key = bytes.fromhex(key_hex)
    computed_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return compare_digest(computed_key, expected_key)
