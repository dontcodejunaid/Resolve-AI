from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Index
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class IdempotencyRecord(Base):
    """
    Deduplication and Idempotency Data Table.
    Tracks seen payment references, case submissions, and execution keys to prevent
    duplicate case minting and double-recovery executions.
    """
    __tablename__ = "idempotency_records"

    id = Column(String(64), primary_key=True)
    idempotency_key = Column(String(128), unique=True, nullable=False, index=True)
    payment_reference = Column(String(128), nullable=True, index=True)
    case_id = Column(String(64), nullable=True, index=True)
    customer_id = Column(String(64), nullable=False, index=True)
    action_type = Column(String(64), nullable=False, default="CASE_CREATION")
    status = Column(String(32), nullable=False, default="ACTIVE")  # ACTIVE, RECOVERED, RESOLVED, EXPIRED
    payload_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (
        Index("ix_idempotency_customer_payment", "customer_id", "payment_reference"),
    )
