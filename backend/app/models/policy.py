from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class MerchantPolicy(Base):
    __tablename__ = "merchant_policies"

    id = Column(String(64), primary_key=True)
    merchant_id = Column(String(64), ForeignKey("merchants.id", ondelete="CASCADE"), unique=True, nullable=False)
    order_recovery_enabled = Column(Boolean, default=True, nullable=False)
    refund_enabled = Column(Boolean, default=True, nullable=False)
    refund_approval_required = Column(Boolean, default=True, nullable=False)
    refund_approval_threshold = Column(Numeric(12, 2), default=500.00, nullable=False)
    auto_retry_limit = Column(Integer, default=3, nullable=False)
    recon_delay_seconds = Column(Integer, default=30, nullable=False)
    policy_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    merchant = relationship("Merchant", back_populates="policies")
