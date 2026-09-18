# RESOLVE AI — Demo Scenarios & Walkthrough Guide

## Quick Demo Access
- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **API Swagger Docs**: `http://localhost:8000/docs`
- **Demo Lab Control Panel**: `http://localhost:5173/demo`

---

## Pre-Seeded Accounts (Password: `password123`)

| Role | Name | Email | Scenario Use |
| :--- | :--- | :--- | :--- |
| **Customer** | Rahul Sharma | `rahul@example.com` | Scenario 1: Main Order Recovery |
| **Customer** | Aisha Khan | `aisha@example.com` | Scenario 2: Out of Stock Refund |
| **Customer** | Arjun Verma | `arjun@example.com` | Scenario 3: Pending Payment |
| **Employee** | Support Specialist | `agent@resolveai.com` | Review Telemetry & Escalations |
| **Merchant** | Priya Patel | `manager@resolvestore.com` | Policy Config & Manager Approvals |

---

## 10 Core Demo Scenarios

### Scenario 1: Main Demo — Autonomous Order Recovery
1. Switch account to **Rahul Sharma** (`rahul@example.com`).
2. Go to **Report Missing Order** (`/new-case`).
3. Click the pre-fill button: *"I paid ₹799 for the Wireless Headset via UPI (TXN987654) but my order confirmation is missing."*
4. Click **Start Autonomous Investigation**.
5. Observe real-time checks:
   - Payment Check ✓ (₹799 Confirmed)
   - Checkout Check ✓ (CHK-RS-77210 Found)
   - Order Check ✓ (Missing Order Confirmed)
   - Stock Check ✓ (10 Units Available)
   - AI Proposal: *"Offer Original Order Recovery without extra charge"*
6. Click **[Recover My Order]**.
7. Backend validates idempotency, creates order `#ORD-XXXX`, links payment without charging, verifies outcome, and marks case **RESOLVED**.
8. Go to **Orders** (`/orders`) to see the confirmed recovered order.

---

### Scenario 2: Out of Stock Refund with Human-in-the-Loop Approval
1. Switch account to **Aisha Khan** (`aisha@example.com`).
2. Report missing order for **Mechanical Keyboard** (`TXN987655`, ₹1499.00).
3. AI discovers stock is `0` (Out of Stock).
4. AI queries Cognee: Refund required, but exceeds ₹500.00 store threshold.
5. Case transitions to `WAITING_FOR_APPROVAL`.
6. Switch account to **Store Manager** (`manager@resolvestore.com`).
7. Open **Pending Approvals** (`/employee/approvals`).
8. Review Aisha's ₹1499.00 refund and click **[Approve Refund]**.
9. Case transitions to `WAITING_FOR_PROVIDER` (Provider Ref: `REF-XXXXX`).
10. Click **Settle Refunds Now** in Demo Lab.
11. Provider returns `SUCCESS`, case resolves with verified refund outcome.

---

### Scenario 3: Pending Payment Recheck
1. Switch to **Arjun Verma** (`arjun@example.com`).
2. Report issue for `TXN987656` (₹499.00).
3. Gateway returns `PENDING`.
4. AI does NOT create order or refund; schedules background recheck and informs customer.

---

### Scenario 4: Duplicate Webhook Notification Guard
1. From Demo Lab, trigger **Scenario 4 (Duplicate Notification)**.
2. System intercepts duplicate webhook; returns existing order without creating second order.
3. Event log documents `DUPLICATE_NOTIFICATION_RECEIVED`.

---

### Scenario 5: Refund Already Exists
1. Run **Scenario 5** from Demo Lab.
2. AI identifies existing refund in progress and tracks provider settlement rather than double-issuing payout.

---

### Scenario 6: Conflicting Records & Structured Human Handoff
1. Run **Scenario 6** from Demo Lab.
2. Mismatched currency / account IDs detected by `DeterministicBusinessRules`.
3. AI generates structured human handoff packet and assigns support specialist.

---

### Scenario 10: Autonomous Background Reconciliation
1. Click **⚡ Run Proactive Recon** in Demo Lab.
2. Background worker detects unlinked payments, creates cases, runs investigations, and notifies customers proactively.
