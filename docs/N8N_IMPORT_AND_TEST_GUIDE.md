# RESOLVE AI — n8n Import & Testing Guide

This guide walks you through importing the Resolve AI workflows into n8n and executing all 10 scenario test flows.

---

## 1. Quick Start: Import into n8n

1. **Open n8n**: Navigate to your n8n instance (e.g., `http://localhost:5678` or n8n Cloud).
2. **Import Master Suite**:
   - In n8n, click **Workflows** → **Add Workflow** (top right) → **...** menu → **Import from File**.
   - Select `n8n/resolve_ai_master_orchestration_suite.json`.
3. **Import Modular Workflows** (Optional for distributed micro-workflow setup):
   - Repeat the import for `01_resolve_ai_case_orchestrator.json` through `10_resolve_ai_activity_stream.json`.
4. **Activate Workflows**: Toggle the workflow switch to **Active** if testing live webhooks.

---

## 2. Live Demo Walkthroughs

### 🎯 Demo 1: Order Recovery (Primary Demo)
- **Scenario**: Customer pays ₹799 for Wireless Headset. Payment succeeds, but order is missing due to a network glitch. Stock is available (12 units).
- **Test Steps**:
  1. Open FastAPI or run curl:
     ```bash
     curl -X POST http://localhost:8000/api/demo/scenario/payment-success-order-missing
     ```
  2. Trigger n8n webhook or click **⚡ 1-Click Master Test Trigger** in n8n.
  3. **Visual Worker Activity**:
     - `PAYMENT_AGENT` verifies ₹799 payment on gateway.
     - `ORDER_AGENT` searches ERP and confirms order is missing.
     - `INVENTORY_AGENT` checks warehouse stock (12 available).
     - `POLICY_AGENT` checks Cognee recovery policy.
     - `ACTION_AGENT` executes `POST /api/orders/recover` with idempotency key.
     - `VERIFICATION_AGENT` verifies order #ORD-REC-XXXX created and payment linked.
     - `AUDIT_AGENT` marks Case `RESOLVED`.
  4. Inspect frontend: Green tick `COMPLETED ✓` on all 5 verification milestones!

---

### 🎯 Demo 2: Out of Stock Refund with Manager Approval
- **Scenario**: Customer pays ₹799 for Keyboard. Payment succeeds, order missing, but item is OUT OF STOCK. Policy requires manager approval for amounts ≥ ₹500.
- **Test Steps**:
  1. Setup scenario:
     ```bash
     curl -X POST http://localhost:8000/api/demo/scenario/product-unavailable
     ```
  2. Execute `RESOLVE_AI_CASE_ORCHESTRATOR`.
  3. AI detects `stock == 0` → Proposes `REFUND` → Identifies ₹799 ≥ ₹500 threshold → Transitions case to `WAITING_FOR_APPROVAL`.
  4. Support Employee approves on Employee Dashboard (`/employee`).
  5. `RESOLVE_AI_REFUND_MONITOR` polls refund until `SUCCESS` → Verifies banking payout → Case marked `RESOLVED`.

---

### 🎯 Demo 3: Merchant Settlement Monitoring
- **Scenario**: Payment is SUCCESS, order is CREATED, but merchant settlement is PENDING.
- **Test Steps**:
  1. Setup scenario:
     ```bash
     curl -X POST http://localhost:8000/api/demo/scenario/payment-success-merchant-missing
     ```
  2. Execute `RESOLVE_AI_CASE_ORCHESTRATOR`.
  3. AI detects order already exists → Does NOT create duplicate order or refund → Initiates `RESOLVE_AI_SETTLEMENT_MONITOR`.
  4. When simulated settlement completes (`MERCHANT_RECEIVED`) → Case marked `RESOLVED`.

---

## 3. Testing Individual Scenarios with Test Payloads

All test payloads are in `n8n/test_payloads/`. You can copy/paste any JSON payload into the n8n **Manual Test Trigger** or send it via `curl`:

```bash
# Test Scenario 1:
curl -X POST http://localhost:8000/webhook/resolve-case   -H "Content-Type: application/json"   -d @n8n/test_payloads/scenario_1_payment_success_order_missing.json

# Test Scenario 8 (Conflicting Records):
curl -X POST http://localhost:8000/webhook/resolve-case   -H "Content-Type: application/json"   -d @n8n/test_payloads/scenario_8_conflicting_records.json
```

---

## 4. Running Automated Tests

Verify the entire test suite including all n8n endpoints, idempotency guards, and scenario generators:

```bash
python -m pytest
```

All 17 automated tests will run and validate backend endpoints, state machine transitions, and idempotency protection.
