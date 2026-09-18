import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy.future import select
from backend.app.database import AsyncSessionLocal
from backend.app.models import Payment, Order, Case, Refund, Notification
from backend.app.services.case_engine import CaseEngine


def utcnow():
    return datetime.now(timezone.utc)


class BackgroundWorker:
    """
    Autonomous Background Reconciliation and Refund Monitoring Service.
    Operates independently even when users are disconnected.
    """

    @staticmethod
    async def reconcile_orphan_payments():
        """
        WORKFLOW 2: Background Reconciliation.
        Finds successful payments with missing orders, proactively creates a case,
        begins investigation, and notifies the customer.
        """
        async with AsyncSessionLocal() as session:
            # Find SUCCESS payments
            res = await session.execute(
                select(Payment)
                .filter(Payment.status == "SUCCESS")
                .order_by(Payment.created_at.desc())
            )
            payments = res.scalars().all()

            reconciled_cases = []
            for pay in payments:
                # Check if order exists
                res_ord = await session.execute(select(Order).filter(Order.payment_id == pay.id))
                existing_ord = res_ord.scalars().first()

                # Check if case already exists
                res_case = await session.execute(select(Case).filter(Case.payment_id == pay.id))
                existing_case = res_case.scalars().first()

                if not existing_ord and not existing_case:
                    # Orphan payment detected! Create proactive case
                    print(f"[Proactive Recon] Orphan payment detected: {pay.payment_reference}. Initializing case.")
                    case = await CaseEngine.create_case(
                        db=session,
                        customer_id=pay.customer_id,
                        merchant_id=pay.merchant_id,
                        customer_request="Automated Background Reconciliation: Payment confirmed but no order found.",
                        payment_reference=pay.payment_reference,
                    )
                    # Notify customer
                    notification = Notification(
                        id=f"notif_{uuid.uuid4().hex[:12]}",
                        user_id=pay.customer_id,
                        case_id=case.id,
                        title="We're checking your recent payment",
                        message=f"We noticed your payment of ₹{pay.amount} completed but your order confirmation is missing. Resolve AI is investigating.",
                        channel="APP",
                        created_at=utcnow(),
                    )
                    session.add(notification)
                    await session.commit()
                    reconciled_cases.append(case.id)

            return reconciled_cases

    @staticmethod
    async def monitor_pending_refunds():
        """
        WORKFLOW 3: Refund Monitor.
        Finds pending refunds and advances them to settled status, resolving the cases.
        """
        async with AsyncSessionLocal() as session:
            res = await session.execute(
                select(Case)
                .filter(Case.status == "WAITING_FOR_PROVIDER")
                .filter(Case.refund_id.isnot(None))
            )
            pending_cases = res.scalars().all()

            resolved_cases = []
            for case in pending_cases:
                res_rfd = await session.execute(select(Refund).filter(Refund.id == case.refund_id))
                refund = res_rfd.scalars().first()
                if refund and refund.status == "PENDING":
                    print(f"[Refund Monitor] Stepping refund {refund.provider_reference} to SUCCESS.")
                    await CaseEngine.step_refund_verification(session, case.id)
                    resolved_cases.append(case.id)

            return resolved_cases
