import uuid
from decimal import Decimal
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.models.refund import Refund
from backend.app.models.payment import Payment


class RefundSimulator:
    """
    Simulated Refund Provider System.
    Provides idempotent refund issuance, status checks, and simulated lifecycle transitions.
    """

    @staticmethod
    async def get_refund_by_payment(db: AsyncSession, payment_id: str) -> Optional[Refund]:
        result = await db.execute(select(Refund).filter(Refund.payment_id == payment_id))
        return result.scalars().first()

    @staticmethod
    async def get_refund_by_id(db: AsyncSession, refund_id: str) -> Optional[Refund]:
        result = await db.execute(select(Refund).filter(Refund.id == refund_id))
        return result.scalars().first()

    @staticmethod
    async def request_refund(
        db: AsyncSession,
        payment: Payment,
        reason: str,
        approved_by: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        initial_status: str = "PENDING"
    ) -> Tuple[Refund, bool]:
        """
        Idempotent refund request:
        Returns (refund, created_bool)
        """
        # Check idempotency by payment or key
        existing_refund = await RefundSimulator.get_refund_by_payment(db, payment.id)
        if existing_refund:
            return existing_refund, False

        provider_ref = f"REF-{uuid.uuid4().hex[:6].upper()}"
        refund_ref = f"RFD-RS-{uuid.uuid4().hex[:6].upper()}"

        refund = Refund(
            id=f"rfd_{uuid.uuid4().hex[:12]}",
            refund_reference=refund_ref,
            provider_reference=provider_ref,
            payment_id=payment.id,
            customer_id=payment.customer_id,
            merchant_id=payment.merchant_id,
            amount=payment.amount,
            currency=payment.currency,
            status=initial_status,
            reason=reason,
            approved_by=approved_by,
            idempotency_key=idempotency_key or f"REFUND-{payment.id}",
        )
        db.add(refund)
        await db.commit()
        await db.refresh(refund)
        return refund, True

    @staticmethod
    async def transition_refund_to_success(db: AsyncSession, refund_id: str) -> Optional[Refund]:
        """Simulates external provider completing bank transfer."""
        refund = await RefundSimulator.get_refund_by_id(db, refund_id)
        if not refund:
            return None
        refund.status = "SUCCESS"
        await db.commit()
        await db.refresh(refund)
        return refund
