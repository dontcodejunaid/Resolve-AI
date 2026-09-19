from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_serializer
from typing import Optional, Any, List
from datetime import datetime, timezone
from decimal import Decimal


def format_dt(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc).isoformat()
    return dt.astimezone(timezone.utc).isoformat()


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

    @field_serializer("created_at", check_fields=False)
    def serialize_created_at(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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

    @field_serializer("created_at", check_fields=False)
    def serialize_created_at(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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

    @field_serializer("created_at", check_fields=False)
    def serialize_created_at(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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

    @field_serializer("created_at", check_fields=False)
    def serialize_created_at(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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

    @field_serializer("created_at", check_fields=False)
    def serialize_created_at(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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

    @field_serializer("created_at", "completed_at", check_fields=False)
    def serialize_dates(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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

    @field_serializer("created_at", "reviewed_at", check_fields=False)
    def serialize_dates(self, dt: Optional[datetime], _info):
        return format_dt(dt)


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
    screenshot_url: Optional[str] = None
    customer_phone: Optional[str] = None
    screenshot_analysis: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    events: List[CaseEventResponse] = []
    actions: List[ActionResponse] = []
    approvals: List[ApprovalResponse] = []
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", "updated_at", "closed_at", check_fields=False)
    def serialize_dates(self, dt: Optional[datetime], _info):
        return format_dt(dt)


class CreateCaseRequest(BaseModel):
    customer_request: str
    payment_reference: Optional[str] = None
    order_number: Optional[str] = None
    screenshot_url: Optional[str] = None
    screenshot_base64: Optional[str] = None
    customer_phone: Optional[str] = None
    product_id: Optional[str] = None


class CustomerConfirmationRequest(BaseModel):
    accepted: bool
    notes: Optional[str] = None


class ApprovalDecisionRequest(BaseModel):
    approved: bool
    decision_notes: Optional[str] = None


class HandoffNoteRequest(BaseModel):
    note: str


class ManualResolveRequest(BaseModel):
    notes: Optional[str] = "Manually resolved by support specialist after customer contact and gateway reconciliation"
    resolution_type: Optional[str] = "MANUAL_RECONCILIATION_RESOLVED"


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

    @field_serializer("created_at", check_fields=False)
    def serialize_created_at(self, dt: Optional[datetime], _info):
        return format_dt(dt)
