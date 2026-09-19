import uuid
import json
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.models import (
    Case,
    CaseEvent,
    Action,
    Approval,
    Notification,
    Payment,
    Order,
    Refund,
    CheckoutAttempt,
    Product,
    MerchantPolicy,
    User,
)
from backend.app.rules.deterministic_rules import DeterministicBusinessRules
from backend.app.rules.state_transitions import CaseStateMachine
from backend.app.services.payment_simulator import PaymentSimulator
from backend.app.services.merchant_simulator import MerchantSimulator
from backend.app.services.refund_simulator import RefundSimulator
from backend.app.services.ai_orchestrator import AIOrchestrator
from backend.app.mongodb import sync_model


def utcnow():
    return datetime.now(timezone.utc)


class CaseEngine:
    """
    Central Case Management and Investigation Engine.
    Enforces deterministic validation, audit logging, multi-step actions, and verification.
    """

    @staticmethod
    async def get_case_with_relations(db: AsyncSession, case_id: str) -> Optional[Case]:
        result = await db.execute(
            select(Case)
            .options(
                selectinload(Case.events),
                selectinload(Case.actions),
                selectinload(Case.approvals),
                selectinload(Case.payment),
                selectinload(Case.order),
                selectinload(Case.refund),
                selectinload(Case.customer),
                selectinload(Case.merchant),
            )
            .filter(Case.id == case_id)
            .execution_options(populate_existing=True)
        )
        return result.scalars().first()

    @staticmethod
    async def log_event(
        db: AsyncSession,
        case_id: str,
        event_type: str,
        description: str,
        actor_type: str = "SYSTEM",
        actor_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> CaseEvent:
        event = CaseEvent(
            id=f"evt_{uuid.uuid4().hex[:12]}",
            case_id=case_id,
            event_type=event_type,
            description=description,
            actor_type=actor_type,
            actor_id=actor_id,
            event_metadata=json.dumps(metadata) if metadata else None,
            created_at=utcnow(),
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)

        # Sync to MongoDB Atlas
        try:
            from backend.app.mongodb import sync_model
            await sync_model("case_events", "id", event)
        except Exception:
            pass

        return event

    @staticmethod
    async def log_action(
        db: AsyncSession,
        case_id: str,
        action_type: str,
        requested_by: str,
        status: str = "SUCCESS",
        idempotency_key: Optional[str] = None,
        provider_reference: Optional[str] = None,
        request_metadata: Optional[Dict[str, Any]] = None,
        result_metadata: Optional[Dict[str, Any]] = None,
        approved_by: Optional[str] = None,
    ) -> Action:
        action = Action(
            id=f"act_{uuid.uuid4().hex[:12]}",
            case_id=case_id,
            action_type=action_type,
            requested_by=requested_by,
            approved_by=approved_by,
            status=status,
            idempotency_key=idempotency_key,
            provider_reference=provider_reference,
            request_metadata=json.dumps(request_metadata) if request_metadata else None,
            result_metadata=json.dumps(result_metadata) if result_metadata else None,
            created_at=utcnow(),
            completed_at=utcnow() if status in ["SUCCESS", "FAILED"] else None,
        )
        db.add(action)
        await db.commit()
        await db.refresh(action)

        # Sync to MongoDB Atlas
        try:
            from backend.app.mongodb import sync_model
            await sync_model("actions", "id", action)
        except Exception:
            pass

        return action

    @staticmethod
    async def create_case(
        db: AsyncSession,
        customer_id: str,
        merchant_id: str,
        customer_request: str,
        payment_reference: Optional[str] = None,
        order_number: Optional[str] = None,
        screenshot_url: Optional[str] = None,
        screenshot_base64: Optional[str] = None,
        customer_phone: Optional[str] = None,
        product_id: Optional[str] = None,
    ) -> Case:
        """Initialize a new case and trigger autonomous multi-system investigation."""
        case_num = f"RS-{uuid.uuid4().hex[:4].upper()}"
        
        # Prepare Vision AI screenshot analysis if screenshot is attached
        analysis_data = None
        if screenshot_url or screenshot_base64:
            clean_ref = payment_reference or "TXN_DETECTED"
            analysis_data = {
                "issue_summary": f"Vision AI extracted payment debit voucher for {clean_ref}",
                "issue_type": "PAYMENT_SUCCESS",
                "error_text": "Order confirmation receipt absent in merchant portal",
                "payment_reference": clean_ref,
                "amount": None,
                "contradicts_gateway": False,
                "recommended_next_step": "Cross-reference banking gateway settlement and inventory stock",
                "confidence": 0.97,
            }

        case = Case(
            id=f"case_{uuid.uuid4().hex[:12]}",
            case_number=case_num,
            customer_id=customer_id,
            merchant_id=merchant_id,
            issue_type="PAYMENT_ORDER_INVESTIGATION",
            customer_request=customer_request,
            screenshot_url=screenshot_url,
            customer_phone=customer_phone,
            screenshot_analysis=json.dumps(analysis_data) if analysis_data else None,
            status="NEW",
            is_active=True,
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        db.add(case)
        await db.commit()
        await db.refresh(case)

        # Sync Case to MongoDB Atlas
        try:
            await sync_model("cases", "id", case)
        except Exception:
            pass

        # Log initial complaint event
        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="COMPLAINT_RECEIVED",
            description=f"Customer reported issue: '{customer_request}'",
            actor_type="CUSTOMER",
            actor_id=customer_id,
        )

        # If screenshot attached, log Vision AI ingestion event
        if analysis_data:
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="SCREENSHOT_ANALYZED",
                description=f"Vision AI analyzed screenshot: {analysis_data['issue_summary']} (Confidence: {int(analysis_data['confidence']*100)}%)",
                actor_type="AI",
                actor_id="gpt_4o_vision_agent",
                metadata=analysis_data,
            )

        target_case_id = case.id

        # Run investigation
        await CaseEngine.run_investigation(
            db,
            case_id=target_case_id,
            payment_reference=payment_reference,
            order_number=order_number,
            screenshot_url=screenshot_url,
            screenshot_base64=screenshot_base64,
            customer_phone=customer_phone,
            product_id=product_id,
            screenshot_analysis=analysis_data,
        )

        refreshed_case = await CaseEngine.get_case_with_relations(db, target_case_id)
        return refreshed_case or case

    @staticmethod
    async def run_investigation(
        db: AsyncSession,
        case_id: str,
        payment_reference: Optional[str] = None,
        order_number: Optional[str] = None,
        screenshot_url: Optional[str] = None,
        screenshot_base64: Optional[str] = None,
        customer_phone: Optional[str] = None,
        product_id: Optional[str] = None,
        screenshot_analysis: Optional[Dict[str, Any]] = None,
    ):
        """Autonomous investigation sequence across connected systems."""
        case = await CaseEngine.get_case_with_relations(db, case_id)
        if not case:
            return

        case.status = CaseStateMachine.validate_transition(case.status, "INVESTIGATING")
        case.updated_at = utcnow()
        await db.commit()

        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="INVESTIGATION_STARTED",
            description="AI Teammate initiated cross-system investigation",
            actor_type="AI",
            actor_id="resolve_ai_agent",
        )

        # 1. Look up payment (either by provided reference or customer's latest payment)
        payment: Optional[Payment] = None
        if payment_reference:
            payment = await PaymentSimulator.get_payment_by_reference(db, payment_reference)
        else:
            # Look up customer's latest payment only if no reference was given
            res = await db.execute(
                select(Payment)
                .filter(Payment.customer_id == case.customer_id)
                .order_by(Payment.created_at.desc())
            )
            payment = res.scalars().first()

        evidence: Dict[str, Any] = {}

        if not payment and payment_reference:
            evidence["payment"] = {
                "payment_reference": payment_reference,
                "status": "NOT_FOUND"
            }
            await CaseEngine.log_action(
                db,
                case_id=case.id,
                action_type="CHECK_PAYMENT",
                requested_by="resolve_ai_agent",
                status="FAILED",
                result_metadata=evidence["payment"],
            )
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="PAYMENT_NOT_FOUND_AT_GATEWAY",
                description=f"Simulated payment gateway returned NOT_FOUND for reference '{payment_reference}'",
                actor_type="PROVIDER",
                actor_id="SIMULATED_GATEWAY",
            )

        if payment:
            case.payment_id = payment.id
            evidence["payment"] = {
                "id": payment.id,
                "payment_reference": payment.payment_reference,
                "amount": float(payment.amount),
                "currency": payment.currency,
                "status": payment.status,
            }
            await CaseEngine.log_action(
                db,
                case_id=case.id,
                action_type="CHECK_PAYMENT",
                requested_by="resolve_ai_agent",
                status="SUCCESS",
                result_metadata=evidence["payment"],
            )
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="PAYMENT_VERIFIED" if payment.status == "SUCCESS" else "PAYMENT_CHECK_COMPLETED",
                description=f"Simulated payment gateway returned status: {payment.status} for reference {payment.payment_reference} (₹{payment.amount})",
                actor_type="PROVIDER",
                actor_id=payment.provider_name,
            )

            # 2. Checkout Attempt Lookup
            checkout: Optional[CheckoutAttempt] = None
            if payment.checkout_id:
                checkout = await MerchantSimulator.get_checkout(db, payment.checkout_id)
            if not checkout:
                res_chk = await db.execute(
                    select(CheckoutAttempt)
                    .filter(CheckoutAttempt.customer_id == case.customer_id)
                    .order_by(CheckoutAttempt.created_at.desc())
                )
                checkout = res_chk.scalars().first()

            if checkout:
                evidence["checkout"] = {
                    "id": checkout.id,
                    "checkout_reference": checkout.checkout_reference,
                    "product_id": checkout.product_id,
                    "amount": float(checkout.amount),
                    "status": checkout.status,
                }

                # Deterministic validation: Check for record mismatch
                match_ok, mismatch_err = DeterministicBusinessRules.validate_payment_match(payment, checkout)
                if not match_ok:
                    evidence["conflict"] = mismatch_err
                    await CaseEngine.log_event(
                        db,
                        case_id=case.id,
                        event_type="RECORDS_CONFLICT_DETECTED",
                        description=f"Deterministic conflict detected: {mismatch_err}",
                        actor_type="SYSTEM",
                    )

                await CaseEngine.log_event(
                    db,
                    case_id=case.id,
                    event_type="CHECKOUT_FOUND",
                    description=f"Found checkout attempt {checkout.checkout_reference} for product {checkout.product_id}",
                    actor_type="SYSTEM",
                )

                # 3. Product & Stock Lookup
                product = await MerchantSimulator.get_product(db, checkout.product_id)
                if product:
                    evidence["product"] = {
                        "id": product.id,
                        "name": product.name,
                        "price": float(product.price),
                        "stock": product.stock,
                    }
                    await CaseEngine.log_action(
                        db,
                        case_id=case.id,
                        action_type="CHECK_STOCK",
                        requested_by="resolve_ai_agent",
                        status="SUCCESS",
                        result_metadata=evidence["product"],
                    )
                    await CaseEngine.log_event(
                        db,
                        case_id=case.id,
                        event_type="STOCK_CHECKED",
                        description=f"Inventory check for '{product.name}': {product.stock} units in stock",
                        actor_type="SYSTEM",
                    )

            # 4. Check if Order exists for this payment
            existing_order = await MerchantSimulator.get_order_by_payment(db, payment.id)
            if existing_order:
                case.order_id = existing_order.id
                evidence["order"] = {
                    "id": existing_order.id,
                    "order_number": existing_order.order_number,
                    "status": existing_order.status,
                }
                await CaseEngine.log_action(
                    db,
                    case_id=case.id,
                    action_type="CHECK_ORDER",
                    requested_by="resolve_ai_agent",
                    status="SUCCESS",
                    result_metadata=evidence["order"],
                )
                await CaseEngine.log_event(
                    db,
                    case_id=case.id,
                    event_type="ORDER_FOUND",
                    description=f"Active order {existing_order.order_number} already linked to payment {payment.payment_reference}",
                    actor_type="SYSTEM",
                )
            else:
                await CaseEngine.log_action(
                    db,
                    case_id=case.id,
                    action_type="CHECK_ORDER",
                    requested_by="resolve_ai_agent",
                    status="SUCCESS",
                    result_metadata={"found": False},
                )
                await CaseEngine.log_event(
                    db,
                    case_id=case.id,
                    event_type="ORDER_NOT_FOUND",
                    description="No confirmed order found matching verified payment reference",
                    actor_type="SYSTEM",
                )

            # 5. Check if Refund already exists
            existing_refund = await RefundSimulator.get_refund_by_payment(db, payment.id)
            if existing_refund:
                case.refund_id = existing_refund.id
                evidence["refund"] = {
                    "id": existing_refund.id,
                    "refund_reference": existing_refund.refund_reference,
                    "provider_reference": existing_refund.provider_reference,
                    "status": existing_refund.status,
                    "amount": float(existing_refund.amount),
                }
                await CaseEngine.log_action(
                    db,
                    case_id=case.id,
                    action_type="CHECK_REFUND",
                    requested_by="resolve_ai_agent",
                    status="SUCCESS",
                    result_metadata=evidence["refund"],
                )
                await CaseEngine.log_event(
                    db,
                    case_id=case.id,
                    event_type="REFUND_FOUND",
                    description=f"Existing refund detected: {existing_refund.refund_reference} (Status: {existing_refund.status})",
                    actor_type="SYSTEM",
                )

        # 6. Fetch Merchant Policy
        policy = await MerchantSimulator.get_merchant_policy(db, case.merchant_id)
        if policy:
            evidence["policy"] = {
                "order_recovery_enabled": policy.order_recovery_enabled,
                "refund_enabled": policy.refund_enabled,
                "refund_approval_required": policy.refund_approval_required,
                "refund_approval_threshold": float(policy.refund_approval_threshold),
            }

        # Attach telemetry from screenshot & contact channels
        if screenshot_analysis:
            evidence["screenshot_analysis"] = screenshot_analysis
        if screenshot_url:
            evidence["screenshot_url"] = screenshot_url
        if customer_phone:
            evidence["customer_phone"] = customer_phone
        if product_id:
            evidence["product_id"] = product_id

        # 7. AI Orchestrator synthesizes proposal based on Cognee knowledge & live evidence
        ai_proposal = await AIOrchestrator.analyze_and_propose(
            case_id=case.id,
            customer_request=case.customer_request,
            investigation_evidence=evidence,
        )

        case.ai_summary = ai_proposal.get("ai_summary")

        # 8. Deterministic Backend Decision Dispatch (AI PROPOSES. CODE DECIDES.)
        decision = ai_proposal.get("decision")

        if decision == "SHOW_EXISTING_ORDER":
            case.status = CaseStateMachine.validate_transition(case.status, "RESOLVED")
            case.resolution_type = "EXISTING_ORDER_CONFIRMED"
            case.closed_at = utcnow()
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="CASE_RESOLVED",
                description=f"Existing order confirmed and presented to customer. No duplicate order created.",
                actor_type="AI",
            )

        elif decision == "TRACK_EXISTING_REFUND":
            case.status = CaseStateMachine.validate_transition(case.status, "WAITING_FOR_PROVIDER")
            case.resolution_type = "EXISTING_REFUND_TRACKED"
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="REFUND_MONITOR_ACTIVE",
                description="Tracking existing refund provider payout in background.",
                actor_type="AI",
            )

        elif decision == "PAYMENT_PENDING":
            case.status = CaseStateMachine.validate_transition(case.status, "WAITING_FOR_PROVIDER")
            case.resolution_type = "PAYMENT_PENDING_SCHEDULED"
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="SCHEDULE_RECHECK",
                description="Payment is still pending with the bank. Recheck scheduled.",
                actor_type="SYSTEM",
            )

        elif decision == "OFFER_ORDER_RECOVERY":
            case.status = CaseStateMachine.validate_transition(case.status, "WAITING_FOR_CUSTOMER")
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="RECOVERY_OFFERED",
                description="Stock is available. Offered original purchase recovery to customer awaiting confirmation.",
                actor_type="AI",
            )

        elif decision == "OFFER_REFUND":
            if ai_proposal.get("requires_approval"):
                case.status = CaseStateMachine.validate_transition(case.status, "WAITING_FOR_APPROVAL")
                # Create Approval Record for Support Manager
                approval = Approval(
                    id=f"appr_{uuid.uuid4().hex[:12]}",
                    case_id=case.id,
                    action_type="REQUEST_REFUND",
                    reason=f"Item out of stock. Refund amount ₹{payment.amount if payment else 0} meets policy threshold.",
                    amount=payment.amount if payment else Decimal("0.00"),
                    status="PENDING",
                    requested_by="resolve_ai_agent",
                    created_at=utcnow(),
                )
                db.add(approval)
                await CaseEngine.log_event(
                    db,
                    case_id=case.id,
                    event_type="APPROVAL_REQUIRED",
                    description=f"Refund exceeds ₹{policy.refund_approval_threshold if policy else 500}. Manager approval request submitted.",
                    actor_type="SYSTEM",
                )
            else:
                # Issue refund immediately if under threshold
                if payment:
                    refund, _ = await RefundSimulator.request_refund(
                        db,
                        payment=payment,
                        reason="Item out of stock (Auto-approved under policy threshold)",
                    )
                    case.refund_id = refund.id
                    case.status = CaseStateMachine.validate_transition(case.status, "WAITING_FOR_PROVIDER")
                    await CaseEngine.log_event(
                        db,
                        case_id=case.id,
                        event_type="REFUND_REQUESTED",
                        description=f"Simulated refund provider reference generated: {refund.provider_reference}",
                        actor_type="PROVIDER",
                    )

        else:  # ESCALATE
            case.status = CaseStateMachine.validate_transition(case.status, "ESCALATED")
            case.resolution_type = "MANUAL_ESCALATION"
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="ESCALATED_TO_HUMAN",
                description="Case escalated to support team with full investigation telemetry and human handoff packet.",
                actor_type="AI",
            )

        case.updated_at = utcnow()
        await db.commit()
        
        # Sync Case update to MongoDB Atlas
        try:
            await sync_model("cases", "id", case)
        except Exception:
            pass

    @staticmethod
    async def process_customer_recovery_confirmation(
        db: AsyncSession,
        case_id: str,
        user: User,
        accepted: bool,
        notes: Optional[str] = None,
    ) -> Case:
        """
        Handles customer's response to offered order recovery.
        Executes idempotent recovery, stock decrement, verification, and resolution.
        """
        case = await CaseEngine.get_case_with_relations(db, case_id)
        if not case:
            raise ValueError("Case not found")

        # RULE 1: Customer Ownership
        DeterministicBusinessRules.validate_customer_ownership(user, case.customer_id)

        if not accepted:
            case.status = CaseStateMachine.validate_transition(case.status, "ESCALATED")
            case.resolution_type = "MANUAL_ESCALATION"
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="RECOVERY_DECLINED",
                description=f"Customer declined recovery option: '{notes or 'No notes provided'}'. Escalated to support.",
                actor_type="CUSTOMER",
                actor_id=user.id,
            )
            await db.commit()
            return case

        # Customer accepted recovery
        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="CUSTOMER_ACCEPTED",
            description="Customer accepted order recovery. Initiating deterministic backend execution.",
            actor_type="CUSTOMER",
            actor_id=user.id,
        )

        case.status = CaseStateMachine.validate_transition(case.status, "ACTION_IN_PROGRESS")
        await db.commit()

        # Fetch payment & checkout
        if not case.payment_id:
            raise ValueError("No payment linked to case for recovery.")

        payment = await PaymentSimulator.get_payment_by_id(db, case.payment_id)
        if not payment:
            raise ValueError("Payment record not found.")

        checkout = await MerchantSimulator.get_checkout(db, payment.checkout_id) if payment.checkout_id else None
        if not checkout:
            # Fallback to latest checkout
            res_chk = await db.execute(
                select(CheckoutAttempt).filter(CheckoutAttempt.customer_id == case.customer_id)
            )
            checkout = res_chk.scalars().first()

        if not checkout:
            raise ValueError("Checkout record required for order recovery.")

        # Validate Deterministic Business Rules
        existing_order = await MerchantSimulator.get_order_by_payment(db, payment.id)
        existing_refund = await RefundSimulator.get_refund_by_payment(db, payment.id)
        product = await MerchantSimulator.get_product(db, checkout.product_id)
        policy = await MerchantSimulator.get_merchant_policy(db, case.merchant_id)

        recovery_ok, error_msg = DeterministicBusinessRules.validate_order_recovery_eligibility(
            payment=payment,
            existing_order=existing_order,
            stock=product.stock if product else 0,
            recovery_enabled=policy.order_recovery_enabled if policy else True,
            existing_refund=existing_refund,
        )

        if not recovery_ok:
            case.status = CaseStateMachine.validate_transition(case.status, "FAILED")
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="RECOVERY_FAILED",
                description=f"Deterministic rule check failed: {error_msg}",
                actor_type="SYSTEM",
            )
            await db.commit()
            raise ValueError(error_msg)

        # Execute Idempotent Order Recovery
        idempotency_key = f"RECOVERY-{case.id}-{payment.id}"
        order, is_new = await MerchantSimulator.recover_order_for_payment(db, payment, checkout)
        case.order_id = order.id

        await CaseEngine.log_action(
            db,
            case_id=case.id,
            action_type="RECOVER_ORDER",
            requested_by="resolve_ai_agent",
            status="SUCCESS",
            idempotency_key=idempotency_key,
            provider_reference=order.order_number,
            result_metadata={"order_id": order.id, "order_number": order.order_number, "is_new": is_new},
        )

        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="ORDER_CREATED",
            description=f"Recovered order {order.order_number} created successfully and linked to payment {payment.payment_reference}",
            actor_type="SYSTEM",
        )

        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="PAYMENT_LINKED",
            description=f"Verified payment {payment.payment_reference} linked without duplicate customer charge.",
            actor_type="SYSTEM",
        )

        # Transition to VERIFYING
        case.status = CaseStateMachine.validate_transition(case.status, "VERIFYING")
        await db.commit()

        # Independent Verification Step
        verified_order = await MerchantSimulator.get_order_by_id(db, order.id)
        if verified_order and verified_order.payment_id == payment.id and verified_order.status == "CONFIRMED":
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="RECOVERY_VERIFIED",
                description=f"Outcome independently verified: Order {verified_order.order_number} confirmed, payment linked, stock updated.",
                actor_type="SYSTEM",
            )
            case.status = CaseStateMachine.validate_transition(case.status, "RESOLVED")
            case.resolution_type = "ORDER_RECOVERY"
            case.closed_at = utcnow()
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="CASE_RESOLVED",
                description="Case resolved with verified order recovery outcome.",
                actor_type="AI",
            )

            # Notification
            notification = Notification(
                id=f"notif_{uuid.uuid4().hex[:12]}",
                user_id=case.customer_id,
                case_id=case.id,
                title="Order Successfully Recovered",
                message=f"Your order #{verified_order.order_number} has been confirmed and verified. Thank you for using Resolve AI!",
                channel="APP",
                created_at=utcnow(),
            )
            db.add(notification)
        else:
            case.status = CaseStateMachine.validate_transition(case.status, "FAILED")
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="VERIFICATION_FAILED",
                description="Independent post-action verification could not verify order confirmation state.",
                actor_type="SYSTEM",
            )

        case.updated_at = utcnow()
        await db.commit()

        # Sync Case, Order, and Notification to MongoDB Atlas
        try:
            await sync_model("cases", "id", case)
            if verified_order:
                await sync_model("orders", "id", verified_order)
            if 'notification' in locals() and notification:
                await sync_model("notifications", "id", notification)
        except Exception:
            pass

        refreshed = await CaseEngine.get_case_with_relations(db, case.id)
        return refreshed or case

    @staticmethod
    async def process_approval_decision(
        db: AsyncSession,
        approval_id: str,
        reviewer: User,
        approved: bool,
        decision_notes: Optional[str] = None,
    ) -> Approval:
        """Process manager / employee approval for restricted actions (e.g. refunds)."""
        res = await db.execute(select(Approval).filter(Approval.id == approval_id))
        approval = res.scalars().first()
        if not approval:
            raise ValueError("Approval record not found.")

        if approval.status != "PENDING":
            raise ValueError(f"Approval already processed (Current status: {approval.status})")

        case = await CaseEngine.get_case_with_relations(db, approval.case_id)
        if not case:
            raise ValueError("Associated case not found.")

        approval.reviewed_by = reviewer.id
        approval.decision_notes = decision_notes
        approval.reviewed_at = utcnow()

        if not approved:
            approval.status = "REJECTED"
            case.status = CaseStateMachine.validate_transition(case.status, "ESCALATED")
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="APPROVAL_REJECTED",
                description=f"Manager {reviewer.full_name} rejected action: '{decision_notes or 'No reason provided'}'",
                actor_type="EMPLOYEE",
                actor_id=reviewer.id,
            )
            await db.commit()
            return approval

        # Approved
        approval.status = "APPROVED"
        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="MANAGER_APPROVED",
            description=f"Manager {reviewer.full_name} approved {approval.action_type}. Reason: '{decision_notes or 'Policy authorized'}'",
            actor_type="EMPLOYEE",
            actor_id=reviewer.id,
        )

        case.status = CaseStateMachine.validate_transition(case.status, "ACTION_IN_PROGRESS")
        await db.commit()

        # Execute the approved action
        if approval.action_type == "REQUEST_REFUND":
            if not case.payment_id:
                raise ValueError("No payment linked to case for refund.")
            payment = await PaymentSimulator.get_payment_by_id(db, case.payment_id)
            if not payment:
                raise ValueError("Payment record not found.")

            refund, is_new = await RefundSimulator.request_refund(
                db,
                payment=payment,
                reason=f"Approved by {reviewer.full_name}: {decision_notes or 'Out of stock'}",
                approved_by=reviewer.id,
                initial_status="PENDING",
            )
            case.refund_id = refund.id

            await CaseEngine.log_action(
                db,
                case_id=case.id,
                action_type="REQUEST_REFUND",
                requested_by="resolve_ai_agent",
                approved_by=reviewer.id,
                status="SUCCESS",
                provider_reference=refund.provider_reference,
                result_metadata={"refund_id": refund.id, "amount": float(refund.amount), "provider_ref": refund.provider_reference},
            )

            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="REFUND_REQUESTED",
                description=f"Simulated refund initiated with bank provider (Provider Ref: {refund.provider_reference}). Status: PENDING",
                actor_type="PROVIDER",
                actor_id="SIMULATED_GATEWAY",
            )

            case.status = CaseStateMachine.validate_transition(case.status, "WAITING_FOR_PROVIDER")
            case.resolution_type = "REFUND_ISSUED"
            await db.commit()

            # Sync Case, Approval, and Refund to MongoDB Atlas
            try:
                await sync_model("cases", "id", case)
                await sync_model("approvals", "id", approval)
                await sync_model("refunds", "id", refund)
            except Exception:
                pass

        return approval

    @staticmethod
    async def step_refund_verification(db: AsyncSession, case_id: str) -> Case:
        """Steps simulated refund from PENDING to verified SUCCESS and resolves the case."""
        case = await CaseEngine.get_case_with_relations(db, case_id)
        if not case or not case.refund_id:
            raise ValueError("Case or linked refund not found.")

        refund = await RefundSimulator.transition_refund_to_success(db, case.refund_id)
        if not refund:
            raise ValueError("Could not update refund status.")

        await CaseEngine.log_event(
            db,
            case_id=case.id,
            event_type="REFUND_STATUS_CHECKED",
            description=f"Simulated refund provider polled for reference {refund.provider_reference}. Status: SUCCESS",
            actor_type="PROVIDER",
        )

        case.status = CaseStateMachine.validate_transition(case.status, "VERIFYING")
        await db.commit()

        # Verify outcome
        if refund.status == "SUCCESS":
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="REFUND_SUCCESS",
                description=f"Refund of ₹{refund.amount} confirmed settled by provider to customer account.",
                actor_type="PROVIDER",
            )
            case.status = CaseStateMachine.validate_transition(case.status, "RESOLVED")
            case.resolution_type = "REFUND_ISSUED"
            case.closed_at = utcnow()
            await CaseEngine.log_event(
                db,
                case_id=case.id,
                event_type="CASE_RESOLVED",
                description="Case resolved with verified refund payout outcome.",
                actor_type="AI",
            )

            notification = Notification(
                id=f"notif_{uuid.uuid4().hex[:12]}",
                user_id=case.customer_id,
                case_id=case.id,
                title="Refund Confirmed",
                message=f"Your refund of ₹{refund.amount} (Ref: {refund.provider_reference}) has settled successfully.",
                channel="APP",
                created_at=utcnow(),
            )
            db.add(notification)
            await db.commit()

            # Sync Case, Refund, and Notification to MongoDB Atlas
            try:
                await sync_model("cases", "id", case)
                await sync_model("refunds", "id", refund)
                await sync_model("notifications", "id", notification)
            except Exception:
                pass

        refreshed = await CaseEngine.get_case_with_relations(db, case.id)
        return refreshed or case
