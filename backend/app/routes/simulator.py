import uuid
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.security.dependencies import get_current_user
from backend.app.services.payment_simulator import PaymentSimulator
from backend.app.models.checkout import CheckoutAttempt

router = APIRouter(prefix="/simulator", tags=["Simulator Controls"])


class SimulateCheckoutRequest(BaseModel):
    product_id: str
    quantity: int = 1


class SimulatePaymentRequest(BaseModel):
    checkout_id: str
    status: str = "SUCCESS"  # SUCCESS, PENDING, FAILED


@router.post("/checkout")
async def simulate_checkout(
    req: SimulateCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    chk = CheckoutAttempt(
        id=f"chk_{uuid.uuid4().hex[:12]}",
        checkout_reference=f"CHK-SIM-{uuid.uuid4().hex[:6].upper()}",
        customer_id=current_user.id,
        merchant_id="mer_resolve_store",
        product_id=req.product_id,
        quantity=req.quantity,
        amount=Decimal("799.00"),
        currency="INR",
        status="COMPLETED",
    )
    db.add(chk)
    await db.commit()
    await db.refresh(chk)
    return {"checkout_id": chk.id, "reference": chk.checkout_reference, "amount": float(chk.amount)}


@router.post("/payment")
async def simulate_payment(
    req: SimulatePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await PaymentSimulator.create_simulated_payment(
        db=db,
        customer_id=current_user.id,
        merchant_id="mer_resolve_store",
        amount=Decimal("799.00"),
        currency="INR",
        checkout_id=req.checkout_id,
        initial_status=req.status,
    )
    return {
        "payment_id": payment.id,
        "payment_reference": payment.payment_reference,
        "status": payment.status,
        "environment": PaymentSimulator.ENVIRONMENT_NAME
    }
