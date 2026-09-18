import React from 'react';
import {
  Bot,
  Server,
  User,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowDown
} from 'lucide-react';
import { formatTimeOnly } from '../utils/dateUtils';

export const CaseTimeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm font-mono">
        No case events recorded yet.
      </div>
    );
  }

  const getActorBadge = (actorType) => {
    switch (actorType?.toUpperCase()) {
      case 'AI':
        return {
          icon: Bot,
          bg: 'bg-lime-100 text-lime-900 border-lime-300',
          dot: 'bg-lime-600',
          label: 'Resolve AI'
        };
      case 'PROVIDER':
        return {
          icon: CreditCard,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'Payment Gateway'
        };
      case 'CUSTOMER':
        return {
          icon: User,
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-600',
          label: 'Customer'
        };
      case 'EMPLOYEE':
        return {
          icon: ShieldCheck,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-600',
          label: 'Support Manager'
        };
      default:
        return {
          icon: Server,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          label: 'Backend Engine'
        };
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const actor = getActorBadge(event.actor_type);
        const IconComponent = actor.icon;
        const isResolved = event.event_type === 'CASE_RESOLVED' || event.event_type === 'RECOVERY_VERIFIED';
        const isLast = index === events.length - 1;

        return (
          <div key={event.id || index} className="flex items-start space-x-3.5 relative group">
            {/* Left Track & Icon Node with Centered Connector Line */}
            <div className="flex flex-col items-center flex-shrink-0 self-stretch pt-0.5">
              {/* Node Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all z-10 ${
                  isResolved
                    ? 'bg-lime-500 border-lime-400 text-slate-950 shadow-md shadow-lime-500/30 ring-4 ring-lime-100'
                    : 'bg-white border-lime-300 text-slate-700 shadow-sm ring-4 ring-lime-50/80 group-hover:border-lime-400'
                }`}
              >
                {isResolved ? (
                  <CheckCircle className="w-4 h-4 font-bold text-slate-950" />
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${actor.dot}`} />
                )}
              </div>

              {/* Vertical connecting line to next event */}
              {!isLast && (
                <div className="w-[2px] bg-lime-200/90 flex-grow my-1 min-h-[28px]" />
              )}
            </div>

            {/* Event Content Card */}
            <div
              className={`flex-1 p-4 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-lime-50/80 border-lime-400 shadow-sm'
                  : 'bg-white border-lime-200 hover:border-lime-400 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase rounded-lg border ${actor.bg}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{actor.label}</span>
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-900 tracking-tight">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                </div>

                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {formatTimeOnly(event.created_at)}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {event.description}
              </p>

              {event.event_metadata && (
                <div className="mt-2.5 pt-2 border-t border-lime-100/80">
                  <div className="font-mono text-[10px] bg-slate-50/90 p-2 rounded-xl border border-slate-200 text-slate-700 overflow-x-auto">
                    {typeof event.event_metadata === 'string'
                      ? event.event_metadata
                      : JSON.stringify(event.event_metadata, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
