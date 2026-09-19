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
            name="AURA STUDIO (Luxury Apparel)",
            email="manager@aurastudio.in",
            store_url="https://aura-nine-virid.vercel.app/",
            api_key="mkey_live_aura_studio_99812"
        )
        session.add(merchant)

        # 3. Products (AURA Luxury Apparel Catalog + Legacy IDs)
        products = [
            Product(
                id="prod_hoodie_01",
                merchant_id="mer_resolve_store",
                name="Heavyweight Boxy Hoodie",
                category="outerwear",
                sku="AURA-HD-001",
                description="500 GSM French Terry cotton with structured dropped shoulders and minimal seamless pocket.",
                image_url="/assets/images/hoodie.jpg",
                price=Decimal("2499.00"),
                currency="INR",
                stock=12,
                is_active=True
            ),
            Product(
                id="prod_shirt_02",
                merchant_id="mer_resolve_store",
                name="Relaxed Linen Overshirt",
                category="tops",
                sku="AURA-SH-002",
                description="Breathable olive flax linen garment-dyed for a soft natural drape. Dual chest utility pockets.",
                image_url="/assets/images/linen_overshirt.jpg",
                price=Decimal("1899.00"),
                currency="INR",
                stock=8,
                is_active=True
            ),
            Product(
                id="prod_pants_03",
                merchant_id="mer_resolve_store",
                name="Tailored Pleated Trousers",
                category="bottoms",
                sku="AURA-TR-003",
                description="Charcoal wool blend with double forward pleats, tapered ankle cut, and hidden waist adjuster.",
                image_url="/assets/images/trousers.jpg",
                price=Decimal("2999.00"),
                currency="INR",
                stock=0,  # Zero stock for testing out-of-stock refund flow
                is_active=True
            ),
            Product(
                id="prod_tee_04",
                merchant_id="mer_resolve_store",
                name="Sand Vintage Boxy Tee",
                category="tops",
                sku="AURA-TE-004",
                description="280 GSM combed organic cotton with reinforced rib collar and relaxed drape.",
                image_url="/assets/images/boxy_tee.jpg",
                price=Decimal("1299.00"),
                currency="INR",
                stock=15,
                is_active=True
            ),
            Product(
                id="prod_denim_05",
                merchant_id="mer_resolve_store",
                name="Indigo Worker Denim Jacket",
                category="outerwear",
                sku="AURA-DJ-005",
                description="14oz selvedge denim treated with vintage wash. Triple stitched reinforced construction.",
                image_url="/assets/images/denim_jacket.jpg",
                price=Decimal("3499.00"),
                currency="INR",
                stock=6,
                is_active=True
            ),
            Product(
                id="prod_tote_06",
                merchant_id="mer_resolve_store",
                name="Matte Black Crossbody Tote",
                category="accessories",
                sku="AURA-TT-006",
                description="Heavy duty duck canvas with matte black metal hardware and modular utility strap.",
                image_url="/assets/images/canvas_tote.jpg",
                price=Decimal("1599.00"),
                currency="INR",
                stock=20,
                is_active=True
            ),
            # Legacy items for compatibility
            Product(id="prod_headset", merchant_id="mer_resolve_store", name="Wireless Headset", category="accessories", sku="AURA-ACC-001", description="High-fidelity Bluetooth wireless headset with active noise cancellation", image_url="/assets/images/hoodie.jpg", price=Decimal("799.00"), currency="INR", stock=10, is_active=True),
            Product(id="prod_keyboard", merchant_id="mer_resolve_store", name="Mechanical Keyboard", category="accessories", sku="AURA-ACC-002", description="RGB Tenkeyless mechanical gaming keyboard with tactile brown switches", image_url="/assets/images/trousers.jpg", price=Decimal("1499.00"), currency="INR", stock=0, is_active=True),
            Product(id="prod_mouse", merchant_id="mer_resolve_store", name="Wireless Mouse", category="accessories", sku="AURA-ACC-003", description="Ergonomic dual-mode optical wireless mouse with silent clicks", image_url="/assets/images/boxy_tee.jpg", price=Decimal("499.00"), currency="INR", stock=20, is_active=True),
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
            policy_text="Standard Aura Studio policy: Orders can be recovered immediately if stock is available and payment is confirmed. Refunds over ₹500 require Store Manager approval. Recoveries must maintain idempotency and link the original payment."
        )
        session.add(policy)

        # 5. Checkout Attempts (Aura Studio)
        checkouts = [
            CheckoutAttempt(
                id="chk_rahul_01",
                checkout_reference="CHK-AURA-801",
                customer_id="usr_rahul",
                merchant_id="mer_resolve_store",
                product_id="prod_hoodie_01",
                quantity=1,
                amount=Decimal("2499.00"),
                currency="INR",
                status="COMPLETED",
                metadata_json=json.dumps({"item": "Heavyweight Boxy Hoodie", "size": "M", "source": "https://aura-nine-virid.vercel.app/"})
            ),
            CheckoutAttempt(
                id="chk_aisha_01",
                checkout_reference="CHK-AURA-802",
                customer_id="usr_aisha",
                merchant_id="mer_resolve_store",
                product_id="prod_pants_03",
                quantity=1,
                amount=Decimal("2999.00"),
                currency="INR",
                status="COMPLETED",
                metadata_json=json.dumps({"item": "Tailored Pleated Trousers", "size": "32", "source": "https://aura-nine-virid.vercel.app/"})
            ),
            CheckoutAttempt(
                id="chk_arjun_01",
                checkout_reference="CHK-AURA-803",
                customer_id="usr_arjun",
                merchant_id="mer_resolve_store",
                product_id="prod_shirt_02",
                quantity=1,
                amount=Decimal("1899.00"),
                currency="INR",
                status="INITIATED",
                metadata_json=json.dumps({"item": "Relaxed Linen Overshirt", "size": "L", "source": "https://aura-nine-virid.vercel.app/"})
            ),
            # Aura Demo Checkouts
            CheckoutAttempt(
                id="chk_aura_hoodie_01",
                checkout_reference="CHK-AURA-804",
                customer_id="usr_rahul",
                merchant_id="mer_resolve_store",
                product_id="prod_hoodie_01",
                quantity=1,
                amount=Decimal("2499.00"),
                currency="INR",
                status="COMPLETED",
                metadata_json=json.dumps({"item": "Heavyweight Boxy Hoodie", "size": "M", "source": "https://aura-nine-virid.vercel.app/"})
            ),
            CheckoutAttempt(
                id="chk_aura_pants_02",
                checkout_reference="CHK-AURA-805",
                customer_id="usr_aisha",
                merchant_id="mer_resolve_store",
                product_id="prod_pants_03",
                quantity=1,
                amount=Decimal("2999.00"),
                currency="INR",
                status="COMPLETED",
                metadata_json=json.dumps({"item": "Tailored Pleated Trousers", "size": "32", "source": "https://aura-nine-virid.vercel.app/"})
            ),
            CheckoutAttempt(
                id="chk_aura_shirt_03",
                checkout_reference="CHK-AURA-806",
                customer_id="usr_arjun",
                merchant_id="mer_resolve_store",
                product_id="prod_shirt_02",
                quantity=1,
                amount=Decimal("1899.00"),
                currency="INR",
                status="INITIATED",
                metadata_json=json.dumps({"item": "Relaxed Linen Overshirt", "size": "L", "source": "https://aura-nine-virid.vercel.app/"})
            ),
        ]
        session.add_all(checkouts)

        # 6. Payments (Aura Studio & Mappings)
        payments = [
            Payment(
                id="pay_rahul_01",
                payment_reference="TXN987654",
                checkout_id="chk_rahul_01",
                customer_id="usr_rahul",
                merchant_id="mer_resolve_store",
                amount=Decimal("2499.00"),
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
                amount=Decimal("2999.00"),
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
                amount=Decimal("1899.00"),
                currency="INR",
                status="PENDING",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "SIM-TXN-987656", "auth_code": "AUTH_9923", "method": "NETBANKING", "bank": "HDFC"})
            ),
            # Aura Real-Format Transactions
            Payment(
                id="pay_aura_hoodie",
                payment_reference="TXN_4829103_INR",
                checkout_id="chk_aura_hoodie_01",
                customer_id="usr_rahul",
                merchant_id="mer_resolve_store",
                amount=Decimal("2499.00"),
                currency="INR",
                status="SUCCESS",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "TXN_4829103_INR", "rrn": "RRN-482019482019", "auth_code": "AUTH_AURA_881", "method": "UPI (rahul@oksbi)"})
            ),
            Payment(
                id="pay_aura_pants",
                payment_reference="TXN_5910283_INR",
                checkout_id="chk_aura_pants_02",
                customer_id="usr_aisha",
                merchant_id="mer_resolve_store",
                amount=Decimal("2999.00"),
                currency="INR",
                status="SUCCESS",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "TXN_5910283_INR", "rrn": "RRN-591028391028", "auth_code": "AUTH_AURA_882", "method": "Visa Card (ending in 4242)"})
            ),
            Payment(
                id="pay_aura_shirt",
                payment_reference="TXN_3819204_INR",
                checkout_id="chk_aura_shirt_03",
                customer_id="usr_arjun",
                merchant_id="mer_resolve_store",
                amount=Decimal("1899.00"),
                currency="INR",
                status="PENDING",
                provider_name="SIMULATED_GATEWAY",
                provider_payload=json.dumps({"gateway_txn": "TXN_3819204_INR", "rrn": "RRN-381920471920", "auth_code": "AUTH_AURA_883", "method": "Net Banking (HDFC Bank)"})
            ),
        ]
        session.add_all(payments)

        await session.commit()
        print("Database seeded successfully with users, Aura products, policies, checkouts, and payments!")
        
        # Sync directly to MongoDB Atlas
        try:
            from backend.app.mongodb import sync_entire_db_to_mongo
            await sync_entire_db_to_mongo(session)
        except Exception as e:
            print(f"[MongoDB Atlas Seeder Sync Warning] {e}")


if __name__ == "__main__":
    asyncio.run(seed_database())
