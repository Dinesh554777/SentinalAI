from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    full_name: Optional[str] = Field(None, example="Jane Doe")
    role: str = Field("user", example="DBA")
    password: str = Field(..., example="strongpassword", description="Write-only password")


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, example="user@example.com")
    full_name: Optional[str] = Field(None, example="Jane Doe")
    role: Optional[str] = Field(None, example="user")
    password: Optional[str] = Field(None, example="newstrongpassword")


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    role: str
    is_active: bool

    class Config:
        orm_mode = True
