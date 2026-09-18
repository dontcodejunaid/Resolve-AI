-- ==============================================================================
-- RESOLVE AI - PostgreSQL Database Schema
-- Standard PostgreSQL DDL with strict integrity constraints, foreign keys,
-- indexes, and status validations.
-- ==============================================================================

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS merchant_policies CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS case_events CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS checkout_attempts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('customer', 'employee', 'merchant', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. MERCHANTS TABLE
CREATE TABLE merchants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. CHECKOUT ATTEMPTS TABLE
CREATE TABLE checkout_attempts (
    id VARCHAR(64) PRIMARY KEY,
    checkout_reference VARCHAR(128) UNIQUE NOT NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'COMPLETED', 'ABANDONED', 'FAILED')),
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. PAYMENTS TABLE
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    payment_reference VARCHAR(128) UNIQUE NOT NULL,
    checkout_id VARCHAR(64) REFERENCES checkout_attempts(id) ON DELETE SET NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    provider_name VARCHAR(64) DEFAULT 'SIMULATED_GATEWAY' NOT NULL,
    provider_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. ORDERS TABLE
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(128) UNIQUE NOT NULL,
    checkout_id VARCHAR(64) REFERENCES checkout_attempts(id) ON DELETE SET NULL,
    payment_id VARCHAR(64) UNIQUE REFERENCES payments(id) ON DELETE SET NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    is_recovered BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. REFUNDS TABLE
CREATE TABLE refunds (
    id VARCHAR(64) PRIMARY KEY,
    refund_reference VARCHAR(128) UNIQUE NOT NULL,
    provider_reference VARCHAR(128) UNIQUE,
    payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'PENDING', 'SUCCESS', 'FAILED')),
    reason TEXT,
    approved_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. CASES TABLE
CREATE TABLE cases (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(64) UNIQUE NOT NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE SET NULL,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    refund_id VARCHAR(64) REFERENCES refunds(id) ON DELETE SET NULL,
    issue_type VARCHAR(64) NOT NULL,
    customer_request TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW' CHECK (status IN (
        'NEW',
        'INVESTIGATING',
        'WAITING_FOR_CUSTOMER',
        'WAITING_FOR_PROVIDER',
        'WAITING_FOR_APPROVAL',
        'ACTION_IN_PROGRESS',
        'VERIFYING',
        'RESOLVED',
        'ESCALATED',
        'FAILED'
    )),
    resolution_type VARCHAR(64) CHECK (resolution_type IN (
        'ORDER_RECOVERY',
        'REFUND_ISSUED',
        'PAYMENT_PENDING_SCHEDULED',
        'EXISTING_ORDER_CONFIRMED',
        'EXISTING_REFUND_TRACKED',
        'MANUAL_ESCALATION',
        'UNRESOLVED'
    )),
    ai_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 9. CASE EVENTS TABLE (IMMUTABLE AUDIT LOG)
CREATE TABLE case_events (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    actor_type VARCHAR(32) NOT NULL CHECK (actor_type IN ('AI', 'SYSTEM', 'CUSTOMER', 'EMPLOYEE', 'PROVIDER', 'MERCHANT')),
    actor_id VARCHAR(64),
    event_metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. ACTIONS TABLE
CREATE TABLE actions (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    action_type VARCHAR(64) NOT NULL CHECK (action_type IN (
        'CHECK_PAYMENT',
        'CHECK_ORDER',
        'CHECK_STOCK',
        'CHECK_REFUND',
        'RECOVER_ORDER',
        'REQUEST_REFUND',
        'SEND_NOTIFICATION',
        'ESCALATE',
        'RETRY',
        'SCHEDULE_RECHECK'
    )),
    requested_by VARCHAR(64) NOT NULL,
    approved_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED')),
    idempotency_key VARCHAR(128) UNIQUE,
    provider_reference VARCHAR(128),
    request_metadata TEXT,
    result_metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. APPROVALS TABLE
CREATE TABLE approvals (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    action_type VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    amount NUMERIC(12, 2) CHECK (amount >= 0),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_by VARCHAR(64) NOT NULL,
    reviewed_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    decision_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 12. MERCHANT POLICIES TABLE
CREATE TABLE merchant_policies (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) UNIQUE NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    order_recovery_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    refund_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    refund_approval_required BOOLEAN DEFAULT TRUE NOT NULL,
    refund_approval_threshold NUMERIC(12, 2) DEFAULT 500.00 NOT NULL,
    auto_retry_limit INTEGER DEFAULT 3 NOT NULL,
    recon_delay_seconds INTEGER DEFAULT 30 NOT NULL,
    policy_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id VARCHAR(64) REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(32) DEFAULT 'APP' NOT NULL CHECK (channel IN ('APP', 'EMAIL', 'SMS')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- INDEXES FOR PERFORMANCE & LOOKUPS
CREATE INDEX idx_cases_customer_id ON cases(customer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_payment_id ON cases(payment_id);
CREATE INDEX idx_case_events_case_id ON case_events(case_id);
CREATE INDEX idx_case_events_created_at ON case_events(created_at);
CREATE INDEX idx_actions_case_id ON actions(case_id);
CREATE INDEX idx_actions_idempotency ON actions(idempotency_key);
CREATE INDEX idx_approvals_case_id ON approvals(case_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
