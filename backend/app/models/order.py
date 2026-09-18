from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True)
    order_number = Column(String(128), unique=True, nullable=False, index=True)
    checkout_id = Column(String(64), ForeignKey("checkout_attempts.id", ondelete="SET NULL"), nullable=True)
    payment_id = Column(String(64), ForeignKey("payments.id", ondelete="SET NULL"), unique=True, nullable=True)
    customer_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_id = Column(String(64), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(64), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(32), default="CONFIRMED", nullable=False)  # CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    is_recovered = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="orders")
    merchant = relationship("Merchant", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    checkout = relationship("CheckoutAttempt", back_populates="order")
    payment = relationship("Payment", back_populates="order")
    cases = relationship("Case", back_populates="order")
