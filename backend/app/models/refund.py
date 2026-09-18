from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(String(64), primary_key=True)
    refund_reference = Column(String(128), unique=True, nullable=False, index=True)
    provider_reference = Column(String(128), unique=True, nullable=True)
    payment_id = Column(String(64), ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    merchant_id = Column(String(64), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(32), default="REQUESTED", nullable=False)  # REQUESTED, PENDING, SUCCESS, FAILED
    reason = Column(Text, nullable=True)
    approved_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    idempotency_key = Column(String(128), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="refunds", foreign_keys=[customer_id])
    merchant = relationship("Merchant", back_populates="refunds")
    payment = relationship("Payment", back_populates="refunds")
    approver = relationship("User", foreign_keys=[approved_by])
    cases = relationship("Case", back_populates="refund")
