/**
 * RESOLVE AI - MongoDB Atlas Collections & Index Specification
 * 
 * Run in MongoDB Shell (mongosh) or MongoDB Atlas UI / Compass.
 * Authoritative document collections for Resolve AI.
 */

// 1. users collection
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// 2. merchants collection
db.createCollection("merchants");
db.merchants.createIndex({ email: 1 }, { unique: true });
db.merchants.createIndex({ api_key: 1 });

// 3. products collection
db.createCollection("products");
db.products.createIndex({ merchant_id: 1 });
db.products.createIndex({ is_active: 1 });

// 4. merchant_policies collection
db.createCollection("merchant_policies");
db.merchant_policies.createIndex({ merchant_id: 1 }, { unique: true });

// 5. checkout_attempts collection
db.createCollection("checkout_attempts");
db.checkout_attempts.createIndex({ checkout_reference: 1 }, { unique: true });
db.checkout_attempts.createIndex({ customer_id: 1 });
db.checkout_attempts.createIndex({ status: 1 });

// 6. payments collection
db.createCollection("payments");
db.payments.createIndex({ payment_reference: 1 }, { unique: true });
db.payments.createIndex({ checkout_id: 1 });
db.payments.createIndex({ customer_id: 1 });
db.payments.createIndex({ status: 1 });

// 7. orders collection
db.createCollection("orders");
db.orders.createIndex({ order_number: 1 }, { unique: true });
db.orders.createIndex({ payment_id: 1 }, { unique: true });
db.orders.createIndex({ customer_id: 1 });
db.orders.createIndex({ status: 1 });

// 8. refunds collection
db.createCollection("refunds");
db.refunds.createIndex({ refund_reference: 1 }, { unique: true });
db.refunds.createIndex({ payment_id: 1 }, { unique: true });
db.refunds.createIndex({ status: 1 });

// 9. cases collection
db.createCollection("cases");
db.cases.createIndex({ case_number: 1 }, { unique: true });
db.cases.createIndex({ customer_id: 1 });
db.cases.createIndex({ status: 1 });
db.cases.createIndex({ payment_reference: 1 });
db.cases.createIndex({ created_at: -1 });

// 10. case_events collection
db.createCollection("case_events");
db.case_events.createIndex({ case_id: 1 });
db.case_events.createIndex({ created_at: 1 });

// 11. actions collection
db.createCollection("actions");
db.actions.createIndex({ case_id: 1 });
db.actions.createIndex({ idempotency_key: 1 });
db.actions.createIndex({ status: 1 });

// 12. approvals collection
db.createCollection("approvals");
db.approvals.createIndex({ case_id: 1 });
db.approvals.createIndex({ status: 1 });

// 13. notifications collection
db.createCollection("notifications");
db.notifications.createIndex({ case_id: 1 });
db.notifications.createIndex({ user_id: 1 });
db.notifications.createIndex({ status: 1 });

print("[RESOLVE AI] MongoDB Atlas Collections and Indexes Created Successfully.");
