import asyncio
import json
from decimal import Decimal
from sqlalchemy.future import select
from backend.app.database import AsyncSessionLocal, init_db
from backend.app.security.auth import get_password_hash
from backend.app.models import (
    User,
    Merchant,
    Product,
    MerchantPolicy,
    CheckoutAttempt,
    Payment,
    Order,
    Refund,
    Case,
    CaseEvent,
    Action,
    Approval,
    Notification,
)


async def seed_database():
    """Seed initial demo data for Resolve AI."""
    await init_db()

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(User).filter(User.id == "usr_rahul"))
        if result.scalars().first():
            print("Database already seeded. Skipping initial seeding.")
            return

        default_pwd_hash = get_password_hash("password123")

        # 1. Users
        users = [
            User(id="usr_rahul", email="rahul@example.com", password_hash=default_pwd_hash, full_name="Rahul Sharma", role="customer"),
            User(id="usr_aisha", email="aisha@example.com", password_hash=default_pwd_hash, full_name="Aisha Khan", role="customer"),
            User(id="usr_arjun", email="arjun@example.com", password_hash=default_pwd_hash, full_name="Arjun Verma", role="customer"),
            User(id="usr_agent", email="agent@resolveai.com", password_hash=default_pwd_hash, full_name="Dev Support Specialist", role="employee"),
            User(id="usr_manager", email="manager@resolvestore.com", password_hash=default_pwd_hash, full_name="Priya Patel (Store Manager)", role="merchant"),
            User(id="usr_bank", email="bank@gateway.com", password_hash=default_pwd_hash, full_name="Bank Provider Sentinel", role="employee"),
        ]
        session.add_all(users)

        # 2. Merchant
        merchant = Merchant(
            id="mer_resolve_store",
            name="Resolve Store",
            email="contact@resolvestore.com",
            api_key="mkey_live_resolve_store_99812"
        )
        session.add(merchant)

        # 3. Products
        products = [
            Product(id="prod_headset", merchant_id="mer_resolve_store", name="Wireless Headset", description="High-fidelity Bluetooth wireless headset with active noise cancellation", price=Decimal("799.00"), currency="INR", stock=10, is_active=True),
            Product(id="prod_keyboard", merchant_id="mer_resolve_store", name="Mechanical Keyboard", description="RGB Tenkeyless mechanical gaming keyboard with tactile brown switches", price=Decimal("1499.00"), currency="INR", stock=0, is_active=True),
            Product(id="prod_mouse", merchant_id="mer_resolve_store", name="Wireless Mouse", description="Ergonomic dual-mode optical wireless mouse with silent clicks", price=Decimal("499.00"), currency="INR", stock=20, is_active=True),
        ]
        session.add_all(products)

        # 4. Merchant Policy
        policy = MerchantPolicy(
            id="pol_resolve_store",
            merchant_id="mer_resolve_store",
            order_recovery_enabled=True,
            refund_enabled=True,
            refund_approval_required=True,
            refund_approval_threshold=Decimal("500.00"),
            auto_retry_limit=3,
            recon_delay_seconds=30,
            policy_text="Standard Resolve Store policy: Orders can be recovered immediately if stock is available and payment is confirmed. Refunds over ₹500 require manager approval. Recoveries must maintain idempotency and link the original payment."
        )
        session.add(policy)

        # 5. Checkout Attempts
        checkouts = [
            CheckoutAttempt(
                id="chk_rahul_01",
                checkout_reference="CHK-RS-77210",
                customer_id="usr_rahul",
                merchant_id="mer_resolve_store",
                product_id="prod_headset",
                quantity=1,
                amount=Decimal("799.00"),
                currency="INR",
                status="COMPLETED",
                metadata_json=json.dumps({"item": "Wireless Headset", "color": "Midnight Black"})
            ),
            CheckoutAttempt(
                id="chk_aisha_01",
                checkout_reference="CHK-RS-77211",
                customer_id="usr_aisha",
                merchant_id="mer_resolve_store",
                product_id="prod_keyboard",
                quantity=1,
                amount=Decimal("1499.00"),
                currency="INR",
                status="COMPLETED",
                metadata_json=json.dumps({"item": "Mechanical Keyboard", "layout": "US ANSI"})
            ),
            CheckoutAttempt(
                id="chk_arjun_01",
                checkout_reference="CHK-RS-77212",
                customer_id="usr_arjun",
                merchant_id="mer_resolve_store",
                product_id="prod_mouse",
                quantity=1,
                amount=Decimal("499.00"),
                currency="INR",
                status="INITIATED",
                metadata_json=json.dumps({"item": "Wireless Mouse", "color": "Slate Grey"})
            )
        ]
        session.add_all(checkouts)

        # 6. Payments
        payments = [
            Payment(
                id="pay_rahul_01",
                payment_reference="TXN987654",
                checkout_id="chk_rahul_01",
                customer_id="usr_rahul",
                merchant_id="mer_resolve_store",
                amount=Decimal("799.00"),
                currency="INR",
                status="SUCCESS",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "SIM-TXN-987654", "auth_code": "AUTH_9921", "method": "UPI", "vpa": "rahul@oksbi"})
            ),
            Payment(
                id="pay_aisha_01",
                payment_reference="TXN987655",
                checkout_id="chk_aisha_01",
                customer_id="usr_aisha",
                merchant_id="mer_resolve_store",
                amount=Decimal("1499.00"),
                currency="INR",
                status="SUCCESS",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "SIM-TXN-987655", "auth_code": "AUTH_9922", "method": "CARD", "last4": "4242"})
            ),
            Payment(
                id="pay_arjun_01",
                payment_reference="TXN987656",
                checkout_id="chk_arjun_01",
                customer_id="usr_arjun",
                merchant_id="mer_resolve_store",
                amount=Decimal("499.00"),
                currency="INR",
                status="PENDING",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "SIM-TXN-987656", "auth_code": "AUTH_9923", "method": "NETBANKING", "bank": "HDFC"})
            )
        ]
        session.add_all(payments)

        await session.commit()
        print("Database seeded successfully with users, products, policies, checkouts, and payments!")
        
        # Sync directly to MongoDB Atlas
        try:
            from backend.app.mongodb import sync_entire_db_to_mongo
            await sync_entire_db_to_mongo(session)
        except Exception as e:
            print(f"[MongoDB Atlas Seeder Sync Warning] {e}")


if __name__ == "__main__":
    asyncio.run(seed_database())
