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

export const CaseTimeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No case events recorded yet.
      </div>
    );
  }

  const getActorBadge = (actorType) => {
    switch (actorType?.toUpperCase()) {
      case 'AI':
        return {
          icon: Bot,
          bg: 'bg-lime-100 text-lime-800 border-lime-300',
          dot: 'bg-lime-600',
          label: 'Resolve AI'
        };
      case 'PROVIDER':
        return {
          icon: CreditCard,
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
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
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-lime-200">
      {events.map((event, index) => {
        const actor = getActorBadge(event.actor_type);
        const IconComponent = actor.icon;
        const isResolved = event.event_type === 'CASE_RESOLVED' || event.event_type === 'RECOVERY_VERIFIED';

        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                isResolved
                  ? 'bg-lime-500 border-lime-400 text-black shadow-md shadow-lime-500/30'
                  : 'bg-white border-lime-300 text-slate-700'
              }`}
            >
              {isResolved ? (
                <CheckCircle className="w-3.5 h-3.5 font-bold" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${actor.dot}`} />
              )}
            </div>

            {/* Event Content Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-lime-50/70 border-lime-400 shadow-sm'
                  : 'bg-white border-lime-200 hover:border-lime-400 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase rounded-lg border ${actor.bg}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{actor.label}</span>
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-900">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {event.description}
              </p>

              {event.event_payload && Object.keys(event.event_payload).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-lime-100/80">
                  <div className="font-mono text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700 overflow-x-auto">
                    {JSON.stringify(event.event_payload, null, 2)}
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
