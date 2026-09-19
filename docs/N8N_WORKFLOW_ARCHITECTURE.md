# RESOLVE AI — n8n Workflow Architecture Specification

## 1. System Overview & Core Architectural Principle

**RESOLVE AI** is an autonomous AI customer-service teammate prototype engineered for payment and order mismatch resolution.

> **CORE PRINCIPLE**: **"AI PROPOSES. CODE DECIDES."**

```
Customer / Employee / Merchant UI
              ↓
           FastAPI
              ↓
             n8n (Orchestration Layer)
              ↓
           AI Agent (Reasoning Layer)
              ↓
      Cognee (Knowledge & Memory Layer)
              ↓
 Payment / Merchant / Refund / Inventory Simulators
              ↓
     FastAPI Validation & Idempotency Layer
              ↓
         MongoDB Atlas (Authoritative Truth)
              ↓
 Verified Outcome & Live Activity Stream Broadcast
```

### Roles:
1. **CUSTOMER**: Reports mismatch issues, views real-time investigation steps, confirms proposed recovery actions.
2. **SUPPORT EMPLOYEE**: Reviews human-escalated cases, inspects structured handoff packets, approves/rejects high-value refunds.
3. **MERCHANT / STORE MANAGER**: Configures refund thresholds, sets recovery policies, monitors settlement reconciliation.

---

## 2. The 10 Modular Workflows

| # | Workflow Name | Filename | Trigger | Primary Responsibility |
|---|---|---|---|---|
| **01** | `RESOLVE_AI_CASE_ORCHESTRATOR` | `01_resolve_ai_case_orchestrator.json` | Webhook (`POST /webhook/resolve-case`) / Manual | Main case intake, payload validation, Cognee lookup, AI reasoning, routing |
| **02** | `RESOLVE_AI_PAYMENT_CHECK` | `02_resolve_ai_payment_check.json` | Sub-Workflow / Manual | Gateway transaction lookup, settlement verification, monetary fact validation |
| **03** | `RESOLVE_AI_ORDER_RECOVERY` | `03_resolve_ai_order_recovery.json` | Sub-Workflow / Manual | ERP order search, warehouse stock audit, idempotent order recovery execution |
| **04** | `RESOLVE_AI_REFUND_PROCESSOR` | `04_resolve_ai_refund_processor.json` | Sub-Workflow / Manual | Refund search, policy threshold check, manager approval dispatch, refund disbursement |
| **05** | `RESOLVE_AI_REFUND_MONITOR` | `05_resolve_ai_refund_monitor.json` | Schedule Trigger (Every 2 min) | Background polling of `REFUND_PENDING` cases until verified `SUCCESS` or `FAILED` |
| **06** | `RESOLVE_AI_SETTLEMENT_MONITOR` | `06_resolve_ai_settlement_monitor.json` | Schedule Trigger (Every 5 min) | Background polling of merchant settlements until `MERCHANT_RECEIVED` |
| **07** | `RESOLVE_AI_RECONCILIATION` | `07_resolve_ai_reconciliation.json` | Schedule Trigger (Every 15 min) | Proactive scan of unlinked payments (`GET /api/payments/reconciliation`) & auto-case opening |
| **08** | `RESOLVE_AI_HUMAN_ESCALATION` | `08_resolve_ai_human_escalation.json` | Sub-Workflow / Manual | Structured handoff packet generation, `HUMAN_REVIEW` status, employee alerting |
| **09** | `RESOLVE_AI_NOTIFICATION` | `09_resolve_ai_notification.json` | Sub-Workflow / Manual | Customer & merchant status update dispatch, non-technical plain language formatting |
| **10** | `RESOLVE_AI_ACTIVITY_STREAM` | `10_resolve_ai_activity_stream.json` | Sub-Workflow / Manual | Real-time event streaming for frontend animated worker floor characters |

---

## 3. AI Case Understanding & Classification Schema

The reasoning engine classifies complaints into one of **17 deterministic issue categories**:

1. `PAYMENT_SUCCESS_ORDER_MISSING`
2. `PAYMENT_SUCCESS_ORDER_EXISTS`
3. `PAYMENT_SUCCESS_MERCHANT_NOT_RECEIVED`
4. `PAYMENT_PENDING`
5. `PAYMENT_FAILED`
6. `PAYMENT_UNKNOWN`
7. `ORDER_CREATED_PAYMENT_MISSING`
8. `ORDER_CREATED_PAYMENT_SUCCESS_MERCHANT_PENDING`
9. `REFUND_REQUIRED`
10. `REFUND_ALREADY_EXISTS`
11. `REFUND_PENDING`
12. `REFUND_SUCCESS`
13. `DUPLICATE_NOTIFICATION`
14. `CONFLICTING_RECORDS`
15. `CONNECTED_SERVICE_UNAVAILABLE`
16. `INSUFFICIENT_INFORMATION`
17. `OTHER`

### AI Structured JSON Output Contract:
```json
{
  "case_id": "RS-4471",
  "issue_type": "PAYMENT_SUCCESS_ORDER_MISSING",
  "confidence": 0.96,
  "facts": [
    "Payment TXN987654 confirmed SUCCESS for ₹799.00",
    "Order not found in merchant ERP system",
    "Product Wireless Headset in stock (12 units)"
  ],
  "missing_information": [],
  "checks_required": ["payment", "order", "inventory"],
  "proposed_action": "ORDER_RECOVERY",
  "reason": "Payment verified and stock available. Proposing order recovery.",
  "requires_human": false,
  "human_reason": ""
}
```

---

## 4. Cognee Knowledge & Memory Layer Integration

Before proposing sensitive financial actions, the AI queries Cognee for:
- Merchant refund policies & approval thresholds (`refund_approval_threshold`).
- Order recovery conditions (e.g., stock > 0, customer consent).
- Similar historical case precedents.

### Sample Cognee Queries:
- `"What is the recovery policy when payment succeeds but an order is not created?"`
- `"What approval is required for a refund of ₹799 for merchant MERCHANT-001?"`

> **CRITICAL RULE**: Cognee is the **knowledge/policy layer**, NOT the source of truth for balances, order states, or transaction outcomes. Those must come from FastAPI simulated endpoints.

---

## 5. Visual "AI Employees" Activity Stream

During execution, n8n emits activity events mapped to animated worker characters on the React UI floor:

| Agent Identifier | Activity Name | Visual Worker Description |
|---|---|---|
| `PAYMENT_AGENT` | `VERIFYING_PAYMENT` / `CHECKING_PAYMENT` | Worker examining digital payment receipt and banking ledger |
| `ORDER_AGENT` | `VERIFYING_ORDER` | Worker searching merchant warehouse and ERP catalog |
| `INVENTORY_AGENT` | `CHECKING_INVENTORY` | Worker inspecting physical warehouse boxes and stock shelves |
| `POLICY_AGENT` | `ANALYZING_POLICY` | Worker reviewing merchant rulebook and refund guidelines |
| `DECISION_AGENT` | `DECIDING_NEXT_STEP` | Worker analyzing facts and synthesizing the next optimal action |
| `ACTION_AGENT` | `CREATING_ORDER` / `PROCESSING_REFUND` | Worker packaging recovered order or issuing banking refund |
| `VERIFICATION_AGENT` | `VERIFYING_RESULT` | Worker using magnifying glass to audit database outcome |
| `AUDIT_AGENT` | `CASE_RESOLVED` | Worker stamping verified completion seal onto case file |
| `SUPPORT_AGENT` | `ESCALATING_TO_HUMAN` | Worker dispatching emergency handoff packet to employee |

---

## 6. Idempotency & Financial Safety

Every modifying action executes with an **Idempotency Key**:
`IDEMPOTENCY_KEY = {CASE_ID}_{ACTION_TYPE}` (e.g., `RS-4471_ORDER_RECOVERY`, `RS-4471_REFUND`).

- **First Call**: Validates constraints, creates records, updates state, returns `200 OK` (`status: SUCCESS`).
- **Duplicate Call**: Intercepted by FastAPI, returns existing record, returns `status: ALREADY_PROCESSED` without double execution.

---

## 7. Error Handling & Gateway Resilience

| HTTP Status | Workflow Handling Strategy |
|---|---|
| `200 OK` | Proceed with next verification step |
| `400 Bad Request` | Validate input payload; transition case to `FAILED` with explicit reason |
| `404 Not Found` | Differentiate between missing entity vs expected empty search |
| `409 Conflict` | Idempotency hit: retrieve existing transaction outcome rather than erroring |
| `429 Rate Limit` | Exponential backoff retry (1s, 2s, 4s) |
| `500 / 502 / 503 / 504 / Timeout` | Mark system temporarily unavailable; do NOT assume payment or refund failed; schedule background retry |
