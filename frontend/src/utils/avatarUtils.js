/**
 * Centralized Avatar & Demo Profile Registry for RESOLVE AI
 * Provides verified local character avatars with fallback SVGs.
 */

export const PERSONA_AVATARS = {
  'rahul@example.com': {
    name: 'Rahul Sharma',
    role: 'Customer 1 (Recovery)',
    roleType: 'customer',
    avatar: '/avatars/rahul.svg',
    badge: 'C1',
    bgColor: 'bg-blue-600',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  'aisha@example.com': {
    name: 'Aisha Khan',
    role: 'Customer 2 (Refund/Stock)',
    roleType: 'customer',
    avatar: '/avatars/aisha.svg',
    badge: 'C2',
    bgColor: 'bg-pink-600',
    tagColor: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  'arjun@example.com': {
    name: 'Arjun Verma',
    role: 'Customer 3 (Pending)',
    roleType: 'customer',
    avatar: '/avatars/arjun.svg',
    badge: 'C3',
    bgColor: 'bg-orange-600',
    tagColor: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  'agent@resolveai.com': {
    name: 'Dev Specialist',
    role: 'Support Specialist',
    roleType: 'employee',
    avatar: '/avatars/dev_agent.svg',
    badge: 'OPS',
    bgColor: 'bg-purple-600',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  'manager@resolvestore.com': {
    name: 'Priya Patel',
    role: 'Store Manager',
    roleType: 'merchant',
    avatar: '/avatars/priya_manager.svg',
    badge: 'MGR',
    bgColor: 'bg-lime-600',
    tagColor: 'bg-lime-100 text-lime-900 border-lime-200',
  },
  'bank@gateway.com': {
    name: 'Bank Sentinel',
    role: 'Bank Gateway Provider',
    roleType: 'bank',
    avatar: '/avatars/bank_sentinel.svg',
    badge: 'BNK',
    bgColor: 'bg-sky-700',
    tagColor: 'bg-sky-100 text-sky-900 border-sky-200',
  },
  'ai@resolveai.com': {
    name: 'RESOLVE AI Engine',
    role: 'Autonomous AI Teammate',
    roleType: 'ai',
    avatar: '/avatars/resolve_ai.svg',
    badge: 'AI',
    bgColor: 'bg-emerald-600',
    tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
};

export const DEMO_PERSONAS_LIST = Object.entries(PERSONA_AVATARS).map(([email, data]) => ({
  email,
  ...data,
}));

/**
 * Returns the matching avatar URL or falls back to role/initials logic.
 */
export function getAvatarForUser(userOrEmail) {
  if (!userOrEmail) return '/avatars/resolve_ai.svg';
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;
  if (email && PERSONA_AVATARS[email]) {
    return PERSONA_AVATARS[email].avatar;
  }
  const role = typeof userOrEmail === 'object' ? userOrEmail.role : null;
  if (role === 'merchant') return '/avatars/priya_manager.svg';
  if (role === 'employee') return '/avatars/dev_agent.svg';
  if (role === 'bank') return '/avatars/bank_sentinel.svg';
  return '/avatars/rahul.svg';
}

/**
 * Returns persona metadata for a user or email.
 */
export function getPersonaData(userOrEmail) {
  if (!userOrEmail) return null;
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail.email;
  if (email && PERSONA_AVATARS[email]) {
    return PERSONA_AVATARS[email];
  }
  return null;
}
