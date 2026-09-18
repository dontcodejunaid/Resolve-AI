import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { ShieldCheck, UserCheck, FlaskConical } from 'lucide-react';

export const SimulatedBadge = () => {
  const { user, switchAccount } = useAuth();

  const demoAccounts = [
    { label: 'Rahul (Customer 1)', email: 'rahul@example.com', role: 'customer' },
    { label: 'Aisha (Customer 2 - Refund Demo)', email: 'aisha@example.com', role: 'customer' },
    { label: 'Arjun (Customer 3 - Pending Demo)', email: 'arjun@example.com', role: 'customer' },
    { label: 'Support Specialist (Employee)', email: 'agent@resolveai.com', role: 'employee' },
    { label: 'Store Manager (Merchant/Approver)', email: 'manager@resolvestore.com', role: 'merchant' },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center space-x-2 text-amber-400 font-medium">
        <FlaskConical className="w-3.5 h-3.5 animate-pulse" />
        <span className="tracking-wider uppercase font-semibold">Simulated Payment Environment</span>
        <span className="text-slate-500 font-normal hidden sm:inline">| Zero Real Financial Movement</span>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            <span className="text-slate-400">Acting as:</span>
            <span className="font-semibold text-blue-400">{user.full_name}</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase bg-blue-900/50 text-blue-300 rounded border border-blue-700/50">
              {user.role}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 hidden md:inline">Quick Switch:</span>
          <select
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded px-2 py-0.5 outline-none focus:border-blue-500 cursor-pointer"
            value={user?.email || ''}
            onChange={(e) => switchAccount(e.target.value)}
          >
            {demoAccounts.map((acc) => (
              <option key={acc.email} value={acc.email}>
                {acc.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
