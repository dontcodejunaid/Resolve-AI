from typing import Set, Dict
from fastapi import HTTPException, status

VALID_TRANSITIONS: Dict[str, Set[str]] = {
    "NEW": {"INVESTIGATING", "ESCALATED"},
    "INVESTIGATING": {
        "WAITING_FOR_CUSTOMER",
        "WAITING_FOR_PROVIDER",
        "WAITING_FOR_APPROVAL",
        "ACTION_IN_PROGRESS",
        "VERIFYING",
        "ESCALATED",
        "FAILED",
        "RESOLVED",
    },
    "WAITING_FOR_CUSTOMER": {
        "INVESTIGATING",
        "ACTION_IN_PROGRESS",
        "ESCALATED",
        "RESOLVED",
        "FAILED",
    },
    "WAITING_FOR_PROVIDER": {
        "INVESTIGATING",
        "WAITING_FOR_CUSTOMER",
        "WAITING_FOR_APPROVAL",
        "ACTION_IN_PROGRESS",
        "VERIFYING",
        "RESOLVED",
        "ESCALATED",
        "FAILED",
    },
    "WAITING_FOR_APPROVAL": {
        "ACTION_IN_PROGRESS",
        "ESCALATED",
        "FAILED",
    },
    "ACTION_IN_PROGRESS": {
        "VERIFYING",
        "WAITING_FOR_PROVIDER",
        "FAILED",
        "ESCALATED",
        "RESOLVED",
    },
    "VERIFYING": {
        "RESOLVED",
        "WAITING_FOR_PROVIDER",
        "FAILED",
        "ESCALATED",
    },
    "ESCALATED": {
        "INVESTIGATING",
        "ACTION_IN_PROGRESS",
        "RESOLVED",
        "FAILED",
    },
    "FAILED": {
        "INVESTIGATING",
        "ACTION_IN_PROGRESS",
        "WAITING_FOR_PROVIDER",
        "ESCALATED",
        "RESOLVED",
    },
    "RESOLVED": {
        "INVESTIGATING",  # If reopened
    },
}


class CaseStateMachine:
    """Validates and enforces strict state transitions for customer cases."""

    @staticmethod
    def can_transition(current_status: str, new_status: str) -> bool:
        if current_status == new_status:
            return True
        allowed = VALID_TRANSITIONS.get(current_status.upper(), set())
        return new_status.upper() in allowed

    @staticmethod
    def validate_transition(current_status: str, new_status: str) -> str:
        if not CaseStateMachine.can_transition(current_status, new_status):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal state transition from '{current_status}' to '{new_status}'. Allowed targets: {list(VALID_TRANSITIONS.get(current_status.upper(), []))}",
            )
        return new_status.upper()
