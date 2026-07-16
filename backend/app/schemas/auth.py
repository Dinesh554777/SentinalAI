from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserOut(BaseModel):
    username: str
    is_active: bool
    role: Optional[str] = None
