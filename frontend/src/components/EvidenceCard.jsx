import React from 'react';
import { CheckCircle2, XCircle, Clock, ShieldAlert, FileText } from 'lucide-react';

export const EvidenceCard = ({ title, status, details = [], verified = false, variant = 'default' }) => {
  const getStatusBadge = () => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'SUCCESS':
      case 'AVAILABLE':
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
          icon: CheckCircle2,
          label: status
        };
      case 'NOT_FOUND':
      case 'UNAVAILABLE':
      case 'FAILED':
        return {
          bg: 'bg-red-950/40 text-red-400 border-red-800/40',
          icon: XCircle,
          label: status
        };
      case 'PENDING':
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
          icon: Clock,
          label: status
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: FileText,
          label: status || 'UNKNOWN'
        };
    }
  };

  const badge = getStatusBadge();
  const IconComponent = badge.icon;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</h4>
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-medium rounded border ${badge.bg}`}>
          <IconComponent className="w-3 h-3" />
          <span>{badge.label}</span>
        </span>
      </div>

      <div className="space-y-1.5">
        {details.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="text-slate-400">{item.label}</span>
            <span className="font-mono text-slate-200 font-medium">{item.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
