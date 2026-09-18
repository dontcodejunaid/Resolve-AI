from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class CaseEvent(Base):
    __tablename__ = "case_events"

    id = Column(String(64), primary_key=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    actor_type = Column(String(32), nullable=False)  # AI, SYSTEM, CUSTOMER, EMPLOYEE, PROVIDER, MERCHANT
    actor_id = Column(String(64), nullable=True)
    event_metadata = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)

    # Relationships
    case = relationship("Case", back_populates="events")
