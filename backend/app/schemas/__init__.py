from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Any, List
from datetime import datetime
from decimal import Decimal


# --- Auth Schemas ---
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "customer"  # customer, employee, merchant


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Product & Merchant Schemas ---
class ProductResponse(BaseModel):
    id: str
    merchant_id: str
    name: str
    description: Optional[str] = None
    price: Decimal
    currency: str
    stock: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class ProductCreateOrUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    currency: str = "INR"
    stock: int
    is_active: bool = True


class MerchantPolicyResponse(BaseModel):
    id: str
    merchant_id: str
    order_recovery_enabled: bool
    refund_enabled: bool
    refund_approval_required: bool
    refund_approval_threshold: Decimal
    auto_retry_limit: int
    recon_delay_seconds: int
    policy_text: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class MerchantPolicyUpdate(BaseModel):
    order_recovery_enabled: Optional[bool] = None
    refund_enabled: Optional[bool] = None
    refund_approval_required: Optional[bool] = None
    refund_approval_threshold: Optional[Decimal] = None
    auto_retry_limit: Optional[int] = None
    recon_delay_seconds: Optional[int] = None
    policy_text: Optional[str] = None


# --- Payment & Order Schemas ---
class PaymentResponse(BaseModel):
    id: str
    payment_reference: str
    checkout_id: Optional[str] = None
    customer_id: str
    merchant_id: str
    amount: Decimal
    currency: str
    status: str
    provider_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: str
    order_number: str
    checkout_id: Optional[str] = None
    payment_id: Optional[str] = None
    customer_id: str
    merchant_id: str
    product_id: str
    quantity: int
    amount: Decimal
    currency: str
    status: str
    is_recovered: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RefundResponse(BaseModel):
    id: str
    refund_reference: str
    provider_reference: Optional[str] = None
    payment_id: str
    customer_id: str
    merchant_id: str
    amount: Decimal
    currency: str
    status: str
    reason: Optional[str] = None
    approved_by: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Case, Event, Action, Approval Schemas ---
class CaseEventResponse(BaseModel):
    id: str
    case_id: str
    event_type: str
    description: str
    actor_type: str
    actor_id: Optional[str] = None
    event_metadata: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ActionResponse(BaseModel):
    id: str
    case_id: str
    action_type: str
    requested_by: str
    approved_by: Optional[str] = None
    status: str
    idempotency_key: Optional[str] = None
    provider_reference: Optional[str] = None
    request_metadata: Optional[str] = None
    result_metadata: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ApprovalResponse(BaseModel):
    id: str
    case_id: str
    action_type: str
    reason: str
    amount: Optional[Decimal] = None
    status: str
    requested_by: str
    reviewed_by: Optional[str] = None
    decision_notes: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class CaseResponse(BaseModel):
    id: str
    case_number: str
    customer_id: str
    merchant_id: str
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    refund_id: Optional[str] = None
    issue_type: str
    customer_request: str
    status: str
    resolution_type: Optional[str] = None
    ai_summary: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    events: List[CaseEventResponse] = []
    actions: List[ActionResponse] = []
    approvals: List[ApprovalResponse] = []
    model_config = ConfigDict(from_attributes=True)


class CreateCaseRequest(BaseModel):
    customer_request: str
    payment_reference: Optional[str] = None
    order_number: Optional[str] = None


class CustomerConfirmationRequest(BaseModel):
    accepted: bool
    notes: Optional[str] = None


class ApprovalDecisionRequest(BaseModel):
    approved: bool
    decision_notes: Optional[str] = None


class HandoffNoteRequest(BaseModel):
    note: str


class ScenarioRunRequest(BaseModel):
    scenario_id: str


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    case_id: Optional[str] = None
    title: str
    message: str
    channel: str
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
