# RESOLVE AI — Autonomous AI Customer-Service Teammate

> **"One teammate. One case. A verified outcome."**

RESOLVE AI is an accountable, full-stack autonomous customer service teammate that takes full ownership of payment, checkout, and order mismatch problems from the initial customer complaint until there is an independently verified resolution.

---

## ⚡ Core Architectural Principle
### **AI PROPOSES. CODE DECIDES.**
The LLM handles natural language understanding, cross-system tool proposal, policy synthesis, and customer-facing explanations.  
The FastAPI backend and PostgreSQL database remain strictly authoritative for authentication, authorization, customer ownership, financial validation, idempotency, state transitions, and post-action verification.

---

## 🚀 Key Features

- **Autonomous Cross-System Investigation**: Automatically investigates banking gateways, checkout sessions, inventory stocks, and refund records.
- **13 Deterministic Business Rules**: Strict code-level enforcement preventing duplicate orders, double refunds, unauthorized access, or currency mismatches.
- **Human-in-the-Loop Approvals**: High-value actions (e.g. refunds $\ge$ ₹500) automatically create approval tasks for human managers.
- **Proactive Background Reconciliation**: Background workers monitor orphan payments and resolve issues even after the customer disconnects.
- **Visual Immutable Timeline**: Database-backed event and action audit log showing every step taken by AI, System, Provider, Customer, and Employee.
- **Interactive Demo Control Lab**: 1-click execution for all 10 hackathon demo scenarios with live telemetry.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, React Router, Axios
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 Async, Pydantic V2, PyJWT, Passlib/Bcrypt
- **Database**: PostgreSQL (with SQLite fallback for zero-config local run)
- **AI Orchestration**: n8n Cloud (with native local fallback agent)
- **Knowledge / Memory Layer**: Cognee Cloud (with local indexed knowledge store)
- **Simulated Environment**: Built-in banking gateway, merchant, and refund simulators

---

## 📦 Quick Start & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```bash
# Clone & Navigate
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seeder (Optional, automatically runs on startup)
python -m backend.app.database_seeder

# Start FastAPI server on port 8000
uvicorn backend.app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing
Run the automated test suite covering authentication, deterministic rules, recovery flows, refund approvals, customer isolation, and demo scenarios:
```bash
python -m pytest -v tests/
```

---

## 👥 Demo Credentials (All passwords: `password123`)

| Role | User | Email | Key Scenario |
| :--- | :--- | :--- | :--- |
| **Customer 1** | Rahul Sharma | `rahul@example.com` | Scenario 1: Main Order Recovery (Headset ₹799) |
| **Customer 2** | Aisha Khan | `aisha@example.com` | Scenario 2: Out-of-Stock Refund & Approval (Keyboard ₹1499) |
| **Customer 3** | Arjun Verma | `arjun@example.com` | Scenario 3: Pending Payment Recheck (Mouse ₹499) |
| **Support Agent** | Dev Specialist | `agent@resolveai.com` | Telemetry inspection & human handoff |
| **Store Manager** | Priya Patel | `manager@resolvestore.com` | Policy configuration & refund approvals |

---

## 📚 Project Structure

```
resolve-ai/
├── backend/
│   ├── app/
│   │   ├── models/        # 13 SQLAlchemy models (User, Payment, Order, Case, Event, etc.)
│   │   ├── routes/        # API endpoints (auth, cases, orders, employee, merchant, demo, internal)
│   │   ├── rules/         # Deterministic business rules & state machine
│   │   ├── schemas/       # Pydantic request/response models
│   │   ├── security/      # JWT, RBAC & internal auth
│   │   ├── services/      # CaseEngine, AIOrchestrator, CogneeClient, Simulators, Worker
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Timeline, InvestigationSteps, EvidenceCard, TelemetryLog
│   │   ├── pages/         # CustomerDashboard, NewCase, CaseDetail, Employee, Merchant, DemoLab
│   │   ├── auth/          # AuthContext & role switching
│   │   ├── api/           # Axios client
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── database/
│   ├── schema.sql         # PostgreSQL DDL
│   └── seed.sql           # Demo seed data
├── n8n/                   # n8n workflow definitions (case, recon, refund, approval)
├── docs/                  # Architecture, Demo guide, n8n, Cognee
└── tests/                 # Pytest test suite (11 unit & scenario tests)
```

---

## 🔒 Security & Idempotency
- **No Direct DB Access for AI**: All operations execute through authoritative backend routes.
- **Role-Based Access Control**: Strict customer tenancy isolation; customers cannot access other customers' records.
- **Idempotency Keys**: Sensitive recovery and refund requests are keyed (`RECOVERY-{case}-{payment}`); duplicate webhooks or retries cannot double-charge, duplicate orders, or double-refund.
