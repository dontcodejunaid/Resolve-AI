# RESOLVE AI — API & Simulator Endpoint Specification

This document details all REST and Webhook endpoints exposed by the FastAPI backend for n8n workflows and UI portals.

---

## Base URL: `http://localhost:8000`

### 1. Webhook Intake
#### `POST /webhook/resolve-case`
Ingests customer complaints and triggers the n8n case orchestrator.
- **Request Body**:
```json
{
  "case_id": "RS-4471",
  "customer_id": "usr_rahul",
  "message": "I paid ₹799 but my order is not showing",
  "payment_reference": "TXN987654",
  "merchant_id": "mer_resolve_store",
  "timestamp": "2026-09-18T12:30:00Z"
}
```
- **Response `200 OK`**:
```json
{
  "case_id": "case_101",
  "case_number": "RS-4471",
  "customer_id": "usr_rahul",
  "merchant_id": "mer_resolve_store",
  "message": "I paid ₹799 but my order is not showing",
  "payment_reference": "TXN987654",
  "status": "INVESTIGATING",
  "n8n_trigger_status": "READY_FOR_INVESTIGATION"
}
```

---

### 2. Payment Simulator Tools
#### `GET /api/payments/{payment_reference}`
Retrieve simulated payment record by transaction reference or payment ID.
- **Response `200 OK`**:
```json
{
  "payment_id": "pay_101",
  "reference": "TXN987654",
  "payment_reference": "TXN987654",
  "customer_id": "usr_rahul",
  "merchant_id": "mer_resolve_store",
  "amount": 799.00,
  "currency": "INR",
  "status": "SUCCESS",
  "merchant_received": true,
  "provider_name": "Razorpay Simulator"
}
```

#### `GET /api/payments/{payment_reference}/settlement`
Check merchant settlement status.
- **Response `200 OK`**:
```json
{
  "payment_reference": "TXN987654",
  "amount": 799.00,
  "currency": "INR",
  "payment_status": "SUCCESS",
  "settlement_status": "MERCHANT_RECEIVED",
  "merchant_id": "mer_resolve_store"
}
```

#### `GET /api/payments/reconciliation`
Returns unlinked successful payments for proactive background reconciliation.
- **Response `200 OK`**:
```json
{
  "count": 1,
  "unmatched_payments": [
    {
      "payment_id": "pay_902",
      "payment_reference": "TXN-ORPHAN-799",
      "customer_id": "usr_rahul",
      "merchant_id": "mer_resolve_store",
      "amount": 799.00,
      "currency": "INR",
      "status": "SUCCESS",
      "has_active_case": false
    }
  ]
}
```

---

### 3. Order Simulator Tools
#### `GET /api/orders/search?payment_reference={ref}`
Search orders in merchant system by payment reference.
- **Response `200 OK` (Found)**:
```json
{
  "found": true,
  "order_id": "ord_101",
  "order_number": "ORD-6732",
  "status": "CONFIRMED",
  "payment_reference": "TXN987654",
  "payment_linked": true,
  "amount": 799.00
}
```
- **Response `200 OK` (Not Found)**:
```json
{
  "found": false,
  "count": 0,
  "orders": [],
  "message": "Order NOT FOUND in merchant system."
}
```

#### `POST /api/orders/recover`
Authoritative order recovery execution.
- **Request Body**:
```json
{
  "case_id": "RS-4471",
  "payment_reference": "TXN987654",
  "idempotency_key": "RS-4471_ORDER_RECOVERY"
}
```
- **Response `200 OK`**:
```json
{
  "status": "SUCCESS",
  "message": "Order #ORD-REC-89102 recovered and payment linked.",
  "order_id": "ord_89102",
  "order_number": "ORD-REC-89102",
  "amount": 799.00,
  "payment_linked": true,
  "verified": true,
  "idempotency_key": "RS-4471_ORDER_RECOVERY"
}
```

---

### 4. Inventory & Refund Tools
#### `GET /api/products/{product_id}/availability`
Check stock availability.
- **Response `200 OK`**:
```json
{
  "product_id": "prod_headset",
  "name": "Wireless Headset",
  "price": 799.00,
  "currency": "INR",
  "quantity": 12,
  "available": true
}
```

#### `GET /api/refunds/search?payment_reference={ref}`
Search existing refunds.
- **Response `200 OK`**:
```json
{
  "found": false,
  "status": "NOT_FOUND",
  "count": 0,
  "refunds": []
}
```

#### `POST /api/refunds`
Initiate refund with policy threshold check.
- **Request Body**:
```json
{
  "case_id": "RS-4472",
  "payment_reference": "TXN987655",
  "amount": 799.00,
  "reason": "Out of stock item",
  "idempotency_key": "RS-4472_REFUND"
}
```
- **Response `200 OK` (Threshold Exceeded)**:
```json
{
  "status": "WAITING_FOR_APPROVAL",
  "message": "Refund of ₹799.00 exceeds approval threshold. Case routed for manager approval.",
  "approval_id": "appr_101",
  "requires_approval": true,
  "idempotency_key": "RS-4472_REFUND"
}
```

---

### 5. Activity Stream & Escalation
#### `POST /api/cases/{case_id}/activity`
Emit activity event for animated worker character floor.
- **Request Body**:
```json
{
  "case_id": "RS-4471",
  "agent": "PAYMENT_AGENT",
  "activity": "VERIFYING_PAYMENT",
  "message": "Checking payment provider status...",
  "status": "RUNNING"
}
```

#### `POST /api/cases/{case_id}/escalate`
Submit structured handoff packet for human support dashboard.
- **Request Body**:
```json
{
  "case_id": "RS-4478",
  "customer_request": "Disputed cancellation",
  "verified_facts": ["Payment SUCCESS ₹799"],
  "uncertainties": ["Order marked CANCELLED in ERP but customer claims delivery"],
  "actions_attempted": ["GET /api/payments/TXN987660", "GET /api/orders/search"],
  "decision_required": "Confirm whether to issue replacement or manual refund",
  "reason_for_escalation": "Conflicting records across ERP and Gateway"
}
```

---

### 6. Demo Scenario Lab Endpoints
- `POST /api/demo/scenario/payment-success-order-missing`
- `POST /api/demo/scenario/product-unavailable`
- `POST /api/demo/scenario/payment-success-merchant-missing`
- `POST /api/demo/scenario/payment-success-order-exists`
- `POST /api/demo/scenario/payment-pending`
- `POST /api/demo/scenario/refund-pending`
- `POST /api/demo/scenario/conflicting-records`
- `POST /api/demo/scenario/duplicate-notification`
