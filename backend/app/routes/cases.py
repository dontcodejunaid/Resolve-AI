from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.case import Case
from backend.app.models.merchant import Merchant
from backend.app.schemas import (
    CaseResponse,
    CreateCaseRequest,
    CustomerConfirmationRequest,
    CaseEventResponse,
)
from backend.app.security.dependencies import get_current_user
from backend.app.rules.deterministic_rules import DeterministicBusinessRules
from backend.app.services.case_engine import CaseEngine

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get("", response_model=List[CaseResponse])
async def list_cases(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Case)
    # Customers only see their own cases (RULE 1)
    if current_user.role == "customer":
        query = query.filter(Case.customer_id == current_user.id)
    if status_filter:
        query = query.filter(Case.status == status_filter.upper())

    query = query.order_by(Case.created_at.desc())
    result = await db.execute(query)
    cases = result.scalars().all()

    # Load relations for detailed response
    response_cases = []
    for c in cases:
        full_case = await CaseEngine.get_case_with_relations(db, c.id)
        if full_case:
            response_cases.append(full_case)
    return response_cases


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    req: CreateCaseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Default to first active merchant if not specified
    res_m = await db.execute(select(Merchant))
    merchant = res_m.scalars().first()
    merchant_id = merchant.id if merchant else "mer_resolve_store"

    case = await CaseEngine.create_case(
        db=db,
        customer_id=current_user.id,
        merchant_id=merchant_id,
        customer_request=req.customer_request,
        payment_reference=req.payment_reference,
        order_number=req.order_number,
    )
    return case


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found",
        )

    # RULE 1: Customer Ownership validation
    DeterministicBusinessRules.validate_customer_ownership(current_user, case.customer_id)
    return case


@router.post("/{case_id}/customer-confirmation", response_model=CaseResponse)
async def customer_confirmation(
    case_id: str,
    req: CustomerConfirmationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        updated_case = await CaseEngine.process_customer_recovery_confirmation(
            db=db,
            case_id=case_id,
            user=current_user,
            accepted=req.accepted,
            notes=req.notes,
        )
        return updated_case
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{case_id}/timeline", response_model=List[CaseEventResponse])
async def get_case_timeline(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    DeterministicBusinessRules.validate_customer_ownership(current_user, case.customer_id)
    return case.events
