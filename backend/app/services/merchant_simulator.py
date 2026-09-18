import uuid
from decimal import Decimal
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.app.models.product import Product
from backend.app.models.checkout import CheckoutAttempt
from backend.app.models.order import Order
from backend.app.models.payment import Payment
from backend.app.models.policy import MerchantPolicy


class MerchantSimulator:
    """
    Simulated Merchant & Inventory System.
    Handles product stock, checkout verification, order lookups, and idempotent order recovery.
    """

    @staticmethod
    async def get_product(db: AsyncSession, product_id: str) -> Optional[Product]:
        result = await db.execute(select(Product).filter(Product.id == product_id))
        return result.scalars().first()

    @staticmethod
    async def get_merchant_policy(db: AsyncSession, merchant_id: str) -> Optional[MerchantPolicy]:
        result = await db.execute(select(MerchantPolicy).filter(MerchantPolicy.merchant_id == merchant_id))
        return result.scalars().first()

    @staticmethod
    async def get_checkout(db: AsyncSession, checkout_id: str) -> Optional[CheckoutAttempt]:
        result = await db.execute(select(CheckoutAttempt).filter(CheckoutAttempt.id == checkout_id))
        return result.scalars().first()

    @staticmethod
    async def get_order_by_payment(db: AsyncSession, payment_id: str) -> Optional[Order]:
        result = await db.execute(select(Order).filter(Order.payment_id == payment_id))
        return result.scalars().first()

    @staticmethod
    async def get_order_by_id(db: AsyncSession, order_id: str) -> Optional[Order]:
        result = await db.execute(select(Order).filter(Order.id == order_id))
        return result.scalars().first()

    @staticmethod
    async def recover_order_for_payment(
        db: AsyncSession,
        payment: Payment,
        checkout: CheckoutAttempt,
    ) -> Tuple[Order, bool]:
        """
        Idempotent order recovery:
        1. Checks if order already exists for this payment -> returns (existing_order, False)
        2. Validates stock availability
        3. Decrements stock by quantity
        4. Creates new order linked to the verified payment
        5. Returns (new_order, True)
        """
        existing_order = await MerchantSimulator.get_order_by_payment(db, payment.id)
        if existing_order:
            return existing_order, False

        product = await MerchantSimulator.get_product(db, checkout.product_id)
        if not product or product.stock < checkout.quantity:
            raise ValueError(f"Insufficient stock for product {checkout.product_id} (Available: {product.stock if product else 0})")

        # Deduct stock
        product.stock -= checkout.quantity

        # Create recovered order
        order_num = f"ORD-{uuid.uuid4().hex[:6].upper()}"
        order = Order(
            id=f"ord_{uuid.uuid4().hex[:12]}",
            order_number=order_num,
            checkout_id=checkout.id,
            payment_id=payment.id,
            customer_id=checkout.customer_id,
            merchant_id=checkout.merchant_id,
            product_id=checkout.product_id,
            quantity=checkout.quantity,
            amount=payment.amount,
            currency=payment.currency,
            status="CONFIRMED",
            is_recovered=True,
        )
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order, True
