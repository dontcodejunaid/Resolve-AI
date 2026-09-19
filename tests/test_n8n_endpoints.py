import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import init_db
from backend.app.database_seeder import seed_database


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()
    await seed_database()


@pytest.mark.asyncio
async def test_webhook_resolve_case():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/webhook/resolve-case", json={
            "case_id": "RS-TEST-001",
            "customer_id": "usr_rahul",
            "message": "I paid ₹2499 for Heavyweight Boxy Hoodie on Aura Studio but my order is not showing",
            "payment_reference": "TXN_4829103_INR",
            "merchant_id": "mer_resolve_store"
        })
        assert res.status_code == 200
        data = res.json()
        assert "case_id" in data
        assert data["n8n_trigger_status"] == "READY_FOR_INVESTIGATION"


@pytest.mark.asyncio
async def test_payment_and_settlement_lookup():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Setup demo scenario
        demo_res = await client.post("/api/demo/scenario/payment-success-order-missing")
        assert demo_res.status_code == 200
        demo_data = demo_res.json()
        payment_ref = demo_data["payment_reference"]

        # 1. Get payment
        pay_res = await client.get(f"/api/payments/{payment_ref}")
        assert pay_res.status_code == 200
        pay_data = pay_res.json()
        assert pay_data["amount"] == 2499.00
        assert pay_data["status"] == "SUCCESS"
        assert pay_data["merchant_received"] is True

        # 2. Get settlement
        set_res = await client.get(f"/api/payments/{payment_ref}/settlement")
        assert set_res.status_code == 200
        assert set_res.json()["settlement_status"] == "MERCHANT_RECEIVED"


@pytest.mark.asyncio
async def test_product_availability():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/products/prod_hoodie_01/availability")
        assert res.status_code == 200
        data = res.json()
        assert data["product_id"] == "prod_hoodie_01"
        assert data["available"] is True
        assert data["quantity"] >= 0


@pytest.mark.asyncio
async def test_order_recovery_and_idempotency():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Setup scenario
        demo_res = await client.post("/api/demo/scenario/payment-success-order-missing")
        demo_data = demo_res.json()
        case_id = demo_data["case_id"]
        payment_ref = demo_data["payment_reference"]
        idempotency_key = f"{case_id}_ORDER_RECOVERY_TEST"

        # 1. First execution
        rec_res = await client.post("/api/orders/recover", json={
            "case_id": case_id,
            "payment_reference": payment_ref,
            "idempotency_key": idempotency_key
        })
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert rec_data["status"] == "SUCCESS"
        assert rec_data["verified"] is True
        order_id = rec_data["order_id"]

        # 2. Verify order lookup
        ord_res = await client.get(f"/api/orders/{order_id}")
        assert ord_res.status_code == 200
        assert ord_res.json()["amount"] == 2499.00

        # 3. Second execution with same idempotency key (must NOT duplicate)
        rec_res_2 = await client.post("/api/orders/recover", json={
            "case_id": case_id,
            "payment_reference": payment_ref,
            "idempotency_key": idempotency_key
        })
        assert rec_res_2.status_code == 200
        assert rec_res_2.json()["status"] == "ALREADY_PROCESSED"


@pytest.mark.asyncio
async def test_refund_creation_and_approval_threshold():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Setup out-of-stock scenario (₹2999 >= ₹500 threshold)
        demo_res = await client.post("/api/demo/scenario/product-unavailable")
        demo_data = demo_res.json()
        case_id = demo_data["case_id"]
        payment_ref = demo_data["payment_reference"]
        idempotency_key = f"{case_id}_REFUND_TEST"

        # 1. Execute refund
        ref_res = await client.post("/api/refunds", json={
            "case_id": case_id,
            "payment_reference": payment_ref,
            "amount": 2999.00,
            "reason": "Out of stock test",
            "idempotency_key": idempotency_key
        })
        assert ref_res.status_code == 200
        data = ref_res.json()
        # Exceeds ₹500 threshold -> requires manager approval
        assert data["status"] == "WAITING_FOR_APPROVAL"
        assert data["requires_approval"] is True


@pytest.mark.asyncio
async def test_activity_stream_and_escalation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Setup case
        case_res = await client.post("/webhook/resolve-case", json={
            "customer_id": "usr_rahul",
            "message": "Payment conflict test",
            "payment_reference": "TXN_CONFLICT_999_INR"
        })
        case_id = case_res.json()["case_id"]

        # 2. Post AI worker activity
        act_res = await client.post(f"/api/cases/{case_id}/activity", json={
            "case_id": case_id,
            "agent": "PAYMENT_AGENT",
            "activity": "VERIFYING_PAYMENT",
            "message": "Checking payment provider status...",
            "status": "RUNNING"
        })
        assert act_res.status_code == 200
        assert act_res.json()["agent"] == "PAYMENT_AGENT"

        # 3. Post escalation
        esc_res = await client.post(f"/api/cases/{case_id}/escalate", json={
            "case_id": case_id,
            "customer_request": "Payment conflict test",
            "verified_facts": ["Payment SUCCESS ₹2499"],
            "uncertainties": ["Order missing in ERP"],
            "actions_attempted": ["GET /api/payments/TXN_CONFLICT_999_INR"],
            "decision_required": "Confirm manual refund vs replacement",
            "reason_for_escalation": "Complex discrepancy"
        })
        assert esc_res.status_code == 200
        assert esc_res.json()["case_status"] == "HUMAN_REVIEW"


@pytest.mark.asyncio
async def test_vision_screenshot_analysis_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/cases/analyze-screenshot", json={
            "screenshot_url": "https://aura-nine-virid.vercel.app/receipt_hoodie_TXN_4829103_INR.png",
            "customer_request": "Paid for Boxy Hoodie"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "SUCCESS"
        assert data["product_id"] == "prod_hoodie_01"
        assert data["amount"] == 2499.00
        assert data["payment_reference"] == "TXN_4829103_INR"
        assert data["store_name"] == "AURA STUDIO"
        assert "Heavyweight Boxy Hoodie" in data["customer_request"]
