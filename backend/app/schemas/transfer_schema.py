from typing import List, Optional

from pydantic import BaseModel, Field


class ProviderQuote(BaseModel):
    provider: str
    provider_display_name: str

    source_currency: str = "CAD"
    destination_currency: str

    send_amount: float
    exchange_rate: float
    fee_amount: float
    estimated_receive_amount: float
    total_cost: float

    estimated_delivery_time: str
    payout_method: str
    available: bool = True
    message: Optional[str] = None


class TransferQuoteRequest(BaseModel):
    recipient_id: int
    send_amount: float = Field(..., gt=0)
    source_currency: str = "CAD"
    destination_currency: str
    reason: Optional[str] = None


class TransferQuoteResponse(BaseModel):
    recipient_id: int
    send_amount: float
    source_currency: str
    destination_currency: str
    quotes: List[ProviderQuote]


class TransferCreate(BaseModel):
    recipient_id: int
    send_amount: float = Field(..., gt=0)

    source_currency: str = "CAD"
    destination_currency: str

    provider: str
    reason: Optional[str] = None
    notes: Optional[str] = None


class TransferResponse(BaseModel):
    id: int
    user_id: int
    recipient_id: int

    source_currency: str
    destination_currency: str

    send_amount: float
    estimated_receive_amount: Optional[float] = None

    provider: str
    provider_reference: Optional[str] = None

    exchange_rate: Optional[float] = None
    fee_amount: Optional[float] = None
    total_cost: Optional[float] = None

    status: str
    payment_method: Optional[str] = None
    payout_method: Optional[str] = None

    reason: Optional[str] = None
    notes: Optional[str] = None

    compliance_review_status: str
    compliance_notes: Optional[str] = None

    class Config:
        from_attributes = True


class TransferStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern="^(created|quoted|pending_provider|processing|completed|failed|cancelled)$",
    )
    provider_reference: Optional[str] = None
    compliance_notes: Optional[str] = None


class TransferCheckoutResponse(BaseModel):
    transfer_id: int
    provider: str
    checkout_url: str
    reference: str
    status: str
    message: str