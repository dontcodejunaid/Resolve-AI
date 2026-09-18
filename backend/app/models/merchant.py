from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    api_key = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    products = relationship("Product", back_populates="merchant", cascade="all, delete-orphan")
    policies = relationship("MerchantPolicy", back_populates="merchant", uselist=False, cascade="all, delete-orphan")
    cases = relationship("Case", back_populates="merchant")
    orders = relationship("Order", back_populates="merchant")
    payments = relationship("Payment", back_populates="merchant")
    checkout_attempts = relationship("CheckoutAttempt", back_populates="merchant")
    refunds = relationship("Refund", back_populates="merchant")
