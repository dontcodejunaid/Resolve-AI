import React from 'react';
import { CheckCircle2, Clock, Search, AlertCircle, ArrowRight } from 'lucide-react';

export const InvestigationSteps = ({ currentStatus, events = [] }) => {
  const eventTypes = events.map(e => e.event_type);

  const steps = [
    {
      id: 'PAYMENT',
      label: 'Payment Check',
      done: eventTypes.includes('PAYMENT_VERIFIED') || eventTypes.includes('PAYMENT_CHECK_COMPLETED') || eventTypes.includes('COMPLAINT_RECEIVED'),
      active: currentStatus === 'INVESTIGATING' && !eventTypes.includes('PAYMENT_VERIFIED'),
    },
    {
      id: 'CHECKOUT',
      label: 'Checkout Check',
      done: eventTypes.includes('CHECKOUT_FOUND') || eventTypes.includes('PAYMENT_VERIFIED'),
      active: eventTypes.includes('PAYMENT_CHECK_STARTED') && !eventTypes.includes('CHECKOUT_FOUND'),
    },
    {
      id: 'ORDER',
      label: 'Order Check',
      done: eventTypes.includes('ORDER_SEARCHED') || eventTypes.includes('ORDER_FOUND') || eventTypes.includes('ORDER_NOT_FOUND'),
      active: eventTypes.includes('CHECKOUT_FOUND') && !eventTypes.includes('ORDER_NOT_FOUND') && !eventTypes.includes('ORDER_FOUND'),
    },
    {
      id: 'STOCK',
      label: 'Stock Check',
      done: eventTypes.includes('STOCK_CHECKED'),
      active: eventTypes.includes('ORDER_NOT_FOUND') && !eventTypes.includes('STOCK_CHECKED'),
    },
    {
      id: 'REFUND',
      label: 'Refund Check',
      done: eventTypes.includes('REFUND_FOUND') || eventTypes.includes('REFUND_CHECKED') || eventTypes.includes('STOCK_CHECKED'),
      active: false,
    },
    {
      id: 'DECISION',
      label: 'AI Decision',
      done: ['WAITING_FOR_CUSTOMER', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_PROVIDER', 'ACTION_IN_PROGRESS', 'VERIFYING', 'RESOLVED', 'ESCALATED'].includes(currentStatus),
      active: currentStatus === 'INVESTIGATING',
    }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Search className="w-4 h-4 text-blue-400" />
          <span>Cross-System Investigation Pipeline</span>
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
          Autonomous Telemetry
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
              step.done
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : step.active
                ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 ring-1 ring-blue-500/40 animate-pulse'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider">0{idx + 1}</span>
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : step.active ? (
                <Clock className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              )}
            </div>
            <span className="text-xs font-medium leading-tight">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
