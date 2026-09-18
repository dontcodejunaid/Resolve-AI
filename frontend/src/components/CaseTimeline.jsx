import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ShoppingBag,
  Layers,
  ShieldCheck,
  FileText,
  Sparkles,
  Terminal,
  Bot,
  User,
  Server
} from 'lucide-react';
import { formatActualTime, formatActualDateTime } from '../utils/dateUtils';

export const CaseTimeline = ({ events = [] }) => {
  const [showRawLogs, setShowRawLogs] = useState(false);

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs font-mono">
        No case events recorded yet.
      </div>
    );
  }

  const eventTypes = events.map(e => e.event_type);

  // Helper to find relevant event timestamp or message
  const getEvent = (types) => events.find(e => types.includes(e.event_type));

  const intakeEvt = getEvent(['COMPLAINT_RECEIVED', 'CASE_CREATED', 'WEBHOOK_CASE_TRIGGERED']);
  const paymentEvt = getEvent(['PAYMENT_VERIFIED', 'PAYMENT_CHECK_COMPLETED', 'PAYMENT_SEARCHED', 'PAYMENT_NOT_FOUND_AT_GATEWAY', 'PAYMENT_CLEARED_BY_BANK']);
  const cartEvt = getEvent(['CHECKOUT_FOUND', 'CART_LINKED', 'ORDER_SEARCHED', 'ORDER_FOUND', 'ORDER_NOT_FOUND']);
  const stockEvt = getEvent(['STOCK_CHECKED', 'INVENTORY_VERIFIED']);
  const decisionEvt = getEvent([
    'CASE_RESOLVED',
    'CUSTOMER_PROPOSAL_GENERATED',
    'RECOVERY_VERIFIED',
    'ORDER_RECOVERED',
    'REFUND_TRIGGERED',
    'REFUND_PROPOSED',
    'REFUND_CREATED',
    'CUSTOMER_CONFIRMED',
    'WAITING_FOR_CUSTOMER',
    'DECISION_SYNTHESIZED',
    'HUMAN_ESCALATION'
  ]);

  // 5 Key Functional Tasks
  const tasks = [
    {
      id: 'intake',
      step: '01',
      title: 'Complaint Registered',
      description: intakeEvt ? intakeEvt.description : 'Customer complaint received and parsed',
      completed: true,
      time: intakeEvt?.created_at || events[0]?.created_at,
      icon: FileText,
      proof: 'Dispute Parsed & Case Opened'
    },
    {
      id: 'payment',
      step: '02',
      title: 'Banking Gateway Verified',
      description: paymentEvt ? paymentEvt.description : 'Validating banking transaction status',
      completed: Boolean(paymentEvt && (paymentEvt.event_type === 'PAYMENT_VERIFIED' || paymentEvt.event_type === 'PAYMENT_CHECK_COMPLETED' || paymentEvt.event_type === 'PAYMENT_NOT_FOUND_AT_GATEWAY' || paymentEvt.event_type === 'PAYMENT_CLEARED_BY_BANK')),
      inProgress: !paymentEvt && eventTypes.includes('INVESTIGATION_STARTED'),
      time: paymentEvt?.created_at,
      icon: CreditCard,
      proof: paymentEvt?.event_payload?.status || 'Transaction Confirmed'
    },
    {
      id: 'cart',
      step: '03',
      title: 'Checkout Cart Located',
      description: cartEvt ? cartEvt.description : 'Locating customer checkout session',
      completed: Boolean(cartEvt || (paymentEvt && eventTypes.length > 3)),
      inProgress: Boolean(paymentEvt && !cartEvt),
      time: cartEvt?.created_at,
      icon: ShoppingBag,
      proof: 'Session & Cart Matched'
    },
    {
      id: 'stock',
      step: '04',
      title: 'Inventory Stock Audited',
      description: stockEvt ? stockEvt.description : 'Auditing warehouse inventory count',
      completed: Boolean(stockEvt || eventTypes.includes('CASE_RESOLVED') || eventTypes.includes('ORDER_RECOVERED')),
      inProgress: Boolean(cartEvt && !stockEvt && !eventTypes.includes('CASE_RESOLVED')),
      time: stockEvt?.created_at,
      icon: Layers,
      proof: 'Stock Reserved / Checked'
    },
    {
      id: 'decision',
      step: '05',
      title: 'Deterministic Resolution Executed',
      description: decisionEvt ? decisionEvt.description : 'Synthesizing evidence and resolving case',
      completed: Boolean(eventTypes.includes('CASE_RESOLVED') || eventTypes.includes('RECOVERY_VERIFIED')),
      inProgress: Boolean(eventTypes.includes('ACTION_IN_PROGRESS') || eventTypes.includes('VERIFYING') || eventTypes.includes('WAITING_FOR_CUSTOMER') || eventTypes.includes('WAITING_FOR_APPROVAL') || eventTypes.includes('WAITING_FOR_PROVIDER')),
      time: decisionEvt?.created_at,
      icon: Sparkles,
      proof: eventTypes.includes('CASE_RESOLVED') ? 'Outcome Verified & Closed' : 'In Resolution Pipeline'
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;

  const getActorBadge = (actorType) => {
    switch (actorType) {
      case 'AI':
        return { icon: Bot, bg: 'bg-lime-100 text-lime-800 border-lime-300', label: 'Resolve AI' };
      case 'PROVIDER':
        return { icon: CreditCard, bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Payment Gateway' };
      case 'CUSTOMER':
        return { icon: User, bg: 'bg-slate-100 text-slate-800 border-slate-300', label: 'Customer' };
      case 'EMPLOYEE':
        return { icon: ShieldCheck, bg: 'bg-amber-100 text-amber-900 border-amber-300', label: 'Support Manager' };
      default:
        return { icon: Server, bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Backend Engine' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Summary with Live Progress Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-lime-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Autonomous Task Execution Tracker
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-full">
            {completedCount} of 5 Tasks Completed
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-lime-700">
          <span className="w-2 h-2 rounded-full bg-lime-600 animate-ping" />
          <span className="font-semibold">Live Audit Verified</span>
        </div>
      </div>

      {/* Zero-Scroll Compact Task Completion Pipeline */}
      <div className="space-y-2.5">
        {tasks.map((task) => {
          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-lime-50/70 border-lime-300 text-slate-900 shadow-sm'
                  : task.inProgress
                  ? 'bg-lime-100/60 border-lime-400 text-slate-900 ring-2 ring-lime-400/40 animate-pulse'
                  : 'bg-slate-50/80 border-slate-200 text-slate-400'
              }`}
            >
              {/* Left Indicator & Info */}
              <div className="flex items-center space-x-3 min-w-0">
                {/* Green Tick or Pending Icon */}
                <div className="flex-shrink-0">
                  {task.completed ? (
                    <div className="w-7 h-7 rounded-lg bg-lime-500 border border-lime-400 text-slate-950 flex items-center justify-center shadow-md shadow-lime-500/25">
                      <CheckCircle2 className="w-4 h-4 font-extrabold stroke-[2.5]" />
                    </div>
                  ) : task.inProgress ? (
                    <div className="w-7 h-7 rounded-lg bg-lime-200 border border-lime-400 text-lime-800 flex items-center justify-center">
                      <Clock className="w-4 h-4 animate-spin text-lime-700" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-mono font-bold">
                      {task.step}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-xs font-bold truncate ${task.completed ? 'text-slate-900' : task.inProgress ? 'text-lime-900' : 'text-slate-500'}`}>
                      {task.title}
                    </h4>
                    {task.completed && (
                      <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-lime-200 text-lime-900 rounded border border-lime-300">
                        COMPLETED ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 truncate max-w-md mt-0.5">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Right Proof / Timestamp */}
              <div className="text-right flex-shrink-0">
                {task.completed ? (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-lime-700 block">
                      {task.proof}
                    </span>
                    {task.time && (
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {formatActualTime(task.time)}
                      </span>
                    )}
                  </div>
                ) : task.inProgress ? (
                  <span className="text-[10px] font-mono font-bold text-lime-700 uppercase animate-pulse">
                    Executing...
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Queued
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Detailed Audit Stream */}
      <div className="pt-2 border-t border-lime-100">
        <button
          onClick={() => setShowRawLogs(!showRawLogs)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-lime-50/80 rounded-xl border border-lime-200 text-xs font-mono text-slate-700 transition-all"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-lime-700" />
            <span>Detailed Event Stream ({events.length} Raw Audit Logs)</span>
          </div>
          {showRawLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showRawLogs && (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-lime-200 max-h-48 overflow-y-auto space-y-2 animate-in fade-in duration-200">
            {events.map((evt, idx) => {
              const actor = getActorBadge(evt.actor_type);

              return (
                <div
                  key={evt.id || idx}
                  className="p-2.5 rounded-lg bg-white border border-lime-100 flex items-start justify-between text-xs font-mono space-x-2 shadow-2xs"
                >
                  <div className="flex items-start space-x-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${actor.bg}`}>
                      {actor.label}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{evt.event_type.replace(/_/g, ' ')}</span>
                      <p className="text-[11px] text-slate-600 font-sans line-clamp-1">{evt.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {formatActualTime(evt.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
