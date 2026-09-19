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
async def test_background_reconciliation():
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


@pytest.mark.asyncio
async def test_stuck_pending_payment_delayed_recheck_and_callback_resolution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login Arjun
        login_res = await ac.post("/auth/login", json={"email": "arjun@example.com", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Arjun creates case for pending payment TXN987656
        case_res = await ac.post(
            "/cases",
            headers=headers,
            json={
                "customer_request": "Payment made for mouse (TXN987656) but stuck on pending.",
                "payment_reference": "TXN987656"
            }
        )
        assert case_res.status_code == 201
        case_data = case_res.json()
        case_id = case_data["id"]
        assert case_data["status"] == "WAITING_FOR_PROVIDER"

        # 3. Simulate acquirer callback landing (transitions payment to SUCCESS and triggers auto recheck)
        callback_res = await ac.post(
            "/api/payments/TXN987656/callback",
            params={"new_status": "SUCCESS"}
        )
        assert callback_res.status_code == 200
        callback_data = callback_res.json()
        assert callback_data["new_status"] == "SUCCESS"
        assert callback_data["settlement_landed"] is True
        assert case_id in callback_data["rechecked_cases"]

        # 4. Check case status advanced to WAITING_FOR_CUSTOMER (Order recovery offered because stock is available)
        updated_case_res = await ac.get(f"/cases/{case_id}", headers=headers)
        assert updated_case_res.status_code == 200
        updated_case = updated_case_res.json()
        assert updated_case["status"] == "WAITING_FOR_CUSTOMER"
        assert updated_case["resolution_type"] == "ORDER_RECOVERY"

        # 5. Customer accepts recovery -> case RESOLVED
        confirm_res = await ac.post(
            f"/cases/{case_id}/customer-confirmation",
            headers=headers,
            json={"accepted": True, "notes": "Yes please recover my order"}
        )
        assert confirm_res.status_code == 200
        assert confirm_res.json()["status"] == "RESOLVED"


@pytest.mark.asyncio
async def test_idempotency_dedupe_data_table_and_double_submit_prevention():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login Rahul
        login_res = await ac.post("/auth/login", json={"email": "rahul@example.com", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. First submission
        res1 = await ac.post(
            "/cases",
            headers=headers,
            json={
                "customer_request": "Order missing for TXN987654",
                "payment_reference": "TXN987654"
            }
        )
        assert res1.status_code == 201
        case1_id = res1.json()["id"]

        # 3. Second submission with the exact same payment reference (must deduplicate, not mint new case)
        res2 = await ac.post(
            "/cases",
            headers=headers,
            json={
                "customer_request": "Submitting again: Order missing for TXN987654",
                "payment_reference": "TXN987654"
            }
        )
        assert res2.status_code == 201
        case2_id = res2.json()["id"]
        assert case1_id == case2_id, "Deduplication failed: Second submission minted a duplicate case!"

        # 4. Verify Idempotency Data Table query endpoint
        idem_table_res = await ac.get("/api/idempotency/records", params={"payment_reference": "TXN987654"})
        assert idem_table_res.status_code == 200
        idem_data = idem_table_res.json()
        assert idem_data["total_records"] >= 1
        assert idem_data["records"][0]["case_id"] == case1_id
        assert idem_data["records"][0]["payment_reference"] == "TXN987654"


@pytest.mark.asyncio
async def test_delayed_retry_loop_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/auth/login", json={"email": "arjun@example.com", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create pending case
        case_res = await ac.post(
            "/cases",
            headers=headers,
            json={"customer_request": "Checking pending TXN987656", "payment_reference": "TXN987656"}
        )
        case_id = case_res.json()["id"]

        # Execute retry loop with auto-landing callback
        retry_res = await ac.post(
            f"/api/cases/{case_id}/retry-loop",
            params={"max_retries": 3, "auto_land_callback": True}
        )
        assert retry_res.status_code == 200
        retry_data = retry_res.json()
        assert retry_data["resolved_automatically"] is True
        assert len(retry_data["retry_history"]) >= 2
        assert retry_data["final_status"] == "WAITING_FOR_CUSTOMER"

