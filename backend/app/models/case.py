from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True)
    case_number = Column(String(64), unique=True, nullable=False, index=True)  # e.g., RS-4471
    customer_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_id = Column(String(64), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(String(64), ForeignKey("payments.id", ondelete="SET NULL"), nullable=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    refund_id = Column(String(64), ForeignKey("refunds.id", ondelete="SET NULL"), nullable=True)
    issue_type = Column(String(64), nullable=False)  # PAYMENT_SUCCESS_ORDER_MISSING, etc.
    customer_request = Column(Text, nullable=False)
    status = Column(String(32), default="NEW", nullable=False, index=True)
    # NEW, INVESTIGATING, WAITING_FOR_CUSTOMER, WAITING_FOR_PROVIDER,
    # WAITING_FOR_APPROVAL, ACTION_IN_PROGRESS, VERIFYING, RESOLVED, ESCALATED, FAILED
    resolution_type = Column(String(64), nullable=True)
    # ORDER_RECOVERY, REFUND_ISSUED, PAYMENT_PENDING_SCHEDULED,
    # EXISTING_ORDER_CONFIRMED, EXISTING_REFUND_TRACKED, MANUAL_ESCALATION, UNRESOLVED
    ai_summary = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("User", back_populates="cases", foreign_keys=[customer_id])
    merchant = relationship("Merchant", back_populates="cases")
    payment = relationship("Payment", back_populates="cases")
    order = relationship("Order", back_populates="cases")
    refund = relationship("Refund", back_populates="cases")
    events = relationship("CaseEvent", back_populates="case", cascade="all, delete-orphan", order_by="CaseEvent.created_at")
    actions = relationship("Action", back_populates="case", cascade="all, delete-orphan", order_by="Action.created_at")
    approvals = relationship("Approval", back_populates="case", cascade="all, delete-orphan", order_by="Approval.created_at")
    notifications = relationship("Notification", back_populates="case", cascade="all, delete-orphan")
