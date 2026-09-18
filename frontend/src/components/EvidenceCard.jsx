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
          bg: 'bg-lime-100 text-lime-800 border-lime-300',
          icon: CheckCircle2,
          label: status
        };
      case 'NOT_FOUND':
      case 'UNAVAILABLE':
      case 'FAILED':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
          label: status
        };
      case 'PENDING':
      case 'IN_PROGRESS':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock,
          label: status
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: FileText,
          label: status || 'UNKNOWN'
        };
    }
  };

  const badge = getStatusBadge();
  const IconComponent = badge.icon;

  return (
    <div className="bg-white border border-lime-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h4>
        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-lg border ${badge.bg}`}>
          <IconComponent className="w-3 h-3" />
          <span>{badge.label}</span>
        </span>
      </div>

      <div className="space-y-2">
        {details.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs">
            <span className="text-slate-500">{item.label}</span>
            <span className="font-mono text-slate-900 font-semibold">{item.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

