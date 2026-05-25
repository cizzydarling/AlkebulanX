from typing import Any, Dict

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.data.db import get_db
from app.schemas.webhook_schema import ProviderWebhookPayload
from app.services.webhook_service import handle_provider_webhook


router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def verify_flutterwave_webhook(
    verif_hash: str | None,
    flutterwave_signature: str | None,
):
    if not settings.USE_LIVE_FLUTTERWAVE:
        return

    expected_secret = settings.FLUTTERWAVE_WEBHOOK_SECRET

    if not expected_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Flutterwave webhook secret is not configured.",
        )

    received_secret = verif_hash or flutterwave_signature

    if received_secret != expected_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Flutterwave webhook signature.",
        )


def extract_flutterwave_fields(payload: Dict[str, Any]) -> tuple[str, str]:
    """
    Supports:
    1. Our mock/test payload:
       { "provider_reference": "FLW-MOCK-1", "status": "success" }

    2. Common Flutterwave webhook shape:
       {
         "event": "charge.completed",
         "data": {
           "tx_ref": "ALKX-1",
           "status": "successful"
         }
       }
    """
    if payload.get("provider_reference"):
        return str(payload["provider_reference"]), str(payload.get("status", "processing"))

    data = payload.get("data") or {}

    provider_reference = data.get("tx_ref") or data.get("flw_ref") or payload.get("tx_ref")
    provider_status = data.get("status") or payload.get("status") or "processing"

    if not provider_reference:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Flutterwave provider reference.",
        )

    return str(provider_reference), str(provider_status)


@router.post("/provider/flutterwave")
async def flutterwave_webhook(
    request: Request,
    db: Session = Depends(get_db),
    verif_hash: str | None = Header(default=None),
    flutterwave_signature: str | None = Header(default=None),
):
    verify_flutterwave_webhook(
        verif_hash=verif_hash,
        flutterwave_signature=flutterwave_signature,
    )

    payload = await request.json()
    provider_reference, provider_status = extract_flutterwave_fields(payload)

    return handle_provider_webhook(
        db=db,
        provider="flutterwave",
        provider_reference=provider_reference,
        provider_status=provider_status,
        raw_payload=payload,
    )


@router.post("/provider/paystack")
def paystack_webhook(
    payload: ProviderWebhookPayload,
    db: Session = Depends(get_db),
):
    return handle_provider_webhook(
        db=db,
        provider="paystack",
        provider_reference=payload.provider_reference,
        provider_status=payload.status,
        raw_payload=payload.raw_payload,
    )


@router.post("/provider/orange-money")
def orange_money_webhook(
    payload: ProviderWebhookPayload,
    db: Session = Depends(get_db),
):
    return handle_provider_webhook(
        db=db,
        provider="orange_money",
        provider_reference=payload.provider_reference,
        provider_status=payload.status,
        raw_payload=payload.raw_payload,
    )