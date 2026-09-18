from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class CheckoutAttempt(Base):
    __tablename__ = "checkout_attempts"

    id = Column(String(64), primary_key=True)
    checkout_reference = Column(String(128), unique=True, nullable=False, index=True)
    customer_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    merchant_id = Column(String(64), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(64), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(32), default="INITIATED", nullable=False)  # INITIATED, COMPLETED, ABANDONED, FAILED
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="checkout_attempts")
    merchant = relationship("Merchant", back_populates="checkout_attempts")
    product = relationship("Product", back_populates="checkout_attempts")
    payment = relationship("Payment", back_populates="checkout", uselist=False)
    order = relationship("Order", back_populates="checkout", uselist=False)
