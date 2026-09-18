import React from 'react';
import { Terminal } from 'lucide-react';
import { formatActualTime } from '../utils/dateUtils';

export const TelemetryLog = ({ actions = [], maxItems = 15 }) => {
  return (
    <div className="bg-white border border-lime-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-lime-50/80 px-4 py-2.5 border-b border-lime-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-lime-700" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Internal Activity Telemetry
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-lime-600 animate-ping" />
          <span className="text-[11px] font-mono text-lime-800 font-bold">LIVE STREAM</span>
        </div>
      </div>

      <div className="p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
        {actions.length === 0 ? (
          <div className="text-slate-400 italic py-4 text-center">
            No system actions dispatched yet.
          </div>
        ) : (
          actions.slice(0, maxItems).map((act, idx) => (
            <div
              key={act.id || idx}
              className="flex items-start space-x-2.5 text-slate-800 bg-lime-50/40 p-2.5 rounded-xl border border-lime-200/80 hover:border-lime-400 transition-colors"
            >
              <span className="text-slate-400 shrink-0 font-mono">
                {formatActualTime(act.created_at)}
              </span>
              <span className="text-lime-800 font-bold shrink-0">{act.requested_by}</span>
              <span className="text-slate-400 shrink-0">→</span>
              <span className="text-lime-700 font-semibold">{act.action_type}</span>
              <span className="text-slate-400 shrink-0">→</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  act.status === 'SUCCESS'
                    ? 'bg-lime-100 text-lime-800 border border-lime-300'
                    : act.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {act.status}
              </span>
              {act.provider_reference && (
                <span className="text-slate-500 truncate">[{act.provider_reference}]</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
