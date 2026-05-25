from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)

    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=30)
    province: Optional[str] = Field(default=None, max_length=100)

    @field_validator("*", mode="before")
    @classmethod
    def clean_strings(cls, value):
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=30)
    province: Optional[str] = Field(default=None, max_length=100)

    @field_validator("*", mode="before")
    @classmethod
    def clean_strings(cls, value):
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None

    country_of_residence: str
    province: Optional[str] = None

    role: str

    is_active: bool
    is_verified: bool
    kyc_status: str
    compliance_status: str

    is_premium: bool
    subscription_plan: Optional[str] = None
    subscription_status: Optional[str] = None
    stripe_customer_id: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse