from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database import get_db
from backend.app.models import Case, Payment, Order, CheckoutAttempt, Product, Refund, Approval, User
from backend.app.schemas import CaseResponse, PaymentResponse, OrderResponse, ProductResponse, RefundResponse
from backend.app.security.dependencies import verify_internal_api_key
from backend.app.services.case_engine import CaseEngine
from backend.app.services.payment_simulator import PaymentSimulator
from backend.app.services.merchant_simulator import MerchantSimulator
from backend.app.services.refund_simulator import RefundSimulator

router = APIRouter(prefix="/internal", tags=["Internal AI Tools"], dependencies=[Depends(verify_internal_api_key)])


class InternalEventRequest(BaseModel):
    event_type: str
    description: str
    actor_type: str = "AI"
    actor_id: Optional[str] = "n8n_agent"
    metadata: Optional[Dict[str, Any]] = None


class InternalEscalateRequest(BaseModel):
    reason: str
    uncertain_items: Optional[str] = None


class InternalRecoverOrderRequest(BaseModel):
    case_id: str
    payment_id: str
    checkout_id: str


class InternalRefundRequest(BaseModel):
    case_id: str
    payment_id: str
    reason: str


@router.get("/cases/{case_id}", response_model=CaseResponse)
async def internal_get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case


@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def internal_get_payment(payment_id: str, db: AsyncSession = Depends(get_db)):
    payment = await PaymentSimulator.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def internal_get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    order = await MerchantSimulator.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.get("/products/{product_id}", response_model=ProductResponse)
async def internal_get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    product = await MerchantSimulator.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("/refunds/{payment_id}", response_model=Optional[RefundResponse])
async def internal_get_refund_by_payment(payment_id: str, db: AsyncSession = Depends(get_db)):
    refund = await RefundSimulator.get_refund_by_payment(db, payment_id)
    return refund


@router.post("/cases/{case_id}/events")
async def internal_add_event(
    case_id: str,
    req: InternalEventRequest,
    db: AsyncSession = Depends(get_db),
):
    event = await CaseEngine.log_event(
        db=db,
        case_id=case_id,
        event_type=req.event_type,
        description=req.description,
        actor_type=req.actor_type,
        actor_id=req.actor_id,
        metadata=req.metadata,
    )
    return {"status": "SUCCESS", "event_id": event.id}


@router.post("/cases/{case_id}/escalate")
async def internal_escalate_case(
    case_id: str,
    req: InternalEscalateRequest,
    db: AsyncSession = Depends(get_db),
):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    case.status = "ESCALATED"
    case.resolution_type = "MANUAL_ESCALATION"
    await CaseEngine.log_event(
        db,
        case_id=case.id,
        event_type="ESCALATED_TO_HUMAN",
        description=f"AI Agent Escalation: {req.reason}. Uncertain facts: {req.uncertain_items or 'None'}",
        actor_type="AI",
    )
    await db.commit()
    return {"status": "ESCALATED", "case_id": case.id}


@router.post("/actions/recover-order")
async def internal_action_recover_order(
    req: InternalRecoverOrderRequest,
    db: AsyncSession = Depends(get_db),
):
    payment = await PaymentSimulator.get_payment_by_id(db, req.payment_id)
    checkout = await MerchantSimulator.get_checkout(db, req.checkout_id)
    if not payment or not checkout:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment or checkout ID")

    order, is_new = await MerchantSimulator.recover_order_for_payment(db, payment, checkout)
    return {
        "status": "SUCCESS",
        "order_id": order.id,
        "order_number": order.order_number,
        "is_new": is_new,
    }


@router.post("/actions/request-refund")
async def internal_action_request_refund(
    req: InternalRefundRequest,
    db: AsyncSession = Depends(get_db),
):
    payment = await PaymentSimulator.get_payment_by_id(db, req.payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    refund, is_new = await RefundSimulator.request_refund(
        db=db,
        payment=payment,
        reason=req.reason,
    )
    return {
        "status": "SUCCESS",
        "refund_id": refund.id,
        "refund_reference": refund.refund_reference,
        "provider_reference": refund.provider_reference,
        "is_new": is_new,
    }
