export const INITIAL_ENGINEERS = [
  {
    id: 'worker-1',
    name: 'Maya Lin',
    role: 'Payment & Gateway Sentinel',
    title: 'Senior Banking Gateway Specialist',
    level: 'AI Teammate 1',
    color: '#3b82f6', // blue
    image: '/workers/maya.jpg',
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
      { step: '04', name: 'Idempotent Order Recovery', desc: 'Creates recovered order and links payment without re-charging', status: 'IN_PROGRESS', tool: 'RECOVER_ORDER' },
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
