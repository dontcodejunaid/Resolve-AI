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
      <div className="text-center py-8 text-slate-500 text-sm">
        No case events recorded yet.
      </div>
    );
  }

  const getActorBadge = (actorType) => {
    switch (actorType?.toUpperCase()) {
      case 'AI':
        return {
          icon: Bot,
          bg: 'bg-purple-950/40 text-purple-400 border-purple-800/40',
          dot: 'bg-purple-500',
          label: 'Resolve AI'
        };
      case 'PROVIDER':
        return {
          icon: CreditCard,
          bg: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
          dot: 'bg-cyan-500',
          label: 'Payment Gateway'
        };
      case 'CUSTOMER':
        return {
          icon: User,
          bg: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
          dot: 'bg-blue-500',
          label: 'Customer'
        };
      case 'EMPLOYEE':
        return {
          icon: ShieldCheck,
          bg: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
          dot: 'bg-amber-500',
          label: 'Support Manager'
        };
      default:
        return {
          icon: Server,
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          label: 'Backend Engine'
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
      {events.map((event, index) => {
        const actor = getActorBadge(event.actor_type);
        const IconComponent = actor.icon;
        const isLast = index === events.length - 1;
        const isResolved = event.event_type === 'CASE_RESOLVED' || event.event_type === 'RECOVERY_VERIFIED';

        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                isResolved
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              {isResolved ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${actor.dot}`} />
              )}
            </div>

            {/* Event Content Card */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isResolved
                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-medium font-mono uppercase rounded border ${actor.bg}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{actor.label}</span>
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-200">
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {event.description}
              </p>

              {event.event_metadata && (
                <div className="mt-2 text-xs font-mono bg-slate-950/70 p-2 rounded border border-slate-800/80 text-slate-400 overflow-x-auto">
                  {event.event_metadata}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
