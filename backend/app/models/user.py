from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="customer")  # customer, employee, merchant, admin
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    cases = relationship("Case", back_populates="customer", foreign_keys="Case.customer_id")
    checkout_attempts = relationship("CheckoutAttempt", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    refunds = relationship("Refund", back_populates="customer", foreign_keys="Refund.customer_id")
    notifications = relationship("Notification", back_populates="user")
