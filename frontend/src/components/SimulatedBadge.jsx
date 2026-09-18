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
    <div className="bg-lime-50/90 border-b border-lime-200/80 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center space-x-2 text-lime-800 font-medium">
        <FlaskConical className="w-3.5 h-3.5 animate-pulse text-lime-700" />
        <span className="tracking-wider uppercase font-bold text-[11px] text-lime-900">Simulated Payment Environment</span>
        <span className="text-slate-500 font-normal hidden sm:inline">| Zero Real Financial Movement</span>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2 bg-white px-2.5 py-0.5 rounded-lg border border-lime-200 shadow-sm">
            <span className="text-slate-500">Acting as:</span>
            <span className="font-semibold text-slate-900">{user.full_name}</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase bg-lime-100 text-lime-800 rounded border border-lime-300 font-bold">
              {user.role}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-1.5">
          <span className="text-slate-600 hidden md:inline font-medium">Quick Switch:</span>
          <select
            className="bg-white text-slate-800 border border-lime-300 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-lime-500 shadow-sm cursor-pointer"
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

