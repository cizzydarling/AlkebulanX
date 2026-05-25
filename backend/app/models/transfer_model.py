from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.data.db import Base


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    recipient_id = Column(Integer, ForeignKey("recipients.id"), nullable=False, index=True)

    source_currency = Column(String(10), default="CAD")
    destination_currency = Column(String(10), nullable=False)

    send_amount = Column(Float, nullable=False)
    estimated_receive_amount = Column(Float, nullable=True)

    provider = Column(String(50), nullable=False)
    provider_reference = Column(String(150), nullable=True)

    exchange_rate = Column(Float, nullable=True)
    fee_amount = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    status = Column(String(50), default="created")
    # created, quoted, pending_provider, processing, completed, failed, cancelled

    payment_method = Column(String(50), nullable=True)
    payout_method = Column(String(50), nullable=True)

    reason = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)

    compliance_review_status = Column(String(50), default="not_required")
    compliance_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="transfers")
    recipient = relationship("Recipient", backref="transfers")