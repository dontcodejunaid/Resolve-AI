import json
import httpx
from typing import Dict, Any, Optional
from backend.app.config import settings
from backend.app.services.cognee_client import CogneeClient

AI_SYSTEM_PROMPT = """
You are Resolve AI, an accountable customer-service teammate.
Your job is to investigate and resolve payment/order issues.
Never claim an action happened unless the backend/provider confirms it.
Never invent payment status.
Never invent order status.
Never invent refund status.
Never expose private information belonging to another customer.
Use tools to obtain evidence.
Use merchant policy knowledge when deciding permitted paths.
Do not bypass backend authorization.
If evidence conflicts, escalate.
If an action fails, report the failure and continue the case appropriately.
If approval is required, request approval rather than bypassing it.
If the customer needs to make a decision, ask them clearly.
Do not close a case until the expected outcome has been verified.
Always distinguish: CONFIRMED, UNCONFIRMED, FAILED, PENDING, UNKNOWN.
AI PROPOSES. CODE DECIDES.
"""


class AIOrchestrator:
    """
    AI Orchestration Layer.
    Coordinates between n8n Cloud workflows, Cognee knowledge layer, and FastAPI backend tools.
    """

    @staticmethod
    async def analyze_and_propose(
        case_id: str,
        customer_request: str,
        investigation_evidence: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Synthesizes investigation facts against Cognee policies and proposes the next authoritative action.
        """
        # 1. Retrieve knowledge from Cognee
        knowledge_results = await CogneeClient.query_knowledge(customer_request)

        # 2. Try n8n webhook workflow if configured
        webhook_url = settings.N8N_WEBHOOK_URL
        if not webhook_url and settings.N8N_BASE_URL and "your-instance" not in settings.N8N_BASE_URL:
            webhook_url = f"{settings.N8N_BASE_URL.rstrip('/')}/webhook/resolve-case-investigation"

        if webhook_url:
            try:
                headers = {"Content-Type": "application/json"}
                if settings.N8N_API_KEY and "placeholder" not in settings.N8N_API_KEY:
                    headers["X-N8N-API-KEY"] = settings.N8N_API_KEY

                async with httpx.AsyncClient(timeout=8.0) as client:
                    pay_info = investigation_evidence.get("payment") or {}
                    prod_info = investigation_evidence.get("product") or {}
                    n8n_res = await client.post(
                        webhook_url,
                        headers=headers,
                        json={
                            "case_id": case_id,
                            "customer_id": investigation_evidence.get("customer_id") or "usr_rahul",
                            "customer_request": customer_request,
                            "store_name": "AURA STUDIO",
                            "store_url": "https://aura-nine-virid.vercel.app/",
                            "screenshot_url": investigation_evidence.get("screenshot_url"),
                            "screenshot_base64": investigation_evidence.get("screenshot_base64"),
                            "screenshot_analysis": investigation_evidence.get("screenshot_analysis"),
                            "payment_reference": pay_info.get("payment_reference") or investigation_evidence.get("payment_reference") or "TXN_4829103_INR",
                            "product_id": prod_info.get("id") or investigation_evidence.get("product_id") or "prod_hoodie_01",
                            "product_name": prod_info.get("name") or "Heavyweight Boxy Hoodie",
                            "amount": pay_info.get("amount") or 2499.00,
                            "currency": pay_info.get("currency") or "INR",
                            "customer_phone": investigation_evidence.get("customer_phone") or "917892724453",
                            "backend_url": "http://127.0.0.1:8000",
                            "evidence": investigation_evidence,
                            "knowledge": knowledge_results,
                        }
                    )
                    if n8n_res.status_code == 200:
                        return n8n_res.json()
            except Exception as e:
                print(f"[n8n Cloud Fallback] Invoking local AI decision engine: {e}")

        # 3. Local Autonomous AI Teammate Logic
        payment = investigation_evidence.get("payment")
        order = investigation_evidence.get("order")
        product = investigation_evidence.get("product")
        refund = investigation_evidence.get("refund")
        policy = investigation_evidence.get("policy") or {}
        conflict = investigation_evidence.get("conflict")

        # SITUATION G: Conflicting Records (RULE 9 & RULE 10)
        if conflict:
            return {
                "decision": "CONFLICT_ESCALATE",
                "proposed_action": "ESCALATE",
                "requires_customer_confirmation": False,
                "requires_approval": False,
                "ai_summary": f"Deterministic mismatch detected: {conflict}. Handoff packet prepared for human specialist.",
                "customer_message": f"Our system detected a discrepancy ({conflict}). A support specialist has been assigned to verify and resolve this manually."
            }

        # SITUATION A: Payment SUCCESS + Order EXISTS
        if payment and payment.get("status") == "SUCCESS" and order:
            return {
                "decision": "SHOW_EXISTING_ORDER",
                "proposed_action": "CONFIRM_EXISTING_ORDER",
                "requires_customer_confirmation": False,
                "requires_approval": False,
                "ai_summary": f"Payment of ₹{payment.get('amount')} was verified and an active order ({order.get('order_number')}) is already linked. No duplicate order created.",
                "customer_message": f"Good news! Your payment of ₹{payment.get('amount')} is linked to order {order.get('order_number')}. The order is currently {order.get('status')}."
            }

        # SITUATION F: Refund Already Exists
        if refund and refund.get("status") in ["PENDING", "REQUESTED"]:
            return {
                "decision": "TRACK_EXISTING_REFUND",
                "proposed_action": "CHECK_REFUND",
                "requires_customer_confirmation": False,
                "requires_approval": False,
                "ai_summary": f"A refund of ₹{refund.get('amount')} is already in progress (Provider Ref: {refund.get('provider_reference')}). Tracking existing refund.",
                "customer_message": f"A refund of ₹{refund.get('amount')} is currently being processed by your bank (Reference: {refund.get('provider_reference')}). We are monitoring it."
            }

        # SITUATION D: Payment PENDING
        if payment and payment.get("status") == "PENDING":
            return {
                "decision": "PAYMENT_PENDING",
                "proposed_action": "SCHEDULE_RECHECK",
                "requires_customer_confirmation": False,
                "requires_approval": False,
                "ai_summary": f"Payment TXN {payment.get('payment_reference')} is PENDING at the bank. Scheduled background recheck.",
                "customer_message": f"Your payment of ₹{payment.get('amount')} is still awaiting bank confirmation. We have not created an order yet, and we will automatically recheck in the background."
            }

        # SITUATION E: Provider cannot find payment
        if not payment or payment.get("status") == "NOT_FOUND":
            return {
                "decision": "PAYMENT_NOT_FOUND_ESCALATE",
                "proposed_action": "ESCALATE",
                "requires_customer_confirmation": False,
                "requires_approval": False,
                "ai_summary": "Payment provider returned NOT_FOUND for the referenced transaction. Escalated with customer claim.",
                "customer_message": "Our payment provider could not locate a completed charge for this transaction. A support specialist has been assigned to inspect manual bank receipts."
            }

        # SITUATION B: Payment SUCCESS + Order MISSING + Product AVAILABLE
        if payment and payment.get("status") == "SUCCESS" and not order and product and product.get("stock", 0) > 0:
            return {
                "decision": "OFFER_ORDER_RECOVERY",
                "proposed_action": "RECOVER_ORDER",
                "requires_customer_confirmation": True,
                "requires_approval": False,
                "ai_summary": f"Verified payment of ₹{payment.get('amount')} for {product.get('name')}. Order was missing due to a webhook timeout. Stock is available ({product.get('stock')} units). Proposing order recovery.",
                "customer_message": f"Your ₹{payment.get('amount')} payment was confirmed by the simulated payment provider. Your checkout was saved, but no confirmed order was linked. The {product.get('name')} is in stock. Would you like me to complete and recover your original purchase without any extra charge?"
            }

        # SITUATION C: Payment SUCCESS + Order MISSING + Product UNAVAILABLE
        if payment and payment.get("status") == "SUCCESS" and not order and product and product.get("stock", 0) <= 0:
            threshold = float(policy.get("refund_approval_threshold", 500.00))
            needs_approval = float(payment.get("amount", 0)) >= threshold and policy.get("refund_approval_required", True)

            return {
                "decision": "OFFER_REFUND",
                "proposed_action": "REQUEST_REFUND",
                "requires_customer_confirmation": False,
                "requires_approval": needs_approval,
                "ai_summary": f"Payment verified ₹{payment.get('amount')}, but {product.get('name')} is out of stock. Refund path selected. Manager approval required: {needs_approval}.",
                "customer_message": f"Your payment of ₹{payment.get('amount')} was verified, but {product.get('name')} is currently out of stock. A full refund has been initiated to your original payment method." + (" (Pending manager review under store policy)" if needs_approval else "")
            }

        # SITUATION G / CONFLICT: Unknown or conflicting
        return {
            "decision": "CONFLICT_ESCALATE",
            "proposed_action": "ESCALATE",
            "requires_customer_confirmation": False,
            "requires_approval": False,
            "ai_summary": "Inconclusive system evidence or conflicting transaction records. Preparing human handoff packet.",
            "customer_message": "We encountered conflicting records while investigating your order. A specialist has been assigned with full investigation telemetry to resolve this directly."
        }
