import uuid
from typing import Dict, Any, List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, or_

from backend.app.database import get_db, init_db
from backend.app.database_seeder import seed_database
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
)
from backend.app.schemas import ScenarioRunRequest, CaseResponse
from backend.app.services.case_engine import CaseEngine
from backend.app.services.background_worker import BackgroundWorker
from backend.app.services.payment_simulator import PaymentSimulator
from backend.app.services.merchant_simulator import MerchantSimulator
from backend.app.services.refund_simulator import RefundSimulator

router = APIRouter(prefix="/demo", tags=["Demo & Scenarios"])

SCENARIOS = [
    {
        "id": "SCENARIO_1_RECOVERY",
        "name": "Scenario 1: Main Demo (Order Recovery)",
        "title": "Scenario 1: Main Demo (Order Recovery)",
        "description": "Customer buys Wireless Headset (₹799). Payment SUCCESS, Order MISSING, Stock AVAILABLE. AI offers recovery, customer confirms, order recovered & verified.",
        "badge": "Happy Path",
        "expected_outcome": "Happy Path"
    },
    {
        "id": "SCENARIO_2_REFUND",
        "name": "Scenario 2: Out of Stock Refund (Human Approval)",
        "title": "Scenario 2: Out of Stock Refund (Human Approval)",
        "description": "Customer buys Keyboard (₹1499). Payment SUCCESS, Order MISSING, Stock UNAVAILABLE. AI selects refund, requires manager approval under ₹500 policy threshold, manager approves, refund verified.",
        "badge": "Approval Required",
        "expected_outcome": "Approval Required"
    },
    {
        "id": "SCENARIO_3_PENDING",
        "name": "Scenario 3: Pending Payment",
        "title": "Scenario 3: Pending Payment",
        "description": "Payment is PENDING with bank. AI schedules background recheck without creating order or refund.",
        "badge": "Pending State",
        "expected_outcome": "Pending State"
    },
    {
        "id": "SCENARIO_4_DUPLICATE",
        "name": "Scenario 4: Duplicate Webhook Notification",
        "title": "Scenario 4: Duplicate Webhook Notification",
        "description": "Duplicate payment webhook arrives twice. Idempotency guarantees exactly one order created.",
        "badge": "Idempotency Guard",
        "expected_outcome": "Idempotency Guard"
    },
    {
        "id": "SCENARIO_5_REFUND_EXISTS",
        "name": "Scenario 5: Refund Already Exists",
        "title": "Scenario 5: Refund Already Exists",
        "description": "Payment was already refunded. AI detects existing refund reference and tracks without issuing duplicate payout.",
        "badge": "Duplicate Refund Guard",
        "expected_outcome": "Duplicate Refund Guard"
    },
    {
        "id": "SCENARIO_6_CONFLICT",
        "name": "Scenario 6: Conflicting Records",
        "title": "Scenario 6: Conflicting Records",
        "description": "Inconsistent amount/currency records. AI refuses to guess and generates structured human handoff.",
        "badge": "Human-in-the-Loop",
        "expected_outcome": "Human-in-the-Loop"
    },
    {
        "id": "SCENARIO_7_TIMEOUT",
        "name": "Scenario 7: Provider Action Timeout & Retry",
        "title": "Scenario 7: Provider Action Timeout & Retry",
        "description": "Simulates transient external gateway failure with retry without duplicate charging.",
        "badge": "Resilience",
        "expected_outcome": "Resilience"
    },
    {
        "id": "SCENARIO_8_ORDER_EXISTS",
        "name": "Scenario 8: Payment Success + Order Exists",
        "title": "Scenario 8: Payment Success + Order Exists",
        "description": "Order already exists. AI confirms status without creating duplicate order.",
        "badge": "Safe Lookup",
        "expected_outcome": "Safe Lookup"
    },
    {
        "id": "SCENARIO_9_PAYMENT_NOT_FOUND",
        "name": "Scenario 9: Gateway Cannot Find Payment",
        "title": "Scenario 9: Gateway Cannot Find Payment",
        "description": "Customer claims debit but gateway returns NOT_FOUND. AI escalates with transaction logs.",
        "badge": "Escalation",
        "expected_outcome": "Escalation"
    },
    {
        "id": "SCENARIO_10_BACKGROUND_RECON",
        "name": "Scenario 10: Autonomous Background Reconciliation",
        "title": "Scenario 10: Autonomous Background Reconciliation",
        "description": "Customer is offline. Background worker detects unlinked payment, opens case, investigates, and notifies customer.",
        "badge": "Proactive AI",
        "expected_outcome": "Proactive AI"
    }
]


@router.get("/scenarios")
async def list_demo_scenarios():
    return {
        "environment": "SIMULATED PAYMENT ENVIRONMENT",
        "scenarios": SCENARIOS
    }


@router.post("/reset")
async def reset_demo_database(db: AsyncSession = Depends(get_db)):
    """Wipes and reseeds the database to a fresh demo baseline."""
    # Delete in reverse foreign key order
    await db.execute(delete(Notification))
    await db.execute(delete(Approval))
    await db.execute(delete(Action))
    await db.execute(delete(CaseEvent))
    await db.execute(delete(Case))
    await db.execute(delete(Refund))
    await db.execute(delete(Order))
    await db.execute(delete(Payment))
    await db.execute(delete(CheckoutAttempt))
    await db.execute(delete(MerchantPolicy))
    await db.execute(delete(Product))
    await db.execute(delete(Merchant))
    await db.execute(delete(User))
    await db.commit()

    # Clear MongoDB Atlas collections
    try:
        from backend.app.mongodb import get_mongo_db
        mongo_db = get_mongo_db()
        if mongo_db is not None:
            for col in ["cases", "case_events", "actions", "approvals", "notifications", "refunds", "orders", "payments", "checkout_attempts", "merchant_policies", "products", "merchants", "users"]:
                await mongo_db[col].delete_many({})
    except Exception as e:
        print(f"[MongoDB Wipe Warning] {e}")

    await seed_database()
    return {"status": "SUCCESS", "message": "Demo database wiped and cleanly reseeded."}


@router.post("/scenario/run")
async def run_scenario(req: ScenarioRunRequest, db: AsyncSession = Depends(get_db)):
    """Executes the setup and initial trigger for a specific scenario with clean state isolation."""
    sc_id = req.scenario_id.upper()

    if sc_id == "SCENARIO_1_RECOVERY":
        # Rahul with Wireless Headset ₹799 (Order missing, stock available)
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_rahul_01", Order.payment_id == "pay_rahul_01", Order.customer_id == "usr_rahul")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_rahul_01"))
        
        prod = (await db.execute(select(Product).filter(Product.id == "prod_headset"))).scalars().first()
        if prod:
            prod.stock = 10
        
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_rahul_01"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I paid ₹799 for the Wireless Headset via UPI (TXN987654) but my order confirmation is missing.",
            payment_reference="TXN987654",
            screenshot_url="https://placehold.co/900x500/059669/ffffff.png?text=UPI+SUCCESS+-+Rs+799+TXN987654",
            customer_phone="917892724453",
            product_id="prod_headset",
        )
        return {"scenario": sc_id, "case_id": case.id, "case_number": case.case_number, "status": case.status, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_2_REFUND":
        # Aisha with Mechanical Keyboard ₹1499 (Order missing, stock 0 -> Manager approval)
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_aisha_01", Order.payment_id == "pay_aisha_01", Order.customer_id == "usr_aisha")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_aisha_01"))
        
        prod = (await db.execute(select(Product).filter(Product.id == "prod_keyboard"))).scalars().first()
        if prod:
            prod.stock = 0
        
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_aisha_01"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_aisha",
            merchant_id="mer_resolve_store",
            customer_request="I completed payment for the Mechanical Keyboard (TXN987655) but didn't get my order.",
            payment_reference="TXN987655",
            screenshot_url="https://placehold.co/900x500/d97706/ffffff.png?text=PAYMENT+SUCCESS+-+Rs+1499+TXN987655",
            customer_phone="919876543210",
            product_id="prod_keyboard",
        )
        return {"scenario": sc_id, "case_id": case.id, "case_number": case.case_number, "status": case.status, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_3_PENDING":
        # Arjun with Wireless Mouse ₹499 (Pending payment -> Background recheck)
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_arjun_01", Order.payment_id == "pay_arjun_01", Order.customer_id == "usr_arjun")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_arjun_01"))
        
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_arjun_01"))).scalars().first()
        if pay:
            pay.status = "PENDING"
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_arjun",
            merchant_id="mer_resolve_store",
            customer_request="I made a payment for Wireless Mouse (TXN987656), has it completed?",
            payment_reference="TXN987656",
            screenshot_url="https://placehold.co/900x500/e11d48/ffffff.png?text=PAYMENT+PENDING+-+Bank+Processing+TXN987656",
            customer_phone="918765432109",
            product_id="prod_mouse",
        )
        return {"scenario": sc_id, "case_id": case.id, "case_number": case.case_number, "status": case.status, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_4_DUPLICATE":
        # Clean setup and simulate duplicate notification
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_rahul_01", Order.payment_id == "pay_rahul_01", Order.customer_id == "usr_rahul")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_rahul_01"))
        prod = (await db.execute(select(Product).filter(Product.id == "prod_headset"))).scalars().first()
        if prod:
            prod.stock = 10
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_rahul_01"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
        await db.commit()

        case1 = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="Webhook payment notification received for TXN987654",
            payment_reference="TXN987654"
        )
        user_rahul = (await db.execute(select(User).filter(User.id == "usr_rahul"))).scalars().first()
        if user_rahul:
            await CaseEngine.process_customer_recovery_confirmation(db, case1.id, user_rahul, True)

        await CaseEngine.log_event(
            db,
            case_id=case1.id,
            event_type="DUPLICATE_NOTIFICATION_RECEIVED",
            description="Duplicate gateway payment notification received for TXN987654. Intercepted by Idempotency Guard (Rules 6 & 11).",
            actor_type="SYSTEM",
        )
        return {"scenario": sc_id, "case_id": case1.id, "case": await CaseEngine.get_case_with_relations(db, case1.id)}

    elif sc_id == "SCENARIO_5_REFUND_EXISTS":
        # Setup existing refund
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_rahul_01", Order.payment_id == "pay_rahul_01", Order.customer_id == "usr_rahul")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_rahul_01"))
        await db.commit()

        pay = (await db.execute(select(Payment).filter(Payment.payment_reference == "TXN987654"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
            await RefundSimulator.request_refund(db, pay, reason="Previous customer refund request", initial_status="PENDING")
        
        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="Where is my refund for payment TXN987654?",
            payment_reference="TXN987654"
        )
        return {"scenario": sc_id, "case_id": case.id, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_6_CONFLICT":
        # Clean conflicting payment and recreate
        await db.execute(delete(Order).filter(Order.checkout_id == "chk_conflict_99"))
        await db.execute(delete(Payment).filter(Payment.payment_reference == "TXN-CONFLICT-99"))
        await db.commit()

        conflict_pay = await PaymentSimulator.create_simulated_payment(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            amount=Decimal("99.00"),
            currency="USD",
            custom_ref="TXN-CONFLICT-99",
            initial_status="SUCCESS"
        )
        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="Conflict: Payment of $99 USD was debited but store currency is INR and checkout reference does not match.",
            payment_reference="TXN-CONFLICT-99"
        )
        return {"scenario": sc_id, "case_id": case.id, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_7_TIMEOUT":
        # Provider timeout & retry resilience
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_rahul_01", Order.payment_id == "pay_rahul_01", Order.customer_id == "usr_rahul")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_rahul_01"))
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_rahul_01"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="Payment gateway timed out during verification for TXN987654. Please retry and check status.",
            payment_reference="TXN987654"
        )
        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="PROVIDER_TIMEOUT_SIMULATED",
            description="Simulated transient payment gateway 504 Gateway Timeout on initial query. Exponential backoff retry triggered.",
            actor_type="PROVIDER"
        )
        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="PROVIDER_RETRY_SUCCESS",
            description="Retry attempt 1 succeeded. Payment state verified as SUCCESS (₹799.00 INR).",
            actor_type="SYSTEM"
        )
        return {"scenario": sc_id, "case_id": case.id, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_8_ORDER_EXISTS":
        # Payment Success + Order Already Linked
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_rahul_01"))
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_rahul_01", Order.payment_id == "pay_rahul_01", Order.customer_id == "usr_rahul")))
        await db.commit()

        new_ord = Order(
            id=f"ord_{uuid.uuid4().hex[:8]}",
            order_number=f"ORD-{uuid.uuid4().hex[:6].upper()}",
            checkout_id="chk_rahul_01",
            payment_id="pay_rahul_01",
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            product_id="prod_headset",
            quantity=1,
            amount=Decimal("799.00"),
            currency="INR",
            status="CONFIRMED"
        )
        db.add(new_ord)
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_rahul_01"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I want to check the status of my order for payment TXN987654.",
            payment_reference="TXN987654"
        )
        return {"scenario": sc_id, "case_id": case.id, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_9_PAYMENT_NOT_FOUND":
        # Unrecognized payment reference
        await db.execute(delete(Payment).filter(Payment.payment_reference == "TXN_UNRECOGNIZED_000"))
        await db.commit()

        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request="I was charged ₹999 for reference TXN_UNRECOGNIZED_000, please verify my order.",
            payment_reference="TXN_UNRECOGNIZED_000"
        )
        return {"scenario": sc_id, "case_id": case.id, "case": await CaseEngine.get_case_with_relations(db, case.id)}

    elif sc_id == "SCENARIO_10_BACKGROUND_RECON":
        # Remove orders to simulate orphan payment and run recon
        await db.execute(delete(Order).filter(or_(Order.checkout_id == "chk_rahul_01", Order.payment_id == "pay_rahul_01", Order.customer_id == "usr_rahul")))
        await db.execute(delete(Refund).filter(Refund.payment_id == "pay_rahul_01"))
        pay = (await db.execute(select(Payment).filter(Payment.id == "pay_rahul_01"))).scalars().first()
        if pay:
            pay.status = "SUCCESS"
        await db.commit()
        reconciled = await BackgroundWorker.reconcile_orphan_payments()
        return {"scenario": sc_id, "reconciled_cases": reconciled, "message": "Background worker ran proactive scan and resolved orphan payment."}

    else:
        # Generic run
        case = await CaseEngine.create_case(
            db=db,
            customer_id="usr_rahul",
            merchant_id="mer_resolve_store",
            customer_request=f"Testing demo scenario: {sc_id}",
        )
        return {"scenario": sc_id, "case_id": case.id, "case": await CaseEngine.get_case_with_relations(db, case.id)}


@router.post("/reconcile-now")
async def trigger_reconcile_now():
    reconciled = await BackgroundWorker.reconcile_orphan_payments()
    return {"status": "SUCCESS", "reconciled_cases": reconciled}


@router.post("/monitor-refunds-now")
async def trigger_monitor_refunds_now():
    resolved = await BackgroundWorker.monitor_pending_refunds()
    return {"status": "SUCCESS", "resolved_cases": resolved}


@router.get("/state")
async def get_system_state(db: AsyncSession = Depends(get_db)):
    """Returns complete database telemetry for the live demo dashboard."""
    cases_res = await db.execute(select(Case).order_by(Case.created_at.desc()))
    cases = cases_res.scalars().all()

    payments_res = await db.execute(select(Payment))
    payments = payments_res.scalars().all()

    orders_res = await db.execute(select(Order))
    orders = orders_res.scalars().all()

    events_res = await db.execute(select(CaseEvent).order_by(CaseEvent.created_at.desc()).limit(25))
    events = events_res.scalars().all()

    actions_res = await db.execute(select(Action).order_by(Action.created_at.desc()).limit(25))
    actions = actions_res.scalars().all()

    approvals_res = await db.execute(select(Approval).order_by(Approval.created_at.desc()))
    approvals = approvals_res.scalars().all()
    pending_approvals = [a for a in approvals if a.status == "PENDING"]

    return {
        "cases_count": len(cases),
        "payments_count": len(payments),
        "orders_count": len(orders),
        "pending_approvals_count": len(pending_approvals),
        "recent_events": events,
        "recent_actions": actions,
        "approvals": approvals,
    }
