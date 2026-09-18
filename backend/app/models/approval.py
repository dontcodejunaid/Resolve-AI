from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(64), nullable=False)  # REQUEST_REFUND, FORCE_RECOVERY, etc.
    reason = Column(Text, nullable=False)
    amount = Column(Numeric(12, 2), nullable=True)
    status = Column(String(32), default="PENDING", nullable=False, index=True)  # PENDING, APPROVED, REJECTED
    requested_by = Column(String(64), nullable=False)  # AI, SYSTEM, AGENT
    reviewed_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    decision_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    case = relationship("Case", back_populates="approvals")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
