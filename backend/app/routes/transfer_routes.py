from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.data.db import get_db
from app.models.user_model import User
from app.routes.auth_routes import get_current_user
from app.schemas.transfer_schema import (
    TransferCheckoutResponse,
    TransferCreate,
    TransferQuoteRequest,
    TransferQuoteResponse,
    TransferResponse,
    TransferStatusUpdate,
)
from app.services.transfer_service import (
    cancel_transfer,
    create_transfer,
    create_transfer_checkout,
    get_transfer_or_404,
    list_transfers,
    quote_transfer,
    update_transfer_status,
)


router = APIRouter(prefix="/transfers", tags=["Transfers"])


@router.post("/quote", response_model=TransferQuoteResponse)
def quote(
    payload: TransferQuoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return quote_transfer(db, current_user, payload)


@router.post("", response_model=TransferResponse)
def create(
    payload: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_transfer(db, current_user, payload)


@router.get("", response_model=List[TransferResponse])
def list_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_transfers(db, current_user)


@router.get("/{transfer_id}", response_model=TransferResponse)
def get_one(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_transfer_or_404(db, current_user, transfer_id)


@router.post("/{transfer_id}/checkout", response_model=TransferCheckoutResponse)
def checkout(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_transfer_checkout(db, current_user, transfer_id)


@router.patch("/{transfer_id}/status", response_model=TransferResponse)
def update_status(
    transfer_id: int,
    payload: TransferStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_transfer_status(db, current_user, transfer_id, payload)


@router.post("/{transfer_id}/cancel", response_model=TransferResponse)
def cancel(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return cancel_transfer(db, current_user, transfer_id)