import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/demo/reset")


@pytest.mark.asyncio
async def test_scenario_3_pending_payment():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/auth/login", json={"email": "arjun@example.com", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        case_res = await ac.post(
            "/cases",
            headers=headers,
            json={
                "customer_request": "I made a payment for Wireless Mouse (TXN987656), has it gone through?",
                "payment_reference": "TXN987656"
            }
        )
        assert case_res.status_code == 201
        case_data = case_res.json()
        assert case_data["status"] == "WAITING_FOR_PROVIDER"
        assert case_data["resolution_type"] == "PAYMENT_PENDING_SCHEDULED"
        assert "PENDING" in case_data["ai_summary"]


@pytest.mark.asyncio
async def test_scenario_4_duplicate_notification_idempotency():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/demo/scenario/run", json={"scenario_id": "SCENARIO_4_DUPLICATE"})
        assert res.status_code == 200
        data = res.json()
        case = data["case"]
        assert case["status"] == "RESOLVED"
        # Check duplicate notification event exists
        event_types = [e["event_type"] for e in case["events"]]
        assert "DUPLICATE_NOTIFICATION_RECEIVED" in event_types


@pytest.mark.asyncio
async def test_scenario_5_refund_already_exists():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/demo/scenario/run", json={"scenario_id": "SCENARIO_5_REFUND_EXISTS"})
        assert res.status_code == 200
        case = res.json()["case"]
        assert case["status"] == "WAITING_FOR_PROVIDER"
        assert case["resolution_type"] == "EXISTING_REFUND_TRACKED"


@pytest.mark.asyncio
async def test_scenario_6_conflict_escalation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/demo/scenario/run", json={"scenario_id": "SCENARIO_6_CONFLICT"})
        assert res.status_code == 200
        case = res.json()["case"]
        assert case["status"] == "ESCALATED"
        assert case["resolution_type"] == "MANUAL_ESCALATION"


@pytest.mark.asyncio
async def test_scenario_10_background_reconciliation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        recon_res = await ac.post("/demo/reconcile-now")
        assert recon_res.status_code == 200
        # Reconciles orphan payments
        assert "reconciled_cases" in recon_res.json()


@pytest.mark.asyncio
async def test_merchant_policies_and_product_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login Merchant
        login_res = await ac.post("/auth/login", json={"email": "manager@resolvestore.com", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Update policy
        pol_res = await ac.put(
            "/merchant/policies",
            headers=headers,
            json={"refund_approval_threshold": 750.00, "recon_delay_seconds": 45}
        )
        assert pol_res.status_code == 200
        assert float(pol_res.json()["refund_approval_threshold"]) == 750.00

        # 2. Get Products
        prod_res = await ac.get("/merchant/products", headers=headers)
        assert prod_res.status_code == 200
        products = prod_res.json()
        assert len(products) >= 3

        # 3. Update stock for keyboard
        keyboard = [p for p in products if p["name"] == "Mechanical Keyboard"][0]
        update_res = await ac.put(
            f"/merchant/products/{keyboard['id']}",
            headers=headers,
            json={
                "name": keyboard["name"],
                "price": float(keyboard["price"]),
                "currency": keyboard["currency"],
                "stock": 15,
                "is_active": True
            }
        )
        assert update_res.status_code == 200
        assert update_res.json()["stock"] == 15
