import httpx
from typing import Dict, Any, List, Optional
from backend.app.config import settings

# Structured Knowledge Base for Cognee Layer
KNOWLEDGE_DATASET = [
    {
        "id": "kb_policy_recovery_01",
        "category": "ORDER_RECOVERY_POLICY",
        "title": "Missing Order with Confirmed Payment Policy",
        "content": "When a customer payment is confirmed SUCCESS on the simulated gateway but no order was created, the system must check product stock. If stock >= requested quantity and the customer approves, the system should execute an idempotent order recovery linking the verified payment reference without re-charging the customer.",
        "tags": ["recovery", "order_missing", "stock_available", "payment_success"]
    },
    {
        "id": "kb_policy_refund_02",
        "category": "REFUND_POLICY",
        "title": "Out of Stock Payment Refund Policy",
        "content": "If payment is confirmed SUCCESS but the requested item is out of stock (stock == 0), the system must offer a full refund. Under Resolve Store policy, refunds equal to or exceeding the threshold (₹500.00) require manager approval before initiating the provider payout.",
        "tags": ["refund", "out_of_stock", "approval_required", "threshold_500"]
    },
    {
        "id": "kb_policy_pending_03",
        "category": "PAYMENT_POLICY",
        "title": "Pending Payment Policy",
        "content": "If a transaction is in PENDING status at the bank or gateway, the AI teammate must NEVER issue a refund or create a product order. The system must schedule an automated background recheck and inform the customer that their payment is awaiting bank settlement.",
        "tags": ["pending_payment", "no_refund", "no_order", "schedule_recheck"]
    },
    {
        "id": "kb_policy_conflict_04",
        "category": "ESCALATION_POLICY",
        "title": "Conflicting Records & Human Handoff Protocol",
        "content": "When records conflict (such as mismatched currency, mismatched merchant, or unresolvable gateway errors), the AI must NOT guess or make unilateral financial changes. It must prepare a structured human handoff containing: 1. Customer intent, 2. Verified facts, 3. Uncertain items, 4. Actions attempted, and 5. Required human decision.",
        "tags": ["conflict", "escalation", "human_handoff", "uncertainty"]
    },
    {
        "id": "kb_case_example_05",
        "category": "PAST_CASE_EXAMPLES",
        "title": "Resolved Case Example RS-3910: Duplicate Notification Guard",
        "content": "In Case RS-3910, the payment gateway sent duplicate webhook success notifications for ₹799. The idempotency guard intercepted the second event, returned the active order #ORD-88129, and prevented a duplicate shipment.",
        "tags": ["idempotency", "duplicate_prevention", "example"]
    }
]


class CogneeClient:
    """
    Cognee Knowledge & Memory Layer Client.
    Communicates with Cognee Cloud or provides local indexed knowledge retrieval.
    """

    @staticmethod
    async def query_knowledge(query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant policies and past context based on complaint semantics."""
        # 1. Try Cognee Cloud API if configured
        if settings.COGNEE_API_KEY and settings.COGNEE_API_URL:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.post(
                        f"{settings.COGNEE_API_URL}/api/v1/search",
                        headers={"Authorization": f"Bearer {settings.COGNEE_API_KEY}"},
                        json={"query": query, "limit": limit}
                    )
                    if response.status_code == 200:
                        return response.json().get("results", [])
            except Exception as e:
                print(f"[Cognee Cloud Warning] Fallback to local knowledge dataset: {e}")

        # 2. Local semantic / keyword matching
        query_words = set(query.lower().split())
        scored_items = []
        for item in KNOWLEDGE_DATASET:
            score = 0
            searchable_text = f"{item['title']} {item['content']} {' '.join(item['tags'])}".lower()
            for word in query_words:
                if word in searchable_text:
                    score += 1
            if score > 0:
                scored_items.append((score, item))

        scored_items.sort(key=lambda x: x[0], reverse=True)
        if scored_items:
            return [item for _, item in scored_items[:limit]]
        return KNOWLEDGE_DATASET[:limit]
