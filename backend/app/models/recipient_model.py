from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.data.db import Base


class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    nickname = Column(String(100), nullable=True)
    full_name = Column(String(150), nullable=False)
    phone_number = Column(String(50), nullable=False)

    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)

    payout_method = Column(String(50), nullable=False)  # mobile_money, bank_account
    provider_preference = Column(String(50), nullable=True)  # flutterwave, paystack, orange_money

    mobile_money_network = Column(String(100), nullable=True)  # MTN, Orange, AirtelTigo, Moov
    bank_name = Column(String(150), nullable=True)
    bank_account_number = Column(String(100), nullable=True)

    relationship_to_sender = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="recipients")