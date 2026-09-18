# RESOLVE AI — Cognee Knowledge & Memory Layer

## Role of Cognee
**Cognee Cloud** functions as the semantic policy and procedural memory layer for RESOLVE AI. It supplies store policies, past case precedents, and refund rules to the AI agent during investigation.

> **CRITICAL SEPARATION**: Cognee is NOT the transaction database. PostgreSQL remains the sole source of truth for payment status, order state, refund status, inventory, and case records.

---

## Stored Knowledge Domains

1. **Order Recovery Policy**:
   - Recovery rules for verified payments with missing orders.
   - Idempotency and stock requirements.

2. **Refund Authorization Policy**:
   - Out-of-stock compensation procedures.
   - ₹500.00 manager approval thresholds.

3. **Pending Payment Rules**:
   - Prohibition against creating orders or issuing refunds on unconfirmed transactions.
   - Background recheck scheduling.

4. **Conflicting Records & Human Handoff**:
   - Escalation protocols when transaction amounts, currencies, or accounts conflict.

5. **Past Resolved Precedents**:
   - Historical cases demonstrating duplicate webhook interception and resolution patterns.

---

## Configuration
Configure Cognee in `.env`:
```env
COGNEE_API_URL=https://api.cognee.ai
COGNEE_API_KEY=your_cognee_api_key
```
*(When no key is present, RESOLVE AI uses its high-performance local semantic knowledge store).*
