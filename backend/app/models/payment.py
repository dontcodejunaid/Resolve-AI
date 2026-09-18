from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(64), primary_key=True)
    payment_reference = Column(String(128), unique=True, nullable=False, index=True)
    checkout_id = Column(String(64), ForeignKey("checkout_attempts.id", ondelete="SET NULL"), nullable=True)
    customer_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_id = Column(String(64), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(32), nullable=False)  # PENDING, SUCCESS, FAILED, REFUNDED, PARTIALLY_REFUNDED
    provider_name = Column(String(64), default="SIMULATED_GATEWAY", nullable=False)
    provider_payload = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="payments")
    merchant = relationship("Merchant", back_populates="payments")
    checkout = relationship("CheckoutAttempt", back_populates="payment")
    order = relationship("Order", back_populates="payment", uselist=False)
    refunds = relationship("Refund", back_populates="payment")
    cases = relationship("Case", back_populates="payment")
