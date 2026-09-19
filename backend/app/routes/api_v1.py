import uuid
import json
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models import (
    User,
    Merchant,
    Product,
    MerchantPolicy,
    CheckoutAttempt,
    Payment,
    Order,
    Refund,
    Case,
    CaseEvent,
    Action,
    Approval,
    Notification,
    IdempotencyRecord,
)
from backend.app.services.case_engine import CaseEngine
from backend.app.services.payment_simulator import PaymentSimulator
from backend.app.services.merchant_simulator import MerchantSimulator
from backend.app.services.refund_simulator import RefundSimulator
from backend.app.rules.deterministic_rules import DeterministicBusinessRules
from backend.app.rules.state_transitions import CaseStateMachine

router = APIRouter(tags=["Resolve AI API v1 & n8n Integration"])


def utcnow():
    return datetime.now(timezone.utc)


# ==============================================================================
# PYDANTIC SCHEMAS
# ==============================================================================

class WebhookCaseRequest(BaseModel):
    case_id: Optional[str] = None
    customer_id: str = "usr_rahul"
    message: str = "I paid ₹799 but my order is not showing"
    payment_reference: Optional[str] = "TXN987654"
    merchant_id: Optional[str] = "mer_resolve_store"
    timestamp: Optional[str] = None


class RecoverOrderRequest(BaseModel):
    case_id: str
    payment_reference: str
    customer_id: Optional[str] = None
    merchant_id: Optional[str] = None
    product_id: Optional[str] = None
    amount: Optional[Decimal] = None
    idempotency_key: str


class CreateRefundRequest(BaseModel):
    case_id: str
    payment_reference: str
    amount: Decimal = Decimal("799.00")
    reason: str = "Product unavailable / Order mismatch resolution"
    idempotency_key: str


class CaseActionRequest(BaseModel):
    action_type: str  # ORDER_RECOVERY, REFUND, ESCALATE, RETRY
    payment_reference: Optional[str] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = "INR"
    reason: Optional[str] = None
    idempotency_key: str
    payload: Optional[Dict[str, Any]] = None


class ActivityStreamRequest(BaseModel):
    case_id: str
    agent: str  # PAYMENT_AGENT, ORDER_AGENT, INVENTORY_AGENT, POLICY_AGENT, DECISION_AGENT, ACTION_AGENT, VERIFICATION_AGENT, AUDIT_AGENT, SUPPORT_AGENT
    activity: str  # CHECKING_PAYMENT, VERIFYING_ORDER, CHECKING_INVENTORY, CHECKING_REFUND, ANALYZING_POLICY, DECIDING_NEXT_STEP, CREATING_ORDER, PROCESSING_REFUND, VERIFYING_RESULT, MONITORING_SETTLEMENT, ESCALATING_TO_HUMAN, CASE_RESOLVED
    message: str
    status: str = "RUNNING"  # RUNNING, SUCCESS, WAITING, FAILED
    timestamp: Optional[str] = None


class HumanEscalationRequest(BaseModel):
    case_id: str
    customer_request: str
    verified_facts: List[str] = []
    uncertainties: List[str] = []
    actions_attempted: List[str] = []
    decision_required: str
    recommended_action: Optional[str] = None
    reason_for_escalation: str


# ==============================================================================
# 1. PAYMENT SIMULATOR ENDPOINTS (for n8n Payment Verification Tool)
# ==============================================================================

@router.get("/api/payments/{payment_reference}")
async def get_payment_by_reference(
    payment_reference: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Payment).filter(
        (Payment.payment_reference == payment_reference) | (Payment.id == payment_reference)
    )
    res = await db.execute(stmt)
    payment = res.scalars().first()

    if not payment:
        # Autonomous simulation fallback for test payloads and interactive testing
        status_val = "FAILED" if "fail" in payment_reference.lower() else "SUCCESS"
        return {
            "payment_id": f"sim_{payment_reference}",
            "reference": payment_reference,
            "payment_reference": payment_reference,
            "customer_id": "cust_901",
            "merchant_id": "merch_quickkart",
            "amount": 799.00,
            "currency": "INR",
            "status": status_val,
            "merchant_received": status_val == "SUCCESS",
            "provider_name": "RAZORPAY_SIMULATOR",
            "created_at": utcnow().isoformat(),
            "updated_at": utcnow().isoformat(),
        }

    merchant_received = payment.status == "SUCCESS"
    if payment.provider_payload:
        try:
            meta = json.loads(payment.provider_payload)
            if "merchant_received" in meta:
                merchant_received = bool(meta["merchant_received"])
        except Exception:
            pass

    return {
        "payment_id": payment.id,
        "reference": payment.payment_reference,
        "payment_reference": payment.payment_reference,
        "customer_id": payment.customer_id,
        "merchant_id": payment.merchant_id,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "status": payment.status,
        "merchant_received": merchant_received,
        "provider_name": payment.provider_name,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
        "updated_at": payment.updated_at.isoformat() if payment.updated_at else None,
    }


@router.get("/api/payments/{payment_reference}/settlement")
async def get_payment_settlement(
    payment_reference: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Payment).filter(
        (Payment.payment_reference == payment_reference) | (Payment.id == payment_reference)
    )
    res = await db.execute(stmt)
    payment = res.scalars().first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment reference '{payment_reference}' not found."
        )

    settlement_status = "MERCHANT_RECEIVED"
    if payment.provider_payload:
        try:
            meta = json.loads(payment.provider_payload)
            if meta.get("settlement_status"):
                settlement_status = meta["settlement_status"]
            elif meta.get("merchant_received") is False:
                settlement_status = "MERCHANT_PENDING"
        except Exception:
            pass

    if payment.status != "SUCCESS":
        settlement_status = "MERCHANT_FAILED"

    return {
        "payment_reference": payment.payment_reference,
        "payment_id": payment.id,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "payment_status": payment.status,
        "settlement_status": settlement_status,
        "merchant_id": payment.merchant_id,
        "settled_at": payment.updated_at.isoformat() if payment.updated_at else None,
    }


@router.get("/api/payments/reconciliation")
async def get_reconciliation_payments(
    db: AsyncSession = Depends(get_db),
):
    stmt_p = select(Payment).filter(Payment.status == "SUCCESS")
    res_p = await db.execute(stmt_p)
    payments = res_p.scalars().all()

    stmt_o = select(Order.payment_id).filter(Order.payment_id.isnot(None))
    res_o = await db.execute(stmt_o)
    linked_payment_ids = set(res_o.scalars().all())

    stmt_c = select(Case.payment_id).filter(Case.payment_id.isnot(None))
    res_c = await db.execute(stmt_c)
    case_payment_ids = set(res_c.scalars().all())

    unmatched = []
    for p in payments:
        if p.id not in linked_payment_ids:
            unmatched.append({
                "payment_id": p.id,
                "payment_reference": p.payment_reference,
                "customer_id": p.customer_id,
                "merchant_id": p.merchant_id,
                "amount": float(p.amount),
                "currency": p.currency,
                "status": p.status,
                "has_active_case": p.id in case_payment_ids,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })

    return {
        "count": len(unmatched),
        "unmatched_payments": unmatched,
        "timestamp": utcnow().isoformat(),
    }


# ==============================================================================
# 2. ORDER SIMULATOR ENDPOINTS (for n8n Order Verification & Recovery Tools)
# ==============================================================================

@router.get("/api/orders/search")
async def search_orders(
    payment_reference: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    merchant_id: Optional[str] = Query(None),
    order_number: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).options(selectinload(Order.payment), selectinload(Order.product))

    if payment_reference:
        stmt_pay = select(Payment.id).filter(
            (Payment.payment_reference == payment_reference) | (Payment.id == payment_reference)
        )
        res_pay = await db.execute(stmt_pay)
        payment_ids = res_pay.scalars().all()

        if payment_ids:
            query = query.filter(
                (Order.payment_id.in_(payment_ids)) | (Order.order_number == payment_reference)
            )
        else:
            query = query.filter(Order.order_number == payment_reference)

    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if merchant_id:
        query = query.filter(Order.merchant_id == merchant_id)
    if order_number:
        query = query.filter(Order.order_number == order_number)

    res = await db.execute(query)
    orders = res.scalars().all()

    if not orders:
        return {
            "found": False,
            "count": 0,
            "orders": [],
            "message": "Order NOT FOUND in merchant system."
        }

    first_order = orders[0]
    return {
        "found": True,
        "count": len(orders),
        "order_id": first_order.id,
        "order_number": first_order.order_number,
        "status": first_order.status,
        "payment_reference": first_order.payment.payment_reference if first_order.payment else None,
        "payment_linked": first_order.payment_id is not None,
        "amount": float(first_order.amount),
        "currency": first_order.currency,
        "customer_id": first_order.customer_id,
        "merchant_id": first_order.merchant_id,
        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "status": o.status,
                "amount": float(o.amount),
                "currency": o.currency,
                "payment_id": o.payment_id,
                "customer_id": o.customer_id,
            }
            for o in orders
        ]
    }


@router.get("/api/orders/{order_id}")
async def get_order_by_id(
    order_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).options(selectinload(Order.payment), selectinload(Order.product)).filter(
        (Order.id == order_id) | (Order.order_number == order_id)
    )
    res = await db.execute(stmt)
    order = res.scalars().first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found."
        )

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "customer_id": order.customer_id,
        "merchant_id": order.merchant_id,
        "product_id": order.product_id,
        "product_name": order.product.name if order.product else None,
        "quantity": order.quantity,
        "amount": float(order.amount),
        "total_amount": float(order.amount),
        "currency": order.currency,
        "status": order.status,
        "payment_id": order.payment_id,
        "payment_reference": order.payment.payment_reference if order.payment else None,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.post("/api/orders/recover")
async def recover_order(
    req: RecoverOrderRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt_act = select(Action).filter(Action.idempotency_key == req.idempotency_key)
    res_act = await db.execute(stmt_act)
    existing_act = res_act.scalars().first()

    if existing_act:
        meta = json.loads(existing_act.result_metadata) if existing_act.result_metadata else {}
        return {
            "status": "ALREADY_PROCESSED",
            "message": "Action with this idempotency key has already been executed.",
            "order_id": meta.get("order_id"),
            "order_number": meta.get("order_number"),
            "action_id": existing_act.id,
            "idempotency_key": req.idempotency_key,
            "verified": True,
        }

    stmt_p = select(Payment).filter(
        (Payment.payment_reference == req.payment_reference) | (Payment.id == req.payment_reference)
    )
    res_p = await db.execute(stmt_p)
    payment = res_p.scalars().first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment reference '{req.payment_reference}' not found in gateway."
        )

    if payment.status != "SUCCESS":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot recover order for non-successful payment (status: {payment.status})."
        )

    stmt_o = select(Order).filter(Order.payment_id == payment.id)
    res_o = await db.execute(stmt_o)
    existing_order = res_o.scalars().first()

    if existing_order:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An order ({existing_order.order_number}) is already linked to payment '{payment.payment_reference}'."
        )

    product_id = req.product_id
    if not product_id and payment.checkout_id:
        stmt_chk = select(CheckoutAttempt).filter(CheckoutAttempt.id == payment.checkout_id)
        res_chk = await db.execute(stmt_chk)
        chk = res_chk.scalars().first()
        if chk:
            product_id = chk.product_id

    if not product_id:
        product_id = "prod_headset"

    product = await MerchantSimulator.get_product(db, product_id)
    if not product or product.stock <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product '{product_id}' is out of stock. Order recovery cannot proceed."
        )

    order_number = f"ORD-REC-{uuid.uuid4().hex[:6].upper()}"
    new_order = Order(
        id=f"ord_{uuid.uuid4().hex[:12]}",
        order_number=order_number,
        checkout_id=payment.checkout_id,
        payment_id=payment.id,
        customer_id=req.customer_id or payment.customer_id,
        merchant_id=req.merchant_id or payment.merchant_id,
        product_id=product.id,
        quantity=1,
        amount=payment.amount,
        currency=payment.currency,
        status="CONFIRMED",
        is_recovered=True,
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db.add(new_order)
    product.stock -= 1

    if req.case_id:
        stmt_c = select(Case).filter((Case.id == req.case_id) | (Case.case_number == req.case_id))
        res_c = await db.execute(stmt_c)
        case_obj = res_c.scalars().first()
        if case_obj:
            case_obj.order_id = new_order.id
            case_obj.status = "RESOLVED"
            case_obj.ai_summary = f"Order recovered successfully (#{order_number}) and payment verified."
            case_obj.resolution_type = "ORDER_RECOVERED"
            case_obj.updated_at = utcnow()

            await CaseEngine.log_event(
                db=db,
                case_id=case_obj.id,
                event_type="ORDER_CREATED",
                description=f"Created recovered order {order_number} for amount ₹{payment.amount}",
                actor_type="AI",
                actor_id="n8n_order_recovery",
                metadata={"order_id": new_order.id, "order_number": order_number}
            )
            await CaseEngine.log_event(
                db=db,
                case_id=case_obj.id,
                event_type="PAYMENT_LINKED",
                description=f"Linked verified payment {payment.payment_reference} to order {order_number}",
                actor_type="SYSTEM",
                actor_id="fastapi_backend",
                metadata={"payment_id": payment.id, "payment_reference": payment.payment_reference}
            )
            await CaseEngine.log_event(
                db=db,
                case_id=case_obj.id,
                event_type="CASE_RESOLVED",
                description="Case resolved with verified order recovery.",
                actor_type="AI",
                actor_id="n8n_case_orchestrator",
                metadata={"verified": True, "order_id": new_order.id}
            )

    action = Action(
        id=f"act_{uuid.uuid4().hex[:12]}",
        case_id=req.case_id or "cse_standalone",
        action_type="ORDER_RECOVERY",
        status="SUCCESS",
        idempotency_key=req.idempotency_key,
        provider_reference=order_number,
        request_metadata=json.dumps({"payment_reference": req.payment_reference, "product_id": product.id}),
        result_metadata=json.dumps({"order_id": new_order.id, "order_number": order_number, "verified": True}),
        requested_by="n8n_order_recovery_workflow",
        created_at=utcnow(),
    )
    db.add(action)

    await db.commit()
    await db.refresh(new_order)

    return {
        "status": "SUCCESS",
        "message": f"Order #{order_number} recovered and payment linked.",
        "order_id": new_order.id,
        "order_number": order_number,
        "customer_id": new_order.customer_id,
        "merchant_id": new_order.merchant_id,
        "amount": float(new_order.amount),
        "currency": new_order.currency,
        "payment_linked": True,
        "verified": True,
        "idempotency_key": req.idempotency_key,
        "action_id": action.id,
    }


# ==============================================================================
# 3. INVENTORY VERIFICATION ENDPOINTS (for n8n Inventory Verification Tool)
# ==============================================================================

@router.get("/api/products/{product_id}/availability")
async def get_product_availability(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    product = await MerchantSimulator.get_product(db, product_id)
    if not product:
        stmt = select(Product).filter(Product.name.ilike(f"%{product_id}%"))
        res = await db.execute(stmt)
        product = res.scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found."
        )

    return {
        "product_id": product.id,
        "name": product.name,
        "description": product.description,
        "price": float(product.price),
        "currency": product.currency,
        "quantity": product.stock,
        "available": product.stock > 0 and product.is_active,
        "is_active": product.is_active,
        "merchant_id": product.merchant_id,
    }


# ==============================================================================
# 4. REFUND VERIFICATION & EXECUTION ENDPOINTS (for n8n Refund Processor & Monitor)
# ==============================================================================

@router.get("/api/refunds/search")
async def search_refunds(
    payment_reference: Optional[str] = Query(None),
    customer_id: Optional[str] = Query(None),
    merchant_id: Optional[str] = Query(None),
    refund_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Refund).options(selectinload(Refund.payment))

    if payment_reference:
        stmt_p = select(Payment.id).filter(
            (Payment.payment_reference == payment_reference) | (Payment.id == payment_reference)
        )
        res_p = await db.execute(stmt_p)
        payment_ids = res_p.scalars().all()
        if payment_ids:
            query = query.filter(Refund.payment_id.in_(payment_ids))
        else:
            query = query.filter(Refund.refund_reference == payment_reference)

    if customer_id:
        query = query.filter(Refund.customer_id == customer_id)
    if merchant_id:
        query = query.filter(Refund.merchant_id == merchant_id)
    if refund_id:
        query = query.filter((Refund.id == refund_id) | (Refund.refund_reference == refund_id))

    res = await db.execute(query)
    refunds = res.scalars().all()

    if not refunds:
        return {
            "found": False,
            "status": "NOT_FOUND",
            "count": 0,
            "refunds": [],
            "message": "No existing refund found for this transaction."
        }

    first_ref = refunds[0]
    return {
        "found": True,
        "status": first_ref.status,
        "count": len(refunds),
        "refund_id": first_ref.id,
        "refund_reference": first_ref.refund_reference,
        "amount": float(first_ref.amount),
        "currency": first_ref.currency,
        "payment_id": first_ref.payment_id,
        "customer_id": first_ref.customer_id,
        "refunds": [
            {
                "id": r.id,
                "refund_reference": r.refund_reference,
                "amount": float(r.amount),
                "currency": r.currency,
                "status": r.status,
                "reason": r.reason,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in refunds
        ]
    }


@router.get("/api/refunds/{refund_id}")
async def get_refund_by_id(
    refund_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Refund).options(selectinload(Refund.payment)).filter(
        (Refund.id == refund_id) | (Refund.refund_reference == refund_id)
    )
    res = await db.execute(stmt)
    refund = res.scalars().first()

    if not refund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Refund '{refund_id}' not found."
        )

    return {
        "refund_id": refund.id,
        "refund_reference": refund.refund_reference,
        "payment_id": refund.payment_id,
        "payment_reference": refund.payment.payment_reference if refund.payment else None,
        "amount": float(refund.amount),
        "currency": refund.currency,
        "status": refund.status,
        "reason": refund.reason,
        "created_at": refund.created_at.isoformat() if refund.created_at else None,
        "updated_at": refund.updated_at.isoformat() if refund.updated_at else None,
    }


@router.post("/api/refunds")
async def create_refund(
    req: CreateRefundRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt_act = select(Action).filter(Action.idempotency_key == req.idempotency_key)
    res_act = await db.execute(stmt_act)
    existing_act = res_act.scalars().first()

    if existing_act:
        meta = json.loads(existing_act.result_metadata) if existing_act.result_metadata else {}
        return {
            "status": "ALREADY_PROCESSED",
            "message": "Refund action with this idempotency key already processed.",
            "refund_id": meta.get("refund_id"),
            "refund_reference": meta.get("refund_reference"),
            "action_id": existing_act.id,
            "idempotency_key": req.idempotency_key,
        }

    stmt_p = select(Payment).filter(
        (Payment.payment_reference == req.payment_reference) | (Payment.id == req.payment_reference)
    )
    res_p = await db.execute(stmt_p)
    payment = res_p.scalars().first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment '{req.payment_reference}' not found in gateway."
        )

    stmt_r = select(Refund).filter(Refund.payment_id == payment.id)
    res_r = await db.execute(stmt_r)
    existing_refund = res_r.scalars().first()

    if existing_refund:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Refund ({existing_refund.refund_reference}) already exists for this payment."
        )

    stmt_pol = select(MerchantPolicy).filter(MerchantPolicy.merchant_id == payment.merchant_id)
    res_pol = await db.execute(stmt_pol)
    policy = res_pol.scalars().first()

    requires_approval = False
    if policy:
        if not policy.refund_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Merchant policy does not allow automated refunds."
            )
        if policy.refund_approval_required and payment.amount >= policy.refund_approval_threshold:
            requires_approval = True

    if requires_approval:
        approval = Approval(
            id=f"appr_{uuid.uuid4().hex[:12]}",
            case_id=req.case_id,
            action_type="REFUND",
            status="PENDING",
            amount=payment.amount,
            reason=req.reason,
            requested_by="AI",
            created_at=utcnow(),
        )
        db.add(approval)

        if req.case_id:
            stmt_c = select(Case).filter((Case.id == req.case_id) | (Case.case_number == req.case_id))
            res_c = await db.execute(stmt_c)
            case_obj = res_c.scalars().first()
            if case_obj:
                case_obj.status = "WAITING_FOR_APPROVAL"
                case_obj.updated_at = utcnow()
                await CaseEngine.log_event(
                    db=db,
                    case_id=case_obj.id,
                    event_type="REFUND_PROPOSED",
                    description=f"Refund of ₹{payment.amount} proposed. Exceeds ₹{policy.refund_approval_threshold if policy else 500} threshold - routed for manager approval.",
                    actor_type="AI",
                    actor_id="n8n_refund_processor",
                    metadata={"approval_id": approval.id, "amount": float(payment.amount)}
                )

        await db.commit()
        return {
            "status": "WAITING_FOR_APPROVAL",
            "message": f"Refund of ₹{payment.amount} exceeds approval threshold. Case routed for manager approval.",
            "approval_id": approval.id,
            "requires_approval": True,
            "idempotency_key": req.idempotency_key,
        }

    refund_ref = f"REF-SIM-{uuid.uuid4().hex[:6].upper()}"
    refund = Refund(
        id=f"ref_{uuid.uuid4().hex[:12]}",
        refund_reference=refund_ref,
        payment_id=payment.id,
        customer_id=payment.customer_id,
        merchant_id=payment.merchant_id,
        amount=payment.amount,
        currency=payment.currency,
        status="SUCCESS",
        reason=req.reason,
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db.add(refund)

    if req.case_id:
        stmt_c = select(Case).filter((Case.id == req.case_id) | (Case.case_number == req.case_id))
        res_c = await db.execute(stmt_c)
        case_obj = res_c.scalars().first()
        if case_obj:
            case_obj.refund_id = refund.id
            case_obj.status = "RESOLVED"
            case_obj.ai_summary = f"Refund of ₹{payment.amount} processed successfully (#{refund_ref})."
            case_obj.resolution_type = "REFUND_ISSUED"
            case_obj.updated_at = utcnow()

            await CaseEngine.log_event(
                db=db,
                case_id=case_obj.id,
                event_type="REFUND_CREATED",
                description=f"Simulated refund of ₹{payment.amount} created (#{refund_ref}).",
                actor_type="SYSTEM",
                actor_id="fastapi_backend",
                metadata={"refund_id": refund.id, "refund_reference": refund_ref}
            )
            await CaseEngine.log_event(
                db=db,
                case_id=case_obj.id,
                event_type="REFUND_VERIFIED",
                description="Refund verified SUCCESS with banking provider.",
                actor_type="AI",
                actor_id="n8n_refund_processor",
                metadata={"status": "SUCCESS"}
            )
            await CaseEngine.log_event(
                db=db,
                case_id=case_obj.id,
                event_type="CASE_RESOLVED",
                description="Case resolved with verified refund outcome.",
                actor_type="AI",
                actor_id="n8n_case_orchestrator",
                metadata={"verified": True, "refund_id": refund.id}
            )

    action = Action(
        id=f"act_{uuid.uuid4().hex[:12]}",
        case_id=req.case_id or "cse_standalone",
        action_type="REFUND",
        status="SUCCESS",
        idempotency_key=req.idempotency_key,
        provider_reference=refund_ref,
        request_metadata=json.dumps({"payment_reference": req.payment_reference, "amount": float(payment.amount)}),
        result_metadata=json.dumps({"refund_id": refund.id, "refund_reference": refund_ref, "verified": True}),
        requested_by="n8n_refund_processor_workflow",
        created_at=utcnow(),
    )
    db.add(action)

    await db.commit()
    await db.refresh(refund)

    return {
        "status": "SUCCESS",
        "message": f"Refund of ₹{payment.amount} processed successfully.",
        "refund_id": refund.id,
        "refund_reference": refund_ref,
        "amount": float(refund.amount),
        "currency": refund.currency,
        "verified": True,
        "idempotency_key": req.idempotency_key,
        "action_id": action.id,
    }


# ==============================================================================
# 5. UNIVERSAL ACTION & ESCALATION (FastAPI Validation & Idempotency Authority)
# ==============================================================================

@router.post("/api/cases/{case_id}/actions")
async def execute_case_action(
    case_id: str,
    req: CaseActionRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt_act = select(Action).filter(Action.idempotency_key == req.idempotency_key)
    res_act = await db.execute(stmt_act)
    existing_act = res_act.scalars().first()

    if existing_act:
        meta = json.loads(existing_act.result_metadata) if existing_act.result_metadata else {}
        return {
            "status": "ALREADY_EXECUTED",
            "message": "Action with this idempotency key was previously executed.",
            "action_id": existing_act.id,
            "idempotency_key": req.idempotency_key,
            "result": meta,
        }

    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        stmt_c = select(Case).filter(Case.case_number == case_id)
        res_c = await db.execute(stmt_c)
        case_first = res_c.scalars().first()
        if case_first:
            case = await CaseEngine.get_case_with_relations(db, case_first.id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found."
        )

    if req.action_type == "ORDER_RECOVERY":
        recover_req = RecoverOrderRequest(
            case_id=case.id,
            payment_reference=req.payment_reference or (case.payment.payment_reference if case.payment else "TXN987654"),
            customer_id=case.customer_id,
            merchant_id=case.merchant_id,
            product_id=req.payload.get("product_id") if req.payload else None,
            idempotency_key=req.idempotency_key,
        )
        return await recover_order(recover_req, db)

    elif req.action_type == "REFUND":
        refund_req = CreateRefundRequest(
            case_id=case.id,
            payment_reference=req.payment_reference or (case.payment.payment_reference if case.payment else "TXN987654"),
            amount=req.amount or (case.payment.amount if case.payment else Decimal("799.00")),
            reason=req.reason or "AI proposed refund action",
            idempotency_key=req.idempotency_key,
        )
        return await create_refund(refund_req, db)

    elif req.action_type == "ESCALATE":
        escalate_req = HumanEscalationRequest(
            case_id=case.id,
            customer_request=case.customer_request,
            verified_facts=req.payload.get("verified_facts", []) if req.payload else [],
            uncertainties=req.payload.get("uncertainties", []) if req.payload else [],
            actions_attempted=req.payload.get("actions_attempted", []) if req.payload else [],
            decision_required=req.reason or "Human intervention required",
            reason_for_escalation=req.reason or "Complex mismatch requiring human review",
        )
        return await escalate_case(case.id, escalate_req, db)

    else:
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            case_id=case.id,
            action_type=req.action_type,
            status="SUCCESS",
            idempotency_key=req.idempotency_key,
            request_metadata=json.dumps(req.payload) if req.payload else None,
            result_metadata=json.dumps({"verified": True, "reason": req.reason}),
            requested_by="n8n_orchestrator",
            created_at=utcnow(),
        )
        db.add(action)
        await db.commit()
        return {
            "status": "SUCCESS",
            "action_id": action.id,
            "action_type": req.action_type,
            "idempotency_key": req.idempotency_key,
        }


@router.post("/api/cases/{case_id}/activity")
async def log_activity_event(
    case_id: str,
    req: ActivityStreamRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Case).filter((Case.id == case_id) | (Case.case_number == case_id))
    res = await db.execute(stmt)
    case_obj = res.scalars().first()
    actual_case_id = case_obj.id if case_obj else case_id

    event = await CaseEngine.log_event(
        db=db,
        case_id=actual_case_id,
        event_type=req.activity,
        description=req.message,
        actor_type="AI",
        actor_id=req.agent,
        metadata={
            "agent": req.agent,
            "activity": req.activity,
            "status": req.status,
            "timestamp": req.timestamp or utcnow().isoformat(),
        }
    )

    return {
        "status": "SUCCESS",
        "case_id": actual_case_id,
        "agent": req.agent,
        "activity": req.activity,
        "event_id": event.id,
        "timestamp": event.created_at.isoformat(),
    }


@router.post("/api/cases/{case_id}/escalate")
async def escalate_case(
    case_id: str,
    req: HumanEscalationRequest,
    db: AsyncSession = Depends(get_db),
):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        stmt_c = select(Case).filter(Case.case_number == case_id)
        res_c = await db.execute(stmt_c)
        case_first = res_c.scalars().first()
        if case_first:
            case = await CaseEngine.get_case_with_relations(db, case_first.id)

    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case '{case_id}' not found.")

    case.status = "HUMAN_REVIEW"
    case.updated_at = utcnow()

    handoff_packet = {
        "case_id": case.id,
        "case_number": case.case_number,
        "customer_request": req.customer_request,
        "verified_facts": req.verified_facts,
        "uncertainties": req.uncertainties,
        "actions_attempted": req.actions_attempted,
        "decision_required": req.decision_required,
        "recommended_action": req.recommended_action,
        "reason_for_escalation": req.reason_for_escalation,
        "escalated_at": utcnow().isoformat(),
    }

    event = await CaseEngine.log_event(
        db=db,
        case_id=case.id,
        event_type="HUMAN_ESCALATION",
        description=f"Escalated to human support: {req.reason_for_escalation}",
        actor_type="AI",
        actor_id="n8n_human_escalation",
        metadata=handoff_packet,
    )

    notif = Notification(
        id=f"notif_{uuid.uuid4().hex[:12]}",
        user_id="usr_agent",
        case_id=case.id,
        title="Escalated Case Requiring Decision",
        message=f"Case {case.case_number} requires human decision: {req.decision_required}",
        channel="APP",
        is_read=False,
        created_at=utcnow(),
    )
    db.add(notif)
    await db.commit()

    return {
        "status": "ESCALATED",
        "case_id": case.id,
        "case_number": case.case_number,
        "case_status": "HUMAN_REVIEW",
        "handoff_packet": handoff_packet,
        "event_id": event.id,
    }


# ==============================================================================
# 6. FASTAPI WEBHOOK INGESTION (Trigger for n8n RESOLVE_AI_CASE_ORCHESTRATOR)
# ==============================================================================

@router.post("/webhook/resolve-case")
async def webhook_resolve_case(
    req: WebhookCaseRequest,
    db: AsyncSession = Depends(get_db),
):
    case_obj = None
    if req.case_id:
        stmt = select(Case).options(selectinload(Case.payment)).filter(
            (Case.id == req.case_id) | (Case.case_number == req.case_id)
        )
        res = await db.execute(stmt)
        case_obj = res.scalars().first()

    if not case_obj:
        case_obj = await CaseEngine.create_case(
            db=db,
            customer_id=req.customer_id,
            merchant_id=req.merchant_id or "mer_resolve_store",
            customer_request=req.message,
            payment_reference=req.payment_reference,
        )

    payment_ref = req.payment_reference
    if case_obj.payment:
        payment_ref = case_obj.payment.payment_reference

    return {
        "case_id": case_obj.id,
        "case_number": case_obj.case_number,
        "customer_id": case_obj.customer_id,
        "merchant_id": case_obj.merchant_id,
        "message": case_obj.customer_request,
        "payment_reference": payment_ref,
        "status": case_obj.status,
        "timestamp": utcnow().isoformat(),
        "n8n_trigger_status": "READY_FOR_INVESTIGATION",
    }


# ==============================================================================
# 7. DEMO SCENARIO ENDPOINTS (for Demo Lab & Automated Testing)
# ==============================================================================

@router.post("/api/demo/scenario/{scenario_name}")
async def setup_demo_scenario(
    scenario_name: str,
    db: AsyncSession = Depends(get_db),
):
    payment_ref = f"TXN-{uuid.uuid4().hex[:6].upper()}"

    prod = await MerchantSimulator.get_product(db, "prod_headset")
    if not prod:
        prod = Product(
            id="prod_headset",
            merchant_id="mer_resolve_store",
            name="Wireless Headset",
            description="High-fidelity Bluetooth wireless headset",
            price=Decimal("799.00"),
            currency="INR",
            stock=10,
            is_active=True,
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(prod)
        await db.commit()

    if scenario_name == "payment-success-order-missing":
        prod.stock = 12
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            provider_name="Razorpay Simulator",
            provider_payload=json.dumps({"merchant_received": True}),
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I paid ₹799 but my order is not showing",
            payment_reference=payment_ref,
        )
        return {
            "scenario": "payment-success-order-missing",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "product_id": prod.id,
            "amount": 799.00,
            "expected_flow": "Order Recovery -> Stock Verified -> Order Created -> Case Resolved",
        }

    elif scenario_name == "product-unavailable":
        prod.stock = 0
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            provider_name="Razorpay Simulator",
            provider_payload=json.dumps({"merchant_received": True}),
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I paid ₹799 for Wireless Headset but my order is not found",
            payment_reference=payment_ref,
        )
        return {
            "scenario": "product-unavailable",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "product_id": prod.id,
            "stock": 0,
            "amount": 799.00,
            "expected_flow": "Stock Out -> Propose Refund -> Approval Required (Threshold ₹500) -> Manager Approves -> Refund Verified",
        }

    elif scenario_name == "payment-success-merchant-missing":
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            provider_name="Razorpay Simulator",
            provider_payload=json.dumps({"merchant_received": False, "settlement_status": "MERCHANT_PENDING"}),
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        order = Order(
            id=f"ord_{uuid.uuid4().hex[:12]}",
            order_number=f"ORD-SIM-{uuid.uuid4().hex[:6].upper()}",
            payment_id=payment.id,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            product_id=prod.id,
            quantity=1,
            amount=Decimal("799.00"),
            currency="INR",
            status="CREATED",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(order)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="Order created but merchant claims payment pending",
            payment_reference=payment_ref,
        )
        case.order_id = order.id
        await db.commit()

        return {
            "scenario": "payment-success-merchant-missing",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "order_number": order.order_number,
            "settlement_status": "MERCHANT_PENDING",
            "expected_flow": "No duplicate order/payment -> Start Settlement Monitor -> Settle -> Case Resolved",
        }

    elif scenario_name == "payment-success-order-exists":
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            provider_name="Razorpay Simulator",
            provider_payload=json.dumps({"merchant_received": True}),
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        order = Order(
            id=f"ord_{uuid.uuid4().hex[:12]}",
            order_number=f"ORD-EXISTS-{uuid.uuid4().hex[:6].upper()}",
            payment_id=payment.id,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            product_id=prod.id,
            quantity=1,
            amount=Decimal("799.00"),
            currency="INR",
            status="CONFIRMED",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(order)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I paid ₹799 where is my purchase?",
            payment_reference=payment_ref,
        )
        return {
            "scenario": "payment-success-order-exists",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "order_number": order.order_number,
            "expected_flow": "Confirm existing order -> Explain to customer -> Case Resolved",
        }

    elif scenario_name == "payment-pending":
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="PENDING",
            provider_name="UPI Bank Gateway",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="Money deducted on UPI app but order is pending",
            payment_reference=payment_ref,
        )
        return {
            "scenario": "payment-pending",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "status": "PENDING",
            "expected_flow": "Do NOT create order/refund -> Schedule bank recheck -> Notify customer",
        }

    elif scenario_name == "refund-pending":
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            provider_name="Razorpay Simulator",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        refund = Refund(
            id=f"ref_{uuid.uuid4().hex[:12]}",
            refund_reference=f"REF-PENDING-{uuid.uuid4().hex[:6].upper()}",
            payment_id=payment.id,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="PENDING",
            reason="Prior customer return",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(refund)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I haven't received my refund yet",
            payment_reference=payment_ref,
        )
        case.refund_id = refund.id
        await db.commit()

        return {
            "scenario": "refund-pending",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "refund_reference": refund.refund_reference,
            "refund_status": "PENDING",
            "expected_flow": "Detect existing refund -> Do NOT issue duplicate refund -> Track status until SUCCESS",
        }

    elif scenario_name == "conflicting-records":
        payment = Payment(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            payment_reference=payment_ref,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(payment)
        await db.commit()

        refund = Refund(
            id=f"ref_{uuid.uuid4().hex[:12]}",
            refund_reference=f"REF-CONF-{uuid.uuid4().hex[:6].upper()}",
            payment_id=payment.id,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("799.00"),
            currency="INR",
            status="SUCCESS",
            reason="Simulated conflict",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(refund)
        await db.commit()

        order = Order(
            id=f"ord_{uuid.uuid4().hex[:12]}",
            order_number=f"ORD-CONF-{uuid.uuid4().hex[:6].upper()}",
            payment_id=payment.id,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            product_id=prod.id,
            quantity=1,
            amount=Decimal("799.00"),
            currency="INR",
            status="CANCELLED",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(order)
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="System shows order cancelled and refund processed, but customer disputes delivery",
            payment_reference=payment_ref,
        )
        case.order_id = order.id
        case.refund_id = refund.id
        await db.commit()

        return {
            "scenario": "conflicting-records",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
            "order_status": "CANCELLED",
            "refund_status": "SUCCESS",
            "expected_flow": "AI refuses to guess -> Generate complete evidence packet -> Escalate to human",
        }

    elif scenario_name == "duplicate-notification":
        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I paid ₹799 but order is missing",
            payment_reference="TXN-DUP-799",
        )
        return {
            "scenario": "duplicate-notification",
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": "TXN-DUP-799",
            "expected_flow": "Idempotency guard blocks duplicate case/action -> Attaches message to existing case",
        }

    else:
        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request=f"Demo test for {scenario_name}",
            payment_reference=payment_ref,
        )
        return {
            "scenario": scenario_name,
            "case_id": case.id,
            "case_number": case.case_number,
            "payment_reference": payment_ref,
        }


# ==============================================================================
# IDEMPOTENCY & DEDUPLICATION DATA TABLE ENDPOINTS
# ==============================================================================

@router.get("/api/idempotency/records")
async def list_idempotency_records(
    customer_id: Optional[str] = Query(None),
    payment_reference: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the authoritative Deduplication & Idempotency Data Table.
    Shows seen payment references, deduplication keys, case IDs, and execution statuses.
    """
    stmt = select(IdempotencyRecord)
    if customer_id:
        stmt = stmt.filter(IdempotencyRecord.customer_id == customer_id)
    if payment_reference:
        stmt = stmt.filter(IdempotencyRecord.payment_reference == payment_reference)
    if status_filter:
        stmt = stmt.filter(IdempotencyRecord.status == status_filter)
    stmt = stmt.order_by(IdempotencyRecord.created_at.desc()).limit(limit)

    res = await db.execute(stmt)
    records = res.scalars().all()

    return {
        "total_records": len(records),
        "records": [
            {
                "id": r.id,
                "idempotency_key": r.idempotency_key,
                "payment_reference": r.payment_reference,
                "case_id": r.case_id,
                "customer_id": r.customer_id,
                "action_type": r.action_type,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            }
            for r in records
        ]
    }


# ==============================================================================
# DELAYED RE-CHECK / RETRY LOOP & ACQUIRER CALLBACK ENDPOINTS
# ==============================================================================

@router.post("/api/cases/{case_id}/recheck-pending")
async def recheck_pending_payment(
    case_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Executes a single re-poll of the payment gateway for a stuck/pending payment case.
    If the acquirer callback landed (status == SUCCESS), automatically advances investigation.
    """
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    updated_case = await CaseEngine.recheck_pending_case(db, case_id)
    return {
        "case_id": case_id,
        "case_number": updated_case.case_number if updated_case else case.case_number,
        "status": updated_case.status if updated_case else case.status,
        "resolution_type": updated_case.resolution_type if updated_case else case.resolution_type,
        "payment_status": updated_case.payment.status if updated_case and updated_case.payment else None,
        "message": "Gateway re-polled successfully."
    }


@router.post("/api/payments/{payment_reference}/callback")
async def receive_acquirer_callback(
    payment_reference: str,
    new_status: str = Query("SUCCESS", pattern="^(SUCCESS|FAILED|CANCELLED)$"),
    db: AsyncSession = Depends(get_db),
):
    """
    Simulates the acquirer payment callback landing on the payment gateway webhook.
    Transitions the pending payment to SUCCESS and triggers automated re-check on linked cases.
    """
    payment = await PaymentSimulator.simulate_gateway_callback(db, payment_reference, new_status=new_status)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Payment reference '{payment_reference}' not found")

    # Find any pending cases linked to this payment
    res_cases = await db.execute(
        select(Case).filter(
            Case.payment_id == payment.id,
            Case.status == "WAITING_FOR_PROVIDER"
        )
    )
    linked_cases = res_cases.scalars().all()

    resolved_case_ids = []
    for c in linked_cases:
        updated = await CaseEngine.recheck_pending_case(db, c.id)
        if updated:
            resolved_case_ids.append(updated.id)

    return {
        "status": "CALLBACK_PROCESSED",
        "payment_reference": payment.payment_reference,
        "new_status": payment.status,
        "settlement_landed": True if new_status == "SUCCESS" else False,
        "rechecked_cases": resolved_case_ids,
    }


@router.post("/api/cases/{case_id}/retry-loop")
async def execute_delayed_retry_loop_endpoint(
    case_id: str,
    max_retries: int = Query(3, ge=1, le=5),
    auto_land_callback: bool = Query(True, description="Whether the acquirer callback lands during the retry loop"),
    db: AsyncSession = Depends(get_db),
):
    """
    Executes a delayed re-check / retry loop (simulating n8n Wait Node -> Re-poll Gateway).
    If auto_land_callback is True, simulates callback arrival on attempt 2 to demonstrate auto-resolution.
    """
    import asyncio
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    attempts_log = []

    for attempt in range(1, max_retries + 1):
        if attempt == 2 and auto_land_callback and case.payment:
            # Simulate acquirer webhook callback landing at attempt 2
            await PaymentSimulator.simulate_gateway_callback(db, case.payment.payment_reference, "SUCCESS")

        updated_case = await CaseEngine.recheck_pending_case(db, case_id)
        current_status = updated_case.status if updated_case else case.status
        payment_status = updated_case.payment.status if updated_case and updated_case.payment else "UNKNOWN"

        attempts_log.append({
            "attempt": attempt,
            "gateway_payment_status": payment_status,
            "case_status": current_status,
            "timestamp": utcnow().isoformat()
        })

        if current_status != "WAITING_FOR_PROVIDER":
            # Successfully resolved or moved to next state (e.g. WAITING_FOR_CUSTOMER)
            break

        # Brief delay between simulated poll loops
        await asyncio.sleep(0.05)

    final_case = await CaseEngine.get_case_with_relations(db, case_id)
    return {
        "case_id": case_id,
        "final_status": final_case.status if final_case else case.status,
        "resolution_type": final_case.resolution_type if final_case else case.resolution_type,
        "total_attempts": len(attempts_log),
        "retry_history": attempts_log,
        "resolved_automatically": final_case.status in ["WAITING_FOR_CUSTOMER", "WAITING_FOR_APPROVAL", "RESOLVED"] if final_case else False
    }

