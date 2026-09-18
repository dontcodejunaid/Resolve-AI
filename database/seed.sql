-- ==============================================================================
-- RESOLVE AI - Seed Data
-- Realistic sample data for demo scenarios, accounts, products, and policies.
-- Password hashes use bcrypt for standard 'password123'.
-- ==============================================================================

-- 1. SEED USERS
-- Standard password hash for 'password123': $2b$12$e6u3R.Jg.wE2Wc89o1Xm0OGbA1d1yZpS4rV8m1u6wR0/a8n5EaV4q
INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at) VALUES
('usr_rahul', 'rahul@example.com', '$2b$12$fTzL3i7yW1JgK9vB3XlMueO6vJ2B1lH4g5F7j8K9L0M1N2P3Q4R5S', 'Rahul Sharma', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr_aisha', 'aisha@example.com', '$2b$12$fTzL3i7yW1JgK9vB3XlMueO6vJ2B1lH4g5F7j8K9L0M1N2P3Q4R5S', 'Aisha Khan', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr_arjun', 'arjun@example.com', '$2b$12$fTzL3i7yW1JgK9vB3XlMueO6vJ2B1lH4g5F7j8K9L0M1N2P3Q4R5S', 'Arjun Verma', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr_agent', 'agent@resolveai.com', '$2b$12$fTzL3i7yW1JgK9vB3XlMueO6vJ2B1lH4g5F7j8K9L0M1N2P3Q4R5S', 'Dev Support Specialist', 'employee', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('usr_manager', 'manager@resolvestore.com', '$2b$12$fTzL3i7yW1JgK9vB3XlMueO6vJ2B1lH4g5F7j8K9L0M1N2P3Q4R5S', 'Priya Patel (Store Manager)', 'merchant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. SEED MERCHANTS
INSERT INTO merchants (id, name, email, api_key, created_at, updated_at) VALUES
('mer_resolve_store', 'Resolve Store', 'contact@resolvestore.com', 'mkey_live_resolve_store_99812', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. SEED PRODUCTS
INSERT INTO products (id, merchant_id, name, description, price, currency, stock, is_active, created_at, updated_at) VALUES
('prod_headset', 'mer_resolve_store', 'Wireless Headset', 'High-fidelity Bluetooth wireless headset with active noise cancellation', 799.00, 'INR', 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_keyboard', 'mer_resolve_store', 'Mechanical Keyboard', 'RGB Tenkeyless mechanical gaming keyboard with tactile brown switches', 1499.00, 'INR', 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_mouse', 'mer_resolve_store', 'Wireless Mouse', 'Ergonomic dual-mode optical wireless mouse with silent clicks', 499.00, 'INR', 20, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. SEED MERCHANT POLICIES
INSERT INTO merchant_policies (id, merchant_id, order_recovery_enabled, refund_enabled, refund_approval_required, refund_approval_threshold, auto_retry_limit, recon_delay_seconds, policy_text, created_at, updated_at) VALUES
('pol_resolve_store', 'mer_resolve_store', TRUE, TRUE, TRUE, 500.00, 3, 30, 'Standard Resolve Store policy: Orders can be recovered immediately if stock is available and payment is confirmed. Refunds over ₹500 require manager approval. Recoveries must maintain idempotency and link the original payment.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. SEED CHECKOUT ATTEMPTS
INSERT INTO checkout_attempts (id, checkout_reference, customer_id, merchant_id, product_id, quantity, amount, currency, status, metadata, created_at, updated_at) VALUES
('chk_rahul_01', 'CHK-RS-77210', 'usr_rahul', 'mer_resolve_store', 'prod_headset', 1, 799.00, 'INR', 'COMPLETED', '{"item": "Wireless Headset", "color": "Midnight Black"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chk_aisha_01', 'CHK-RS-77211', 'usr_aisha', 'mer_resolve_store', 'prod_keyboard', 1, 1499.00, 'INR', 'COMPLETED', '{"item": "Mechanical Keyboard", "layout": "US ANSI"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chk_arjun_01', 'CHK-RS-77212', 'usr_arjun', 'mer_resolve_store', 'prod_mouse', 1, 499.00, 'INR', 'INITIATED', '{"item": "Wireless Mouse", "color": "Slate Grey"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. SEED PAYMENTS (Realistic demo states)
-- Rahul's payment: SUCCESS, but order is missing (Ready for Scenario 1 demo)
INSERT INTO payments (id, payment_reference, checkout_id, customer_id, merchant_id, amount, currency, status, provider_name, provider_payload, created_at, updated_at) VALUES
('pay_rahul_01', 'TXN987654', 'chk_rahul_01', 'usr_rahul', 'mer_resolve_store', 799.00, 'INR', 'SUCCESS', 'SIMULATED_GATEWAY', '{"gateway_txn": "SIM-TXN-987654", "auth_code": "AUTH_9921", "method": "UPI", "vpa": "rahul@oksbi"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Aisha's payment: SUCCESS, stock 0, missing order (Ready for Scenario 2 refund demo)
('pay_aisha_01', 'TXN987655', 'chk_aisha_01', 'usr_aisha', 'mer_resolve_store', 1499.00, 'INR', 'SUCCESS', 'SIMULATED_GATEWAY', '{"gateway_txn": "SIM-TXN-987655", "auth_code": "AUTH_9922", "method": "CARD", "last4": "4242"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Arjun's payment: PENDING (Ready for Scenario 3 pending demo)
('pay_arjun_01', 'TXN987656', 'chk_arjun_01', 'usr_arjun', 'mer_resolve_store', 499.00, 'INR', 'PENDING', 'SIMULATED_GATEWAY', '{"gateway_txn": "SIM-TXN-987656", "auth_code": "AUTH_9923", "method": "NETBANKING", "bank": "HDFC"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
