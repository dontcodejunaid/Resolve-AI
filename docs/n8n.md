# RESOLVE AI — n8n Orchestration Architecture

## Overview
**n8n Cloud** acts as the workflow and autonomous agent orchestration layer for RESOLVE AI. It decouples high-level reasoning and multi-system tool execution from backend database authority.

---

## Workflows Included

### 1. Customer Case Investigation (`n8n/customer-case.json`)
```
Webhook Trigger
      │
      ▼
Fetch Case & Telemetry from FastAPI (/internal/cases/{id})
      │
      ▼
Query Policy Context from Cognee Cloud (/api/v1/search)
      │
      ▼
LangChain AI Agent (Synthesizes Evidence & Formulates Proposal)
      │
      ▼
Format Proposal Payload & Return to FastAPI Backend
```

### 2. Background Reconciliation (`n8n/reconciliation.json`)
- **Trigger**: 1-minute schedule trigger
- **Action**: Calls `POST /demo/reconcile-now` to find orphan payments and proactively open cases without customer initiation.

### 3. Refund Monitor (`n8n/refund-monitor.json`)
- **Trigger**: 1-minute schedule trigger
- **Action**: Polls simulated banking gateway via `POST /demo/monitor-refunds-now` to settle pending refunds and resolve cases.

### 4. Human Approval Dispatch (`n8n/approval.json`)
- **Trigger**: Webhook triggered when high-value refund is proposed
- **Action**: Dispatches approval item to employee/manager queue and notifies approver.

---

## Configuration
Set the following environment variables in `.env`:
```env
N8N_BASE_URL=https://your-instance.app.n8n.cloud
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_SECRET=your_secret
INTERNAL_API_KEY=resolve_ai_internal_secure_token_change_in_production
```
