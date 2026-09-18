import uuid
import json
from decimal import Decimal
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.models.payment import Payment
from backend.app.models.checkout import CheckoutAttempt


class PaymentSimulator:
    """
    Simulated Payment Gateway Environment.
    Clearly marked as SIMULATED PAYMENT ENVIRONMENT.
    Provides realistic mock responses, error states, pending states, and idempotency.
    """

    ENVIRONMENT_NAME = "SIMULATED PAYMENT ENVIRONMENT"

    @staticmethod
    async def get_payment_by_reference(db: AsyncSession, reference: str) -> Optional[Payment]:
        result = await db.execute(select(Payment).filter(Payment.payment_reference == reference))
        return result.scalars().first()

    @staticmethod
    async def get_payment_by_id(db: AsyncSession, payment_id: str) -> Optional[Payment]:
        result = await db.execute(select(Payment).filter(Payment.id == payment_id))
        return result.scalars().first()

    @staticmethod
    async def create_simulated_payment(
        db: AsyncSession,
        customer_id: str,
        merchant_id: str,
        amount: Decimal,
        currency: str = "INR",
        checkout_id: Optional[str] = None,
        initial_status: str = "SUCCESS",
        custom_ref: Optional[str] = None,
    ) -> Payment:
        ref = custom_ref or f"TXN{uuid.uuid4().hex[:8].upper()}"
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=ref,
            checkout_id=checkout_id,
            customer_id=customer_id,
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            status=initial_status,
            provider_name="SIMULATED_GATEWAY",
            provider_payload=json.dumps({
                "environment": PaymentSimulator.ENVIRONMENT_NAME,
                "simulated_ref": ref,
                "gateway_status": initial_status,
                "auth_code": f"SIM_AUTH_{uuid.uuid4().hex[:6].upper()}",
            })
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def check_gateway_status(
        db: AsyncSession,
        payment_reference: str
    ) -> Dict[str, Any]:
        """Queries the simulated payment provider for authoritative gateway status."""
        payment = await PaymentSimulator.get_payment_by_reference(db, payment_reference)
        if not payment:
            return {
                "found": False,
                "status": "NOT_FOUND",
                "message": "Payment reference does not exist on simulated gateway",
                "environment": PaymentSimulator.ENVIRONMENT_NAME
            }
        return {
            "found": True,
            "payment_id": payment.id,
            "payment_reference": payment.payment_reference,
            "status": payment.status,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "customer_id": payment.customer_id,
            "merchant_id": payment.merchant_id,
            "provider": payment.provider_name,
            "environment": PaymentSimulator.ENVIRONMENT_NAME,
        }
