from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Action(Base):
    __tablename__ = "actions"

    id = Column(String(64), primary_key=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(64), nullable=False)
    # CHECK_PAYMENT, CHECK_ORDER, CHECK_STOCK, CHECK_REFUND, RECOVER_ORDER,
    # REQUEST_REFUND, SEND_NOTIFICATION, ESCALATE, RETRY, SCHEDULE_RECHECK
    requested_by = Column(String(64), nullable=False)
    approved_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False)  # PENDING, IN_PROGRESS, SUCCESS, FAILED
    idempotency_key = Column(String(128), unique=True, nullable=True, index=True)
    provider_reference = Column(String(128), nullable=True)
    request_metadata = Column(Text, nullable=True)  # JSON string
    result_metadata = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    case = relationship("Case", back_populates="actions")
    approver = relationship("User", foreign_keys=[approved_by])
