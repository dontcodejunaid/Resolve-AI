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
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "HEALTHY"


@pytest.mark.asyncio
async def test_login_and_auth():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Rahul Login
        res = await ac.post("/auth/login", json={"email": "rahul@example.com", "password": "password123"})
        assert res.status_code == 200
        token_data = res.json()
        assert "access_token" in token_data
        token = token_data["access_token"]

        # Test /auth/me
        me_res = await ac.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "rahul@example.com"


@pytest.mark.asyncio
async def test_scenario_1_order_recovery_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login Rahul
        login_res = await ac.post("/auth/login", json={"email": "rahul@example.com", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Rahul reports missing order
        case_res = await ac.post(
            "/cases",
            headers=headers,
            json={
                "customer_request": "I paid ₹799 for Wireless Headset via UPI (TXN987654) but order is not showing.",
                "payment_reference": "TXN987654"
            }
        )
        assert case_res.status_code == 201
        case_data = case_res.json()
        case_id = case_data["id"]
        assert case_data["status"] == "WAITING_FOR_CUSTOMER"
        assert len(case_data["events"]) >= 5

        # 3. Customer confirms order recovery
        confirm_res = await ac.post(
            f"/cases/{case_id}/customer-confirmation",
            headers=headers,
            json={"accepted": True, "notes": "Please recover my order"}
        )
        assert confirm_res.status_code == 200
        resolved_case = confirm_res.json()
        assert resolved_case["status"] == "RESOLVED"
        assert resolved_case["resolution_type"] == "ORDER_RECOVERY"
        assert resolved_case["order_id"] is not None


@pytest.mark.asyncio
async def test_scenario_2_refund_approval_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login Aisha
        aisha_login = await ac.post("/auth/login", json={"email": "aisha@example.com", "password": "password123"})
        aisha_token = aisha_login.json()["access_token"]

        # 2. Aisha reports issue for out of stock keyboard (₹1499)
        case_res = await ac.post(
            "/cases",
            headers={"Authorization": f"Bearer {aisha_token}"},
            json={
                "customer_request": "Paid for Mechanical Keyboard (TXN987655) but order is missing.",
                "payment_reference": "TXN987655"
            }
        )
        assert case_res.status_code == 201
        case_data = case_res.json()
        case_id = case_data["id"]
        assert case_data["status"] == "WAITING_FOR_APPROVAL"

        # 3. Login Store Manager
        mgr_login = await ac.post("/auth/login", json={"email": "manager@resolvestore.com", "password": "password123"})
        mgr_token = mgr_login.json()["access_token"]
        mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

        # 4. Manager checks approvals
        appr_res = await ac.get("/employee/approvals", headers=mgr_headers)
        assert appr_res.status_code == 200
        approvals = appr_res.json()
        assert len(approvals) >= 1
        approval_id = approvals[0]["id"]

        # 5. Manager approves refund
        approve_res = await ac.post(
            f"/employee/approvals/{approval_id}/approve",
            headers=mgr_headers,
            json={"approved": True, "decision_notes": "Stock unavailable, refund approved per policy."}
        )
        assert approve_res.status_code == 200

        # 6. Verify case transitioned to WAITING_FOR_PROVIDER with pending refund
        case_check = await ac.get(f"/cases/{case_id}", headers={"Authorization": f"Bearer {aisha_token}"})
        assert case_check.status_code == 200
        assert case_check.json()["status"] == "WAITING_FOR_PROVIDER"
        assert case_check.json()["refund_id"] is not None


@pytest.mark.asyncio
async def test_customer_isolation_security():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Rahul creates a case
        rahul_login = await ac.post("/auth/login", json={"email": "rahul@example.com", "password": "password123"})
        rahul_token = rahul_login.json()["access_token"]

        case_res = await ac.post(
            "/cases",
            headers={"Authorization": f"Bearer {rahul_token}"},
            json={"customer_request": "Private transaction issue", "payment_reference": "TXN987654"}
        )
        case_id = case_res.json()["id"]

        # Aisha tries to access Rahul's case -> MUST BE 403 Forbidden
        aisha_login = await ac.post("/auth/login", json={"email": "aisha@example.com", "password": "password123"})
        aisha_token = aisha_login.json()["access_token"]

        forbidden_res = await ac.get(f"/cases/{case_id}", headers={"Authorization": f"Bearer {aisha_token}"})
        assert forbidden_res.status_code == 403
