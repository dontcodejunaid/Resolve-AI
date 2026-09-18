export const INITIAL_ENGINEERS = [
  {
    id: 'worker-1',
    name: 'Maya Lin',
    role: 'Payment & Gateway Sentinel',
    title: 'Senior Banking Gateway Specialist',
    level: 'AI Teammate 1',
    color: '#3b82f6', // blue
    image: '/workers/maya.jpg',
    video: '/workers/maya.mp4',
    animatedWebp: '/workers/maya_anim.webp',
    state: 'coding',
    thought: 'Validating simulated banking gateway response for TXN987654 💳',
    loc: 28420,
    coffeeCups: 4,
    bugsFixed: 42,
    branch: 'gateway/payment-verification',
    techStack: ['FastAPI', 'Banking Gateway API', 'PyJWT', 'Decimal Precision'],
    currentTask: 'Verify Gateway Settlement & Amount Match',
    progress: 100,
    workflowSteps: [
      { step: '01', name: 'Gateway Connection', desc: 'Queries Simulated Banking Gateway for transaction reference', status: 'COMPLETED', tool: 'CHECK_PAYMENT' },
      { step: '02', name: 'Decimal Amount Match', desc: 'Enforces Rule 4 & 5 (Amount & Currency exact match)', status: 'COMPLETED', tool: 'VALIDATE_AMOUNT' },
      { step: '03', name: 'Payment Status Ingestion', desc: 'Ingests verified SUCCESS / PENDING state into telemetry', status: 'COMPLETED', tool: 'INGEST_TELEMETRY' },
    ],
  },
  {
    id: 'worker-2',
    name: 'Alex Chen',
    role: 'Order & Inventory Specialist',
    title: 'Warehouse & Cart Logistics Lead',
    level: 'AI Teammate 2',
    color: '#10b981', // emerald
    image: '/workers/alex.jpg',
    video: '/workers/alex.mp4',
    animatedWebp: '/workers/alex_anim.webp',
    state: 'coding',
    thought: 'Checking warehouse inventory stock and cart session CHK-RS-77210 📦',
    loc: 51200,
    coffeeCups: 7,
    bugsFixed: 89,
    branch: 'inventory/stock-lock-engine',
    techStack: ['PostgreSQL', 'SQLAlchemy', 'Inventory Engine', 'Idempotency'],
    currentTask: 'Query Warehouse Inventory & Cart Records',
    progress: 100,
    workflowSteps: [
      { step: '01', name: 'Checkout Cart Inspection', desc: 'Finds saved customer cart attempt CHK-RS-77210', status: 'COMPLETED', tool: 'CHECK_CHECKOUT' },
      { step: '02', name: 'Order Confirmation Search', desc: 'Searches database for existing order to avoid duplicates (Rule 6)', status: 'COMPLETED', tool: 'CHECK_ORDER' },
      { step: '03', name: 'Stock Availability Check', desc: 'Validates warehouse stock (10 units available)', status: 'COMPLETED', tool: 'CHECK_STOCK' },
      { step: '04', name: 'Idempotent Order Recovery', desc: 'Creates recovered order and links payment without re-charging', status: 'COMPLETED', tool: 'RECOVER_ORDER' },
    ],
  },
  {
    id: 'worker-3',
    name: 'Samira Khan',
    role: 'Policy & Cognee Strategist',
    title: 'Merchant Policy & AI Orchestrator',
    level: 'AI Teammate 3',
    color: '#8b5cf6', // purple
    image: '/workers/samira.jpg',
    video: '/workers/samira.mp4',
    animatedWebp: '/workers/samira_anim.webp',
    state: 'thinking',
    thought: 'Querying Cognee knowledge layer for store recovery policies 🧠',
    loc: 21300,
    coffeeCups: 5,
    bugsFixed: 31,
    branch: 'cognee/policy-synthesis',
    techStack: ['Cognee Cloud', 'n8n Cloud', 'LangChain', 'LLM Agent'],
    currentTask: 'Synthesize Cognee Policy & Decision Rules',
    progress: 100,
    workflowSteps: [
      { step: '01', name: 'Cognee Policy Query', desc: 'Retrieves merchant rules for missing order with confirmed payment', status: 'COMPLETED', tool: 'QUERY_COGNEE' },
      { step: '02', name: 'Threshold Evaluation', desc: 'Evaluates ₹500 manager approval limit under store policy', status: 'COMPLETED', tool: 'EVALUATE_THRESHOLD' },
      { step: '03', name: 'Action Synthesis', desc: 'Formulates permitted proposal: Propose Original Order Recovery', status: 'COMPLETED', tool: 'SYNTHESIZE_PROPOSAL' },
    ],
  },
  {
    id: 'worker-4',
    name: 'Marcus Vance',
    role: 'Verification & Audit Controller',
    title: 'Deterministic Rules & Outcome Verifier',
    level: 'AI Teammate 4',
    color: '#f59e0b', // amber
    image: '/workers/marcus.jpg',
    video: '/workers/marcus.mp4',
    animatedWebp: '/workers/marcus_anim.webp',
    state: 'coding',
    thought: 'Enforcing 13 Deterministic Business Rules (AI PROPOSES, CODE DECIDES) 🛡️',
    loc: 39400,
    coffeeCups: 6,
    bugsFixed: 77,
    branch: 'rules/deterministic-verifier',
    techStack: ['Deterministic Engine', 'State Machine', 'Audit Log', 'Post-Action Verifier'],
    currentTask: 'Enforce 13 Deterministic Rules & Outcome Verification',
    progress: 100,
    workflowSteps: [
      { step: '01', name: 'Tenancy & Isolation Guard', desc: 'Enforces Rule 1 (Strict customer account tenancy check)', status: 'COMPLETED', tool: 'VALIDATE_TENANCY' },
      { step: '02', name: 'Idempotency Key Lock', desc: 'Locks key RECOVERY-CASE-PAYMENT against double execution', status: 'COMPLETED', tool: 'IDEMPOTENCY_GUARD' },
      { step: '03', name: 'Approval Dispatch (Handoff)', desc: 'Routes high-value actions to Manager Queue when required', status: 'COMPLETED', tool: 'DISPATCH_APPROVAL' },
      { step: '04', name: 'Independent Verification', desc: 'Post-action DB verification before marking case RESOLVED (Rule 13)', status: 'COMPLETED', tool: 'INDEPENDENT_VERIFICATION' },
    ],
  }
];

export const SCENARIO_WORKER_CUSTOMIZATIONS = {
  SCENARIO_1_RECOVERY: {
    'worker-1': {
      thought: 'Validating simulated banking gateway response for TXN987654 (₹799.00 SUCCESS) 💳',
      currentTask: 'Verify Gateway Settlement & Amount Match',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'Found cart CHK-RS-77210. Checking warehouse stock: 10 units AVAILABLE 📦',
      currentTask: 'Check Inventory & Prepare Safe Order Recovery',
      activeTool: 'CHECK_STOCK & RECOVER_ORDER'
    },
    'worker-3': {
      thought: 'Queried Cognee knowledge base -> Policy approves direct order recovery 🧠',
      currentTask: 'Synthesize Cognee Recovery Policy',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 6 & 13 -> 1 order created, zero extra charges, 100% verified 🛡️',
      currentTask: 'Enforce 13 Deterministic Rules & Post-Action Verification',
      activeTool: 'INDEPENDENT_VERIFICATION'
    }
  },
  SCENARIO_2_REFUND: {
    'worker-1': {
      thought: 'Validating banking gateway TXN445566 (₹1499.00 SUCCESS) 💳',
      currentTask: 'Verify Gateway Settlement & Amount Match',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'Checking warehouse stock for Keyboard: 0 units OUT OF STOCK 🚫',
      currentTask: 'Inventory Depleted -> Fallback to Refund Pipeline',
      activeTool: 'CHECK_STOCK'
    },
    'worker-3': {
      thought: 'Amount ₹1499 exceeds ₹500 manager threshold -> Approval required 👤',
      currentTask: 'Evaluate Policy Threshold for High-Value Refund',
      activeTool: 'EVALUATE_THRESHOLD'
    },
    'worker-4': {
      thought: 'Enforcing Rule 8 -> Dispatched approval task to Manager Queue 🛡️',
      currentTask: 'Enforce Manager Approval & Audit Handoff',
      activeTool: 'DISPATCH_APPROVAL'
    }
  },
  SCENARIO_3_PENDING: {
    'worker-1': {
      thought: 'Querying gateway for TXN778899 -> Status: PENDING with bank ⏳',
      currentTask: 'Detect Pending Bank Transaction',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'Holding cart CHK-AV-33129; deferring order creation (Rule 4) 📦',
      currentTask: 'Defer Order Allocation on Pending Payment',
      activeTool: 'HOLD_CART'
    },
    'worker-3': {
      thought: 'Policy synthesis: Prohibit blind order creation or refund on pending txns 🧠',
      currentTask: 'Synthesize Pending Payment Hold Protocol',
      activeTool: 'POLICY_SYNTHESIS'
    },
    'worker-4': {
      thought: 'Enforcing Rule 10 -> Background worker scheduled, case kept active 🛡️',
      currentTask: 'Schedule 15-Minute Background Poller',
      activeTool: 'SCHEDULE_RECHECK'
    }
  },
  SCENARIO_4_DUPLICATE: {
    'worker-1': {
      thought: 'Analyzing duplicate webhook event for TXN987654 💳',
      currentTask: 'Detect Inbound Duplicate Webhook Payload',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'Acquiring database lock. Order #ORD-8812 already linked to payment 📦',
      currentTask: 'Check Existing Linked Orders',
      activeTool: 'IDEMPOTENCY_LOCK'
    },
    'worker-3': {
      thought: 'Policy check: Acknowledge webhook without secondary order creation 🧠',
      currentTask: 'Enforce Idempotent Webhook Ingestion',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Deterministic Rule 7 verified: Exactly 1 order recorded in PostgreSQL 🛡️',
      currentTask: 'Verify Single-Order Database Invariant',
      activeTool: 'INDEPENDENT_VERIFICATION'
    }
  },
  SCENARIO_5_REFUND_EXISTS: {
    'worker-1': {
      thought: 'Checking transaction TXN551122 -> Existing refund record REF-4412 found 💳',
      currentTask: 'Query Gateway & Payout History',
      activeTool: 'CHECK_REFUND'
    },
    'worker-2': {
      thought: 'Checking order state -> Marked as cancelled, zero pending fulfillment 📦',
      currentTask: 'Confirm Cancelled Order State',
      activeTool: 'CHECK_ORDER'
    },
    'worker-3': {
      thought: 'Policy check: Strict ban on issuing duplicate refund payouts 🧠',
      currentTask: 'Evaluate Duplicate Refund Prevention Policy',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 9 -> Tracked existing refund reference without debiting merchant 🛡️',
      currentTask: 'Audit Existing Refund & Close Investigation',
      activeTool: 'INDEPENDENT_VERIFICATION'
    }
  },
  SCENARIO_6_CONFLICT: {
    'worker-1': {
      thought: 'Gateway records ₹1299 USD vs Cart records ₹999 INR -> Inconsistency detected 🔍',
      currentTask: 'Detect Amount & Currency Mismatch',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'Halting automatic order creation to prevent financial loss 📦',
      currentTask: 'Lock Checkout Session Against Auto-Recovery',
      activeTool: 'LOCK_RESOURCES'
    },
    'worker-3': {
      thought: 'Policy check: AI refuses to guess when financial discrepancies occur 🧠',
      currentTask: 'Synthesize Safe Escalation Docket',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 11 & 12 -> Formatted structured human handoff docket 🛡️',
      currentTask: 'Dispatch Case to Human Escalation Queue',
      activeTool: 'ESCALATE_TO_HUMAN'
    }
  },
  SCENARIO_7_TIMEOUT: {
    'worker-1': {
      thought: 'Gateway request timed out (504). Initiating idempotent retry with backoff 💳',
      currentTask: 'Retry Gateway Request with Idempotency Key',
      activeTool: 'RETRY_GATEWAY'
    },
    'worker-2': {
      thought: 'Verifying checkout state remains reserved during gateway retry 📦',
      currentTask: 'Maintain Cart Reservation Lock',
      activeTool: 'LOCK_RESOURCES'
    },
    'worker-3': {
      thought: 'Policy synthesis: Maximum 3 retries before failover to manual review 🧠',
      currentTask: 'Evaluate Retry Resilience Policy',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 5 & 13 -> Retry succeeded, settlement verified safely 🛡️',
      currentTask: 'Verify Outcome After Resilient Retry',
      activeTool: 'INDEPENDENT_VERIFICATION'
    }
  },
  SCENARIO_8_ORDER_EXISTS: {
    'worker-1': {
      thought: 'Banking gateway confirms payment TXN987654 settled successfully 💳',
      currentTask: 'Verify Settlement State',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'Database lookup: Order ORD-9921 already exists and is in packaging 📦',
      currentTask: 'Verify Existing Order Status',
      activeTool: 'CHECK_ORDER'
    },
    'worker-3': {
      thought: 'Policy check: Send order tracking link to customer, no modification needed 🧠',
      currentTask: 'Synthesize Customer Order Update',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 6 -> No duplicate order created, status confirmed 🛡️',
      currentTask: 'Audit Order Record & Notify Customer',
      activeTool: 'INDEPENDENT_VERIFICATION'
    }
  },
  SCENARIO_9_PAYMENT_NOT_FOUND: {
    'worker-1': {
      thought: 'Gateway returns NOT_FOUND for claimed transaction reference TXN000000 💳',
      currentTask: 'Query Banking Gateway & Reconciliation Logs',
      activeTool: 'CHECK_PAYMENT'
    },
    'worker-2': {
      thought: 'No matching payment authorization found in system database 📦',
      currentTask: 'Search Unmatched Payment Logs',
      activeTool: 'CHECK_ORDER'
    },
    'worker-3': {
      thought: 'Policy synthesis: Request customer proof of debit / bank statement 🧠',
      currentTask: 'Synthesize Information Request Policy',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 2 & 12 -> Escalated for human verification with bank logs 🛡️',
      currentTask: 'Generate Bank Dispute Escalation Docket',
      activeTool: 'ESCALATE_TO_HUMAN'
    }
  },
  SCENARIO_10_BACKGROUND_RECON: {
    'worker-1': {
      thought: 'Background daemon detected orphan payment TXN-ORPHAN-8891 💳',
      currentTask: 'Identify Orphan Banking Gateway Settlement',
      activeTool: 'SCAN_ORPHANS'
    },
    'worker-2': {
      thought: 'Matched orphan payment to abandoned cart session CHK-RS-77210 📦',
      currentTask: 'Match Payment to Customer Cart Attempt',
      activeTool: 'MATCH_CART'
    },
    'worker-3': {
      thought: 'Proactive policy: Open automated recovery case and notify customer 🧠',
      currentTask: 'Synthesize Proactive Customer Recovery Action',
      activeTool: 'QUERY_COGNEE'
    },
    'worker-4': {
      thought: 'Enforcing Rule 10 & 13 -> Proactive case opened, 100% verified 🛡️',
      currentTask: 'Open Case & Audit Proactive Event Stream',
      activeTool: 'INDEPENDENT_VERIFICATION'
    }
  }
};

export const TECH_THOUGHTS = [
  'Verifying banking gateway webhook signature...',
  'Checking stock reservation in PostgreSQL database...',
  'Querying Cognee knowledge layer for return policy...',
  'Enforcing 13 deterministic business rules...',
  'Validating idempotency key to prevent double recovery...',
  'Simulating provider refund payout lifecycle...',
  'Independent post-action outcome verification...',
  'One teammate. One case. A verified outcome.',
];

export const PRESET_TASKS = [
  {
    id: 'task-preset-1',
    title: 'Verify Banking Gateway Settlement',
    type: 'Payment',
    priority: 'High',
    duration: 5,
    points: 90,
    tags: ['Gateway', 'API', 'Security']
  },
  {
    id: 'task-preset-2',
    title: 'Check Warehouse Inventory Stock',
    type: 'Inventory',
    priority: 'High',
    duration: 4,
    points: 80,
    tags: ['Stock', 'Checkout', 'PostgreSQL']
  },
  {
    id: 'task-preset-3',
    title: 'Query Cognee Store Return Policies',
    type: 'Knowledge',
    priority: 'Medium',
    duration: 6,
    points: 75,
    tags: ['Cognee', 'n8n', 'Policies']
  },
  {
    id: 'task-preset-4',
    title: 'Validate 13 Deterministic Business Rules',
    type: 'Verification',
    priority: 'Critical',
    duration: 8,
    points: 120,
    tags: ['Rules', 'Idempotency', 'Audit']
  }
];

export const CODE_SNIPPETS = [
  `// AI Proposes. Code Decides.
const outcome = await enforceDeterministicRules({
  caseId: 'RS-4471',
  idempotencyKey: 'RECOVERY-RS4471',
  paymentRef: 'TXN987654'
});`,
  `// Verify gateway settlement without double-charge
async function recoverOrderSafely(payment, checkout) {
  const stock = await checkStock(checkout.productId);
  if (stock > 0) return await createLinkedOrder(payment);
}`
];

export const GIT_MESSAGES = [
  { message: 'gateway: validated payment reference TXN987654 (₹799 SUCCESS)', branch: 'gateway/payment-verification', author: 'Maya Lin', hash: 'a8f10b2', time: 'Just now' },
  { message: 'inventory: checked warehouse stock (10 units Wireless Headset)', branch: 'inventory/stock-lock-engine', author: 'Alex Chen', hash: 'c9d21e4', time: '1m ago' },
  { message: 'cognee: synthesized store policy for missing order recovery', branch: 'cognee/policy-synthesis', author: 'Samira Khan', hash: 'f1e40a8', time: '2m ago' },
  { message: 'rules: enforced idempotency key RECOVERY-RS4471', branch: 'rules/deterministic-verifier', author: 'Marcus Vance', hash: 'b4a819c', time: '3m ago' },
];
