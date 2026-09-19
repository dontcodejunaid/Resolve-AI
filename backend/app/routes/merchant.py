import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.merchant import Merchant
from backend.app.models.policy import MerchantPolicy
from backend.app.models.product import Product
from backend.app.models.case import Case
from backend.app.models.approval import Approval
from backend.app.models.refund import Refund
from backend.app.schemas import (
    MerchantPolicyResponse,
    MerchantPolicyUpdate,
    ProductResponse,
    ProductCreateOrUpdate,
    CaseResponse,
)
from backend.app.security.dependencies import require_role
from backend.app.services.case_engine import CaseEngine

router = APIRouter(prefix="/merchant", tags=["Merchant Dashboard"])


@router.get("/policies", response_model=MerchantPolicyResponse)
async def get_merchant_policy(
    current_user: User = Depends(require_role(["merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(MerchantPolicy))
    policy = res.scalars().first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not configured")
    return policy


@router.put("/policies", response_model=MerchantPolicyResponse)
async def update_merchant_policy(
    req: MerchantPolicyUpdate,
    current_user: User = Depends(require_role(["merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(MerchantPolicy))
    policy = res.scalars().first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    if req.order_recovery_enabled is not None:
        policy.order_recovery_enabled = req.order_recovery_enabled
    if req.refund_enabled is not None:
        policy.refund_enabled = req.refund_enabled
    if req.refund_approval_required is not None:
        policy.refund_approval_required = req.refund_approval_required
    if req.refund_approval_threshold is not None:
        policy.refund_approval_threshold = req.refund_approval_threshold
    if req.auto_retry_limit is not None:
        policy.auto_retry_limit = req.auto_retry_limit
    if req.recon_delay_seconds is not None:
        policy.recon_delay_seconds = req.recon_delay_seconds
    if req.policy_text is not None:
        policy.policy_text = req.policy_text

    await db.commit()
    await db.refresh(policy)

    # Sync to MongoDB Atlas
    try:
        from backend.app.mongodb import sync_model_to_mongo
        await sync_model_to_mongo("merchant_policies", policy)
    except Exception as e:
        print(f"[MongoDB Policy Sync Warning] {e}")

    return policy


@router.get("/products", response_model=List[ProductResponse])
async def list_merchant_products(
    current_user: User = Depends(require_role(["merchant", "admin", "employee"])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Product).order_by(Product.name.asc()))
    return res.scalars().all()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    req: ProductCreateOrUpdate,
    current_user: User = Depends(require_role(["merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    res_m = await db.execute(select(Merchant))
    merchant = res_m.scalars().first()
    m_id = merchant.id if merchant else "mer_resolve_store"

    product = Product(
        id=f"prod_{uuid.uuid4().hex[:8]}",
        merchant_id=m_id,
        name=req.name,
        description=req.description,
        price=req.price,
        currency=req.currency,
        stock=req.stock,
        is_active=req.is_active,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)

    # Sync to MongoDB Atlas
    try:
        from backend.app.mongodb import sync_model_to_mongo
        await sync_model_to_mongo("products", product)
    except Exception as e:
        print(f"[MongoDB Product Sync Warning] {e}")

    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    req: ProductCreateOrUpdate,
    current_user: User = Depends(require_role(["merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Product).filter(Product.id == product_id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.name = req.name
    product.description = req.description
    product.price = req.price
    product.currency = req.currency
    product.stock = req.stock
    product.is_active = req.is_active

    await db.commit()
    await db.refresh(product)

    # Sync to MongoDB Atlas
    try:
        from backend.app.mongodb import sync_model_to_mongo
        await sync_model_to_mongo("products", product)
    except Exception as e:
        print(f"[MongoDB Product Sync Warning] {e}")

    return product


@router.get("/metrics")
async def get_system_metrics(
    current_user: User = Depends(require_role(["merchant", "employee", "admin"])),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    res_cases = await db.execute(select(Case))
    all_cases = res_cases.scalars().all()

    total_cases = len(all_cases)
    resolved_cases = len([c for c in all_cases if c.status == "RESOLVED"])
    escalated_cases = len([c for c in all_cases if c.status == "ESCALATED"])
    recovery_count = len([c for c in all_cases if c.resolution_type == "ORDER_RECOVERY"])
    refund_count = len([c for c in all_cases if c.resolution_type == "REFUND_ISSUED"])

    res_appr = await db.execute(select(Approval).filter(Approval.status == "PENDING"))
    pending_approvals = len(res_appr.scalars().all())

    return {
        "total_cases": total_cases,
        "resolved_cases": resolved_cases,
        "escalated_cases": escalated_cases,
        "recovery_resolutions": recovery_count,
        "refund_resolutions": refund_count,
        "pending_approvals": pending_approvals,
        "resolution_rate": f"{round((resolved_cases / total_cases * 100), 1)}%" if total_cases > 0 else "100%",
        "environment": "SIMULATED PAYMENT ENVIRONMENT"
    }
