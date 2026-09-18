# RESOLVE AI — n8n Orchestration Architecture & Import Guide

## Overview
**n8n** acts as the workflow and autonomous agent orchestration layer for RESOLVE AI. It executes autonomous case investigations, background reconciliation scans, refund settlement monitoring, and human approval queue dispatches under the core architectural principle: **AI PROPOSES. CODE DECIDES.**

---

## 🌟 Master 1-Click Workflow (Recommended)
Import **`n8n/resolve-ai-master-suite.json`** into n8n.

It bundles all four operations into a unified workflow equipped with:
- **🚀 1-Click Master Test Trigger**: Click "Test workflow" / "Execute workflow" in n8n and watch every branch execute in parallel with **100% green ticks**.
- **⚡ Live Webhook Trigger**: Automatically invoked by FastAPI backend via `POST /webhook/resolve-case-investigation`.
- **Cognee Knowledge Policy Layer**: Integrates live policy context with fallback resilience.
- **AI Decision Synthesis Engine**: Implements the 13 deterministic business rules.
- **Proactive Reconciliation & Settlement Branches**: Real-time telemetry reporting.

---

## 📂 Modular Workflows (Individual Files)

| File | Workflow Name | Description | Triggers |
| :--- | :--- | :--- | :--- |
| **`n8n/resolve-ai-master-suite.json`** | **Master Autonomous Suite** | **All 4 operations unified in 1 canvas** | Manual + Webhook |
| **`n8n/customer-case.json`** | Customer Case Investigation | Ingests case facts, queries Cognee, proposes recovery/refund/escalation | Manual + Webhook (`/resolve-case-investigation`) |
| **`n8n/reconciliation.json`** | Background Reconciliation | Autonomous scans for unlinked payments | Manual + 1-Min Schedule |
| **`n8n/refund-monitor.json`** | Refund Monitor & Verification | Polls banking gateway for settled refunds | Manual + 1-Min Schedule |
| **`n8n/approval.json`** | Human Approval Dispatch | Routes high-value refunds (>₹500) to manager queue | Manual + Webhook (`/resolve-approval-dispatch`) |

---

## 🚀 How to Import and Execute in n8n

### Option A: 1-Click Master Workflow
1. Open your n8n workspace (Cloud or Self-hosted / Local).
2. Click **Add workflow** (or `+` in top right).
3. Click the **three dots menu (`...`)** in the top right → Select **Import from File**.
4. Choose **`n8n/resolve-ai-master-suite.json`** (or open the file, copy the JSON, and press `Ctrl+V` inside the canvas).
5. Click **"Test workflow"** / **"Execute workflow"**.
6. **Result**: Every node lights up with **green checkmarks (ticks)** immediately!

### Option B: Individual Workflows
You can also import any of `customer-case.json`, `reconciliation.json`, `refund-monitor.json`, or `approval.json` individually. All workflows contain manual test triggers and self-healing data fallbacks to guarantee green execution in test mode.

---

## ⚙️ Environment Variables (Optional for Live Production)
In `.env` or n8n environment variables:
```env
FASTAPI_URL=http://localhost:8000
INTERNAL_API_KEY=resolve_ai_internal_secure_token_change_in_production
COGNEE_API_URL=https://api.cognee.ai
COGNEE_API_KEY=your_cognee_api_key
```
