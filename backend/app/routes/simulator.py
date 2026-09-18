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


@router.get("/bank/refunds")
async def list_bank_refunds(
    db: AsyncSession = Depends(get_db),
):
    """Lists all simulated refund payout transactions from the banking gateway perspective."""
    from backend.app.models.refund import Refund
    from backend.app.models.case import Case
    from sqlalchemy.future import select
    from sqlalchemy.orm import selectinload

    res = await db.execute(
        select(Refund)
        .order_by(Refund.created_at.desc())
    )
    refunds = res.scalars().all()

    items = []
    for rfd in refunds:
        res_case = await db.execute(select(Case).filter(Case.refund_id == rfd.id))
        c = res_case.scalars().first()
        items.append({
            "id": rfd.id,
            "refund_reference": rfd.refund_reference,
            "provider_reference": rfd.provider_reference,
            "payment_id": rfd.payment_id,
            "amount": float(rfd.amount),
            "currency": rfd.currency,
            "status": rfd.status,
            "reason": rfd.reason,
            "created_at": rfd.created_at.isoformat() if rfd.created_at else None,
            "case_id": c.id if c else None,
            "case_number": c.case_number if c else None,
        })
    return {"refunds": items}


@router.post("/bank/refunds/{refund_id}/settle")
async def settle_bank_refund(
    refund_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Simulates the bank releasing and confirming the refund payout settlement."""
    from backend.app.models.refund import Refund
    from backend.app.models.case import Case
    from backend.app.services.case_engine import CaseEngine
    from backend.app.services.refund_simulator import RefundSimulator
    from sqlalchemy.future import select

    refund = await RefundSimulator.transition_refund_to_success(db, refund_id)
    if not refund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refund transaction not found")

    res_case = await db.execute(select(Case).filter(Case.refund_id == refund.id))
    case = res_case.scalars().first()
    if case:
        await CaseEngine.step_refund_verification(db, case.id)

    # Sync to MongoDB Atlas
    try:
        from backend.app.mongodb import sync_model_to_mongo
        await sync_model_to_mongo("refunds", refund)
    except Exception as e:
        print(f"[MongoDB Settle Sync Warning] {e}")

    return {
        "status": "SUCCESS",
        "message": f"Bank gateway successfully settled refund {refund.provider_reference}",
        "refund_id": refund.id,
        "provider_reference": refund.provider_reference,
        "payout_status": "SUCCESS",
        "case_id": case.id if case else None,
    }


@router.get("/bank/pending-payments")
async def list_bank_pending_payments(
    db: AsyncSession = Depends(get_db),
):
    """Lists incoming payments that are currently PENDING with the bank."""
    from backend.app.models.payment import Payment
    from backend.app.models.case import Case
    from sqlalchemy.future import select

    res = await db.execute(
        select(Payment)
        .filter(Payment.status == "PENDING")
        .order_by(Payment.created_at.desc())
    )
    payments = res.scalars().all()

    items = []
    for pay in payments:
        res_case = await db.execute(select(Case).filter(Case.payment_id == pay.id))
        c = res_case.scalars().first()
        items.append({
            "id": pay.id,
            "payment_reference": pay.payment_reference,
            "amount": float(pay.amount),
            "currency": pay.currency,
            "status": pay.status,
            "provider_name": pay.provider_name,
            "created_at": pay.created_at.isoformat() if pay.created_at else None,
            "case_id": c.id if c else None,
            "case_number": c.case_number if c else None,
        })
    return {"pending_payments": items}


@router.post("/bank/payments/{payment_id}/clear")
async def clear_bank_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Simulates the bank clearing a pending payment to SUCCESS and progressing the case."""
    from backend.app.models.payment import Payment
    from backend.app.models.case import Case
    from backend.app.services.case_engine import CaseEngine
    from sqlalchemy.future import select

    res_pay = await db.execute(select(Payment).filter(Payment.id == payment_id))
    payment = res_pay.scalars().first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment transaction not found")

    payment.status = "SUCCESS"
    await db.commit()

    # If an active case is waiting for this payment, automatically place recovered order and resolve the case
    res_case = await db.execute(select(Case).filter(Case.payment_id == payment.id))
    case = res_case.scalars().first()
    if case:
        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="PAYMENT_CLEARED_BY_BANK",
            description=f"Bank Gateway confirmed receipt of payment {payment.payment_reference} (₹{payment.amount}). Funds settled to merchant account.",
            actor_type="PROVIDER",
            actor_id="SIMULATED_BANK_GATEWAY",
        )
        
        # Get customer user
        from backend.app.models.user import User
        res_user = await db.execute(select(User).filter(User.id == case.customer_id))
        customer = res_user.scalars().first()
        
        # Automatically place the recovered order and resolve the case
        try:
            await CaseEngine.process_customer_recovery_confirmation(
                db=db,
                case_id=case.id,
                user=customer,
                accepted=True,
                notes="Automated recovery executed upon bank settlement clearance."
            )
        except Exception as e:
            import traceback
            print(f"[Auto Recovery Warning] {e}\n{traceback.format_exc()}")

    # Sync to MongoDB Atlas
    try:
        from backend.app.mongodb import sync_model_to_mongo
        await sync_model_to_mongo("payments", payment)
        if case:
            refreshed_case = await CaseEngine.get_case_with_relations(db, case.id)
            if refreshed_case:
                await sync_model_to_mongo("cases", refreshed_case)
    except Exception as e:
        print(f"[MongoDB Payment Settle Sync Warning] {e}")

    return {
        "status": "SUCCESS",
        "message": f"Bank gateway cleared payment {payment.payment_reference} to SUCCESS. Order created and case RESOLVED.",
        "payment_id": payment.id,
        "payment_reference": payment.payment_reference,
        "gateway_status": "SUCCESS",
        "case_id": case.id if case else None,
    }
