-- ==============================================================================
-- RESOLVE AI - Seed Data (AURA STUDIO Luxury Apparel)
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
('mer_resolve_store', 'AURA STUDIO', 'contact@aurastudio.com', 'mkey_live_resolve_store_99812', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. SEED PRODUCTS (AURA STUDIO Luxury Apparel)
INSERT INTO products (id, merchant_id, name, description, price, currency, stock, is_active, created_at, updated_at) VALUES
('prod_hoodie_01', 'mer_resolve_store', 'Heavyweight Boxy Hoodie', '500 GSM French Terry luxury heavyweight drop-shoulder boxy hoodie.', 2499.00, 'INR', 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_shirt_02', 'mer_resolve_store', 'Relaxed Linen Overshirt', '100% European flax tailored relaxed fit overshirt with horn buttons.', 1899.00, 'INR', 14, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_pants_03', 'mer_resolve_store', 'Tailored Pleated Trousers', 'Double-pleated wool-blend relaxed tailored trousers with extended waistband tab.', 2999.00, 'INR', 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_tee_04', 'mer_resolve_store', 'Sand Vintage Boxy Tee', '280 GSM combed cotton vintage washed relaxed boxy silhouette tee.', 1299.00, 'INR', 25, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_denim_05', 'mer_resolve_store', 'Indigo Worker Denim Jacket', '14oz Japanese selvedge denim utility worker jacket with copper hardware.', 3499.00, 'INR', 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod_tote_06', 'mer_resolve_store', 'Matte Black Crossbody Tote', 'Heavy duty duck canvas with matte black metal hardware and modular utility strap.', 1599.00, 'INR', 20, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. SEED MERCHANT POLICIES
INSERT INTO merchant_policies (id, merchant_id, order_recovery_enabled, refund_enabled, refund_approval_required, refund_approval_threshold, auto_retry_limit, recon_delay_seconds, policy_text, created_at, updated_at) VALUES
('pol_resolve_store', 'mer_resolve_store', TRUE, TRUE, TRUE, 500.00, 3, 30, 'Standard Aura Studio policy: Orders can be recovered immediately if stock is available and payment is confirmed. Refunds over ₹500 require Store Manager approval. Recoveries must maintain idempotency and link the original payment.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. SEED CHECKOUT ATTEMPTS
INSERT INTO checkout_attempts (id, checkout_reference, customer_id, merchant_id, product_id, quantity, amount, currency, status, metadata, created_at, updated_at) VALUES
('chk_rahul_01', 'CHK-AURA-801', 'usr_rahul', 'mer_resolve_store', 'prod_hoodie_01', 1, 2499.00, 'INR', 'COMPLETED', '{"item": "Heavyweight Boxy Hoodie", "size": "M", "source": "https://aura-nine-virid.vercel.app/"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chk_aisha_01', 'CHK-AURA-802', 'usr_aisha', 'mer_resolve_store', 'prod_pants_03', 1, 2999.00, 'INR', 'COMPLETED', '{"item": "Tailored Pleated Trousers", "size": "32", "source": "https://aura-nine-virid.vercel.app/"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chk_arjun_01', 'CHK-AURA-803', 'usr_arjun', 'mer_resolve_store', 'prod_shirt_02', 1, 1899.00, 'INR', 'INITIATED', '{"item": "Relaxed Linen Overshirt", "size": "L", "source": "https://aura-nine-virid.vercel.app/"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. SEED PAYMENTS (Realistic demo states)
-- Rahul's payment: SUCCESS, but order is missing (Ready for Scenario 1 demo)
INSERT INTO payments (id, payment_reference, checkout_id, customer_id, merchant_id, amount, currency, status, provider_name, provider_payload, created_at, updated_at) VALUES
('pay_rahul_01', 'TXN_4829103_INR', 'chk_rahul_01', 'usr_rahul', 'mer_resolve_store', 2499.00, 'INR', 'SUCCESS', 'SIMULATED_GATEWAY', '{"gateway_txn": "TXN_4829103_INR", "rrn": "RRN-482019482019", "auth_code": "AUTH_AURA_881", "method": "UPI", "vpa": "rahul@oksbi"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Aisha's payment: SUCCESS, stock 0, missing order (Ready for Scenario 2 refund demo)
('pay_aisha_01', 'TXN_5910283_INR', 'chk_aisha_01', 'usr_aisha', 'mer_resolve_store', 2999.00, 'INR', 'SUCCESS', 'SIMULATED_GATEWAY', '{"gateway_txn": "TXN_5910283_INR", "rrn": "RRN-591028391028", "auth_code": "AUTH_AURA_882", "method": "CARD", "last4": "4242"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Arjun's payment: PENDING (Ready for Scenario 3 pending demo)
('pay_arjun_01', 'TXN_3819204_INR', 'chk_arjun_01', 'usr_arjun', 'mer_resolve_store', 1899.00, 'INR', 'PENDING', 'SIMULATED_GATEWAY', '{"gateway_txn": "TXN_3819204_INR", "rrn": "RRN-381920471920", "auth_code": "AUTH_AURA_883", "method": "NETBANKING", "bank": "HDFC"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
