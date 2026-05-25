from typing import Optional

from pydantic import BaseModel, Field


class RecipientCreate(BaseModel):
    nickname: Optional[str] = None
    full_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=5)

    country: str = Field(..., min_length=2)
    city: Optional[str] = None

    payout_method: str = Field(..., pattern="^(mobile_money|bank_account)$")
    provider_preference: Optional[str] = None

    mobile_money_network: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None

    relationship_to_sender: Optional[str] = None


class RecipientUpdate(BaseModel):
    nickname: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

    country: Optional[str] = None
    city: Optional[str] = None

    payout_method: Optional[str] = Field(default=None, pattern="^(mobile_money|bank_account)$")
    provider_preference: Optional[str] = None

    mobile_money_network: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None

    relationship_to_sender: Optional[str] = None


class RecipientResponse(BaseModel):
    id: int
    user_id: int

    nickname: Optional[str] = None
    full_name: str
    phone_number: str

    country: str
    city: Optional[str] = None

    payout_method: str
    provider_preference: Optional[str] = None

    mobile_money_network: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None

    relationship_to_sender: Optional[str] = None

    class Config:
        from_attributes = True