from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.case import Case
from backend.app.models.approval import Approval
from backend.app.schemas import (
    CaseResponse,
    ApprovalResponse,
    ApprovalDecisionRequest,
    HandoffNoteRequest,
    ManualResolveRequest,
)
from backend.app.security.dependencies import require_role
from backend.app.services.case_engine import CaseEngine

router = APIRouter(prefix="/employee", tags=["Employee Dashboard"])


@router.get("/cases", response_model=List[CaseResponse])
async def employee_list_cases(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    query = select(Case)
    if status_filter:
        query = query.filter(Case.status == status_filter.upper())
    query = query.order_by(Case.created_at.desc())
    result = await db.execute(query)
    cases = result.scalars().all()

    response_cases = []
    for c in cases:
        full_case = await CaseEngine.get_case_with_relations(db, c.id)
        if full_case:
            response_cases.append(full_case)
    return response_cases


@router.get("/cases/{case_id}", response_model=CaseResponse)
async def employee_get_case(
    case_id: str,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case


@router.get("/approvals", response_model=List[ApprovalResponse])
async def list_pending_approvals(
    status: str = "PENDING",
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Approval).filter(Approval.status == status.upper()).order_by(Approval.created_at.desc())
    )
    return result.scalars().all()


@router.post("/approvals/{approval_id}/approve", response_model=ApprovalResponse)
async def approve_action(
    approval_id: str,
    req: ApprovalDecisionRequest,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    try:
        approval = await CaseEngine.process_approval_decision(
            db=db,
            approval_id=approval_id,
            reviewer=current_user,
            approved=True,
            decision_notes=req.decision_notes,
        )
        return approval
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/approvals/{approval_id}/reject", response_model=ApprovalResponse)
async def reject_action(
    approval_id: str,
    req: ApprovalDecisionRequest,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    try:
        approval = await CaseEngine.process_approval_decision(
            db=db,
            approval_id=approval_id,
            reviewer=current_user,
            approved=False,
            decision_notes=req.decision_notes,
        )
        return approval
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/cases/{case_id}/handoff-note", response_model=CaseResponse)
async def add_handoff_note(
    case_id: str,
    req: HandoffNoteRequest,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    await CaseEngine.log_event(
        db,
        case_id=case.id,
        event_type="HUMAN_NOTE_ADDED",
        description=f"Support Note from {current_user.full_name}: {req.note}",
        actor_type="EMPLOYEE",
        actor_id=current_user.id,
    )
    refreshed = await CaseEngine.get_case_with_relations(db, case_id)
    return refreshed or case


@router.post("/cases/{case_id}/resolve", response_model=CaseResponse)
async def manual_resolve_case(
    case_id: str,
    req: Optional[ManualResolveRequest] = None,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Allows a support specialist / employee to mark an escalated case as resolved after manual reconciliation."""
    from datetime import datetime, timezone
    case = await CaseEngine.get_case_with_relations(db, case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    notes_text = req.notes if req and req.notes else f"Case manually resolved by {current_user.full_name} after customer reconciliation"
    res_type = req.resolution_type if req and req.resolution_type else "MANUAL_RECONCILIATION_RESOLVED"

    case.status = "RESOLVED"
    case.resolution_type = res_type
    case.updated_at = datetime.now(timezone.utc)
    await db.commit()

    await CaseEngine.log_event(
        db,
        case_id=case.id,
        event_type="CASE_RESOLVED_MANUALLY",
        description=f"Support Specialist {current_user.full_name} marked case resolved: '{notes_text}'",
        actor_type="EMPLOYEE",
        actor_id=current_user.id,
    )

    # Sync to MongoDB Atlas
    try:
        from backend.app.mongodb import sync_entire_db_to_mongo
        await sync_entire_db_to_mongo(db)
    except Exception:
        pass

    refreshed = await CaseEngine.get_case_with_relations(db, case_id)
    return refreshed or case


@router.post("/cases/{case_id}/step-refund", response_model=CaseResponse)
async def step_refund_verification(
    case_id: str,
    current_user: User = Depends(require_role(["employee", "merchant", "admin"])),
    db: AsyncSession = Depends(get_db),
):
    """Steps pending refund verification to success and marks case resolved."""
    try:
        case = await CaseEngine.step_refund_verification(db, case_id)
        
        # Sync to MongoDB Atlas
        try:
            from backend.app.mongodb import sync_entire_db_to_mongo
            await sync_entire_db_to_mongo(db)
        except Exception:
            pass

        return case
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
