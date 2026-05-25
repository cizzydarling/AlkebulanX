from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.countries import COUNTRY_OPTIONS
from app.data.db import get_db
from app.models.recipient_model import Recipient
from app.services.provider_router import get_destination_currency, get_provider_quotes


router = APIRouter(prefix="/rates", tags=["Rates"])


MOCK_RATES = {
    "GHS": 8.65,
    "NGN": 1120.00,
    "XOF": 430.00,
}


class RatePreviewRequest(BaseModel):
    recipient_id: int
    send_amount: float = Field(..., gt=0)
    source_currency: str = "CAD"
    destination_currency: str = "GHS"


@router.get("/corridors")
def list_corridor_rates():
    return [
        {
            "source_country": "Canada",
            "source_currency": "CAD",
            "destination_country": country["name"],
            "destination_currency": country["currency"],
            "sample_rate": MOCK_RATES.get(country["currency"], 1),
            "providers": country["providers"],
            "is_live": False,
        }
        for country in COUNTRY_OPTIONS
    ]


@router.post("/preview")
def preview_rate(payload: RatePreviewRequest, db: Session = Depends(get_db)):
    recipient = db.query(Recipient).filter(Recipient.id == payload.recipient_id).first()

    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found.",
        )

    destination_currency = get_destination_currency(
        recipient=recipient,
        fallback=payload.destination_currency,
    )

    quotes = get_provider_quotes(
        recipient=recipient,
        send_amount=payload.send_amount,
        source_currency=payload.source_currency,
        destination_currency=destination_currency,
    )

    if not quotes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available providers for this recipient country yet.",
        )

    best_quote = quotes[0]

    return {
        "recipient_id": recipient.id,
        "send_amount": payload.send_amount,
        "source_currency": payload.source_currency.upper(),
        "destination_currency": destination_currency.upper(),
        "best_quote": best_quote,
        "quotes_count": len(quotes),
        "is_live": False,
    }