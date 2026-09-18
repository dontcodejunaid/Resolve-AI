import React from 'react';
import { Terminal, Activity, ArrowRight } from 'lucide-react';

export const TelemetryLog = ({ actions = [], maxItems = 15 }) => {
  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            Internal Activity Telemetry
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono text-emerald-400 font-medium">LIVE STREAM</span>
        </div>
      </div>

      <div className="p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
        {actions.length === 0 ? (
          <div className="text-slate-600 italic py-4 text-center">
            No system actions dispatched yet.
          </div>
        ) : (
          actions.slice(0, maxItems).map((act, idx) => (
            <div
              key={act.id || idx}
              className="flex items-start space-x-2.5 text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-850 hover:border-slate-750"
            >
              <span className="text-slate-500 shrink-0">
                {new Date(act.created_at).toLocaleTimeString([], { hour12: false })}
              </span>
              <span className="text-purple-400 font-bold shrink-0">{act.requested_by}</span>
              <span className="text-slate-600 shrink-0">→</span>
              <span className="text-blue-400 font-semibold">{act.action_type}</span>
              <span className="text-slate-600 shrink-0">→</span>
              <span
                className={`px-1 rounded text-[10px] font-bold ${
                  act.status === 'SUCCESS'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : act.status === 'PENDING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}
              >
                {act.status}
              </span>
              {act.provider_reference && (
                <span className="text-slate-400 truncate">[{act.provider_reference}]</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
