from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.compliance import evaluate_transfer_compliance
from app.models.transfer_model import Transfer
from app.models.user_model import User
from app.schemas.transfer_schema import (
    TransferCreate,
    TransferQuoteRequest,
    TransferStatusUpdate,
)
from app.services.audit_log_service import create_audit_log
from app.services.provider_router import (
    get_destination_currency,
    get_provider,
    get_provider_quotes,
)
from app.services.recipient_service import get_recipient_or_404


def quote_transfer(db: Session, current_user: User, payload: TransferQuoteRequest):
    recipient = get_recipient_or_404(db, current_user, payload.recipient_id)

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

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="transfer_quoted",
        entity_type="recipient",
        entity_id=recipient.id,
        details={
            "send_amount": payload.send_amount,
            "source_currency": payload.source_currency,
            "destination_currency": destination_currency,
            "providers_returned": [quote.provider for quote in quotes],
        },
    )

    return {
        "recipient_id": recipient.id,
        "send_amount": payload.send_amount,
        "source_currency": payload.source_currency.upper(),
        "destination_currency": destination_currency.upper(),
        "quotes": quotes,
    }


def create_transfer(db: Session, current_user: User, payload: TransferCreate):
    recipient = get_recipient_or_404(db, current_user, payload.recipient_id)

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

    selected_quote = next(
        (quote for quote in quotes if quote.provider == payload.provider),
        None,
    )

    if not selected_quote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected provider is not available for this transfer.",
        )

    compliance_result = evaluate_transfer_compliance(
        send_amount=payload.send_amount,
        reason=payload.reason,
    )

    transfer = Transfer(
        user_id=current_user.id,
        recipient_id=recipient.id,
        source_currency=payload.source_currency.upper(),
        destination_currency=destination_currency.upper(),
        send_amount=payload.send_amount,
        estimated_receive_amount=selected_quote.estimated_receive_amount,
        provider=selected_quote.provider,
        exchange_rate=selected_quote.exchange_rate,
        fee_amount=selected_quote.fee_amount,
        total_cost=selected_quote.total_cost,
        status="created",
        payment_method="provider_checkout",
        payout_method=recipient.payout_method,
        reason=payload.reason,
        notes=payload.notes,
        compliance_review_status=compliance_result["review_status"],
        compliance_notes=", ".join(compliance_result["flags"]),
    )

    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="transfer_created",
        entity_type="transfer",
        entity_id=transfer.id,
        details={
            "provider": transfer.provider,
            "send_amount": transfer.send_amount,
            "source_currency": transfer.source_currency,
            "destination_currency": transfer.destination_currency,
            "compliance_review_status": transfer.compliance_review_status,
            "compliance_notes": transfer.compliance_notes,
        },
    )

    return transfer


def create_transfer_checkout(db: Session, current_user: User, transfer_id: int):
    transfer = get_transfer_or_404(db, current_user, transfer_id)

    if transfer.status != "created":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Checkout can only be created for transfers with status 'created'.",
        )

    if transfer.provider_reference:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Checkout has already been created for this transfer.",
        )

    if transfer.compliance_review_status == "manual_review_required":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This transfer requires manual compliance review before provider checkout.",
        )

    if transfer.compliance_review_status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This transfer was rejected during compliance review.",
        )

    provider = get_provider(transfer.provider)

    if not provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider is not configured.",
        )

    checkout = provider.create_checkout_session(
        transfer_id=transfer.id,
        amount=transfer.total_cost or transfer.send_amount,
        currency=transfer.source_currency,
        customer_email=current_user.email,
        metadata={
            "user_id": current_user.id,
            "recipient_id": transfer.recipient_id,
            "transfer_id": transfer.id,
            "app": "AlkebulanX",
        },
    )

    transfer.status = "pending_provider"
    transfer.provider_reference = checkout.get("reference")

    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="provider_checkout_created",
        entity_type="transfer",
        entity_id=transfer.id,
        details={
            "provider": transfer.provider,
            "provider_reference": transfer.provider_reference,
            "checkout_url": checkout.get("checkout_url"),
            "status": transfer.status,
        },
    )

    return {
        "transfer_id": transfer.id,
        "provider": transfer.provider,
        "checkout_url": checkout.get("checkout_url"),
        "reference": checkout.get("reference"),
        "status": transfer.status,
        "message": "Provider checkout created.",
    }


def list_transfers(db: Session, current_user: User):
    return (
        db.query(Transfer)
        .filter(Transfer.user_id == current_user.id)
        .order_by(Transfer.id.desc())
        .all()
    )


def get_transfer_or_404(db: Session, current_user: User, transfer_id: int):
    transfer = (
        db.query(Transfer)
        .filter(
            Transfer.id == transfer_id,
            Transfer.user_id == current_user.id,
        )
        .first()
    )

    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found.",
        )

    return transfer


def update_transfer_status(
    db: Session,
    current_user: User,
    transfer_id: int,
    payload: TransferStatusUpdate,
):
    transfer = get_transfer_or_404(db, current_user, transfer_id)

    transfer.status = payload.status

    if payload.provider_reference is not None:
        transfer.provider_reference = payload.provider_reference

    if payload.compliance_notes is not None:
        transfer.compliance_notes = payload.compliance_notes

    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="transfer_status_updated",
        entity_type="transfer",
        entity_id=transfer.id,
        details={
            "status": transfer.status,
            "provider_reference": transfer.provider_reference,
        },
    )

    return transfer


def cancel_transfer(db: Session, current_user: User, transfer_id: int):
    transfer = get_transfer_or_404(db, current_user, transfer_id)

    if transfer.status in ["completed", "failed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This transfer can no longer be cancelled.",
        )

    transfer.status = "cancelled"

    db.commit()
    db.refresh(transfer)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="transfer_cancelled",
        entity_type="transfer",
        entity_id=transfer.id,
        details={"status": transfer.status},
    )

    return transfer