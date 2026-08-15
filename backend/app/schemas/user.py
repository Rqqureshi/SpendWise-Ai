from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
import re


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        email = str(value).lower().strip()

        allowed_domains = {
            "gmail.com",
            "googlemail.com",
            "icloud.com",
            "me.com",
            "mac.com",
            "outlook.com",
            "hotmail.com",
            "live.com",
            "msn.com",
            "yahoo.com",
            "yahoo.co.uk",
            "proton.me",
            "protonmail.com",
            "aol.com",
            "mail.com",
            "gmx.com",
            "gmx.net",
            "zoho.com",
        }

        domain = email.split("@")[-1]

        if domain not in allowed_domains:
            raise ValueError(
                "Please use a supported email provider such as Gmail, iCloud, Outlook, Yahoo, or Proton."
            )

        return email


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    profile_picture: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True