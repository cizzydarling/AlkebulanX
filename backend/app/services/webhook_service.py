from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transfer_model import Transfer
from app.services.audit_log_service import create_audit_log
from app.services.provider_router import get_provider


PROVIDER_STATUS_MAP = {
    "successful": "completed",
    "success": "completed",
    "completed": "completed",
    "paid": "completed",
    "processing": "processing",
    "pending": "processing",
    "failed": "failed",
    "cancelled": "cancelled",
    "canceled": "cancelled",
}


FINAL_STATUSES = {"completed", "failed", "cancelled"}


def normalize_provider_status(provider_status: str) -> str:
    return PROVIDER_STATUS_MAP.get(provider_status.strip().lower(), "processing")


def extract_transaction_id(provider: str, raw_payload: dict | None) -> str | None:
    if provider != "flutterwave" or not raw_payload:
        return None

    data = raw_payload.get("data") or {}

    transaction_id = (
        data.get("id")
        or data.get("transaction_id")
        or raw_payload.get("id")
        or raw_payload.get("transaction_id")
    )

    return str(transaction_id) if transaction_id else None


def verify_provider_payment_if_needed(
    provider: str,
    transfer: Transfer,
    provider_reference: str,
    new_status: str,
    raw_payload: dict | None = None,
):
    if provider != "flutterwave":
        return {
            "verified": True,
            "message": "No provider verification implemented for this provider yet.",
        }

    if new_status != "completed":
        return {
            "verified": True,
            "message": "Verification skipped because provider status is not completed.",
        }

    provider_adapter = get_provider(provider)

    if not provider_adapter or not hasattr(provider_adapter, "verify_transaction"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Flutterwave verification adapter is not configured.",
        )

    transaction_id = extract_transaction_id(provider, raw_payload)

    verification = provider_adapter.verify_transaction(
        provider_reference=provider_reference,
        expected_amount=transfer.total_cost or transfer.send_amount,
        expected_currency=transfer.source_currency,
        transaction_id=transaction_id,
    )

    if not verification.get("verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Flutterwave transaction verification failed.",
                "verification": verification,
            },
        )

    return verification


def handle_provider_webhook(
    db: Session,
    provider: str,
    provider_reference: str,
    provider_status: str,
    raw_payload: dict | None = None,
):
    transfer = (
        db.query(Transfer)
        .filter(
            Transfer.provider == provider,
            Transfer.provider_reference == provider_reference,
        )
        .first()
    )

    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found for provider reference.",
        )

    old_status = transfer.status
    new_status = normalize_provider_status(provider_status)

    if old_status in FINAL_STATUSES:
        create_audit_log(
            db=db,
            user_id=transfer.user_id,
            action="provider_webhook_ignored_final_status",
            entity_type="transfer",
            entity_id=transfer.id,
            details={
                "provider": provider,
                "provider_reference": provider_reference,
                "old_status": old_status,
                "attempted_new_status": new_status,
                "provider_status": provider_status,
                "raw_payload": raw_payload or {},
            },
        )

        return {
            "message": "Webhook ignored because transfer is already in a final status.",
            "transfer_id": transfer.id,
            "provider": provider,
            "old_status": old_status,
            "new_status": old_status,
        }

    verification = verify_provider_payment_if_needed(
        provider=provider,
        transfer=transfer,
        provider_reference=provider_reference,
        new_status=new_status,
        raw_payload=raw_payload,
    )

    transfer.status = new_status

    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=transfer.user_id,
        action="provider_webhook_received",
        entity_type="transfer",
        entity_id=transfer.id,
        details={
            "provider": provider,
            "provider_reference": provider_reference,
            "old_status": old_status,
            "new_status": new_status,
            "provider_status": provider_status,
            "verification": verification,
            "raw_payload": raw_payload or {},
        },
    )

    return {
        "message": "Webhook processed successfully.",
        "transfer_id": transfer.id,
        "provider": provider,
        "old_status": old_status,
        "new_status": new_status,
        "verification": verification,
    }