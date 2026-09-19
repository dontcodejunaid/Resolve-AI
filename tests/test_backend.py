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
                "customer_request": "I paid ₹2499 for Heavyweight Boxy Hoodie via UPI (TXN987654) but order is not showing.",
                "payment_reference": "TXN987654",
                "product_id": "prod_hoodie_01"
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


@pytest.mark.asyncio
async def test_aura_inventory_and_store_manager():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login Store Manager
        mgr_login = await ac.post("/auth/login", json={"email": "manager@resolvestore.com", "password": "password123"})
        mgr_token = mgr_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {mgr_token}"}

        # 2. Get Store Info (Aura Studio)
        store_res = await ac.get("/merchant/store", headers=headers)
        assert store_res.status_code == 200
        store_data = store_res.json()
        assert "AURA" in store_data["name"].upper()
        assert store_data["store_url"] == "https://aura-nine-virid.vercel.app/"

        # 3. Get Products (Must contain all 6 Aura products)
        prod_res = await ac.get("/merchant/products", headers=headers)
        assert prod_res.status_code == 200
        products = prod_res.json()
        
        prod_names = [p["name"] for p in products]
        assert "Heavyweight Boxy Hoodie" in prod_names
        assert "Relaxed Linen Overshirt" in prod_names
        assert "Tailored Pleated Trousers" in prod_names
        assert "Sand Vintage Boxy Tee" in prod_names
        assert "Indigo Worker Denim Jacket" in prod_names
        assert "Matte Black Crossbody Tote" in prod_names

        # Check Hoodie price & image
        hoodie = [p for p in products if p["name"] == "Heavyweight Boxy Hoodie"][0]
        assert float(hoodie["price"]) == 2499.00
        assert hoodie["category"] == "outerwear"
        assert hoodie["sku"] == "AURA-HD-001"
        assert hoodie["image_url"] == "/assets/images/hoodie.jpg"


@pytest.mark.asyncio
async def test_aura_live_checkout_transaction_matching():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Customer Login
        rahul_login = await ac.post("/auth/login", json={"email": "rahul@example.com", "password": "password123"})
        rahul_token = rahul_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {rahul_token}"}

        # Customer tests with a freshly generated Aura transaction ID
        aura_txn = "TXN_7829104_INR"
        case_res = await ac.post(
            "/cases",
            headers=headers,
            json={
                "customer_request": f"My payment of ₹2499 for Heavyweight Boxy Hoodie with {aura_txn} timed out on Aura checkout.",
                "payment_reference": aura_txn,
                "product_id": "prod_hoodie_01",
                "screenshot_url": "https://aura-nine-virid.vercel.app/screenshot.png"
            }
        )
        assert case_res.status_code == 201
        case_data = case_res.json()
        assert case_data["payment_id"] is not None
        assert case_data["status"] == "WAITING_FOR_CUSTOMER"

        # Customer confirms recovery
        confirm_res = await ac.post(
            f"/cases/{case_data['id']}/customer-confirmation",
            headers=headers,
            json={"accepted": True, "notes": "Recover order for Heavyweight Boxy Hoodie"}
        )
        assert confirm_res.status_code == 200
        resolved_case = confirm_res.json()
        assert resolved_case["status"] == "RESOLVED"
        assert resolved_case["resolution_type"] == "ORDER_RECOVERY"

