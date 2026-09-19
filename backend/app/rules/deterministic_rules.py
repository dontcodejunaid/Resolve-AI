from decimal import Decimal
from typing import Optional, Tuple
from fastapi import HTTPException, status
from backend.app.models import User, Payment, Order, Refund, CheckoutAttempt, Case


class DeterministicBusinessRules:
    """
    Core Deterministic Business Rules Engine.
    Enforces rules 1-13 strictly in code. AI PROPOSES. CODE DECIDES.
    """

    @staticmethod
    def validate_customer_ownership(user: User, resource_customer_id: str):
        """RULE 1: Customers can only access cases and transactions belonging to their own account."""
        if user.role == "customer" and user.id != resource_customer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security Violation: You do not have permission to access resources belonging to another account.",
            )

    @staticmethod
    def validate_payment_match(
        payment: Payment,
        checkout: Optional[CheckoutAttempt],
        expected_reference: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        RULE 2: Payment reference must match.
        RULE 3: Merchant identity must match.
        RULE 4: Amount must match.
        RULE 5: Currency must match.
        """
        if expected_reference and payment.payment_reference != expected_reference:
            return False, f"Payment reference mismatch: expected {expected_reference}, got {payment.payment_reference}"

        if checkout:
            if payment.merchant_id != checkout.merchant_id:
                return False, f"Merchant mismatch: Payment merchant ({payment.merchant_id}) != Checkout merchant ({checkout.merchant_id})"

            # Compare amounts with decimal precision
            if Decimal(str(payment.amount)) != Decimal(str(checkout.amount)):
                return False, f"Amount mismatch: Payment ({payment.amount}) != Checkout ({checkout.amount})"

            if payment.currency.upper() != checkout.currency.upper():
                return False, f"Currency mismatch: Payment ({payment.currency}) != Checkout ({checkout.currency})"

        return True, None

    @staticmethod
    def validate_order_recovery_eligibility(
        payment: Payment,
        existing_order: Optional[Order],
        stock: int,
        recovery_enabled: bool,
        existing_refund: Optional[Refund]
    ) -> Tuple[bool, Optional[str]]:
        """
        RULE 6: A recovered order cannot be created twice.
        RULE 8: Recovery and refund cannot run simultaneously for the same purchase.
        """
        if not recovery_enabled:
            return False, "Merchant policy has disabled automatic order recovery."

        if existing_refund and existing_refund.status in ["REQUESTED", "PENDING", "SUCCESS"]:
            return False, f"Conflict: Cannot recover order because an active refund exists (Status: {existing_refund.status})."

        if not existing_order:
            if payment.status != "SUCCESS":
                return False, f"Payment is not in SUCCESS status (Current: {payment.status}). Cannot create order."

            if stock <= 0:
                return False, "Stock unavailable for this item. Order recovery cannot proceed."

        return True, None

    @staticmethod
    def validate_refund_eligibility(
        payment: Payment,
        existing_order: Optional[Order],
        existing_refund: Optional[Refund],
        refund_enabled: bool
    ) -> Tuple[bool, Optional[str]]:
        """
        RULE 7: A payment cannot be refunded twice.
        RULE 8: Recovery and refund cannot run simultaneously for the same purchase.
        RULE 10: An uncertain refund must be checked before another refund is attempted.
        """
        if not refund_enabled:
            return False, "Merchant policy has disabled refunds."

        if existing_refund:
            if existing_refund.status in ["PENDING", "REQUESTED"]:
                return False, f"Existing refund is currently in {existing_refund.status} state. Check refund status instead of creating duplicate."
            if existing_refund.status == "SUCCESS":
                return False, f"Payment was already refunded on {existing_refund.created_at} (Ref: {existing_refund.refund_reference})."

        if payment.status != "SUCCESS":
            return False, f"Payment is not confirmed SUCCESS (Current: {payment.status}). Cannot issue refund on unconfirmed payment."

        return True, None

    @staticmethod
    def is_approval_required(
        amount: Decimal,
        policy_approval_required: bool,
        policy_threshold: Decimal
    ) -> bool:
        """Determines if human manager approval is required under merchant policy thresholds."""
        if not policy_approval_required:
            return False
        return Decimal(str(amount)) >= Decimal(str(policy_threshold))

    @staticmethod
    def validate_idempotency_deduplication(
        payment_reference: Optional[str],
        existing_case_id: Optional[str],
    ) -> Tuple[bool, Optional[str]]:
        """
        RULE 14 (Idempotency & Deduplication Guard):
        Prevents minting duplicate cases or double-recovering purchases when a customer
        or webhook submits identical transaction references concurrently.
        """
        if payment_reference and existing_case_id:
            return False, f"Duplicate submission detected: Payment reference '{payment_reference}' is already actively tracked in Case #{existing_case_id}."
        return True, None

