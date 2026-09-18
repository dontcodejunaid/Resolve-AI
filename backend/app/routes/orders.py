from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.order import Order
from backend.app.schemas import OrderResponse
from backend.app.security.dependencies import get_current_user
from backend.app.rules.deterministic_rules import DeterministicBusinessRules

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order)
    if current_user.role == "customer":
        query = query.filter(Order.customer_id == current_user.id)
    query = query.order_by(Order.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).filter(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    DeterministicBusinessRules.validate_customer_ownership(current_user, order.customer_id)
    return order
