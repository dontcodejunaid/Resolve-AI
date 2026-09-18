import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  ShieldAlert,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await client.get('/employee/cases');
      setCases(res.data);
    } catch (e) {
      console.error('Failed to load employee cases', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const approvalsCount = cases.filter(c => c.status === 'WAITING_FOR_APPROVAL').length;
  const escalatedCount = cases.filter(c => c.status === 'ESCALATED').length;
  const inProgressCount = cases.filter(c => ['INVESTIGATING', 'ACTION_IN_PROGRESS', 'VERIFYING'].includes(c.status)).length;
  const resolvedCount = cases.filter(c => c.status === 'RESOLVED').length;

  const filteredCases = cases.filter(c => {
    if (statusFilter === 'APPROVAL') return c.status === 'WAITING_FOR_APPROVAL';
    if (statusFilter === 'ESCALATED') return c.status === 'ESCALATED';
    if (statusFilter === 'ACTIVE') return c.status !== 'RESOLVED';
    if (statusFilter === 'RESOLVED') return c.status === 'RESOLVED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'WAITING_FOR_APPROVAL':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/40';
      case 'ESCALATED':
        return 'bg-rose-100 text-rose-900 border-rose-300 ring-1 ring-rose-400/40';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'WAITING_FOR_PROVIDER':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-lime-50/80 via-white to-lime-50/80 p-6 rounded-2xl border border-lime-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Specialist Operations</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-full">
              Employee Console
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Review autonomous AI decisions, pending policy approvals, and escalated edge cases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/employee/approvals"
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Pending Approvals ({approvalsCount})</span>
          </Link>

          <button
            onClick={fetchCases}
            className="p-2.5 bg-white hover:bg-lime-50 text-lime-800 rounded-xl border border-lime-200 shadow-sm transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('APPROVAL')}
          className="bg-white hover:bg-lime-50/40 border border-lime-200 hover:border-lime-400 p-5 rounded-2xl cursor-pointer transition-all space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Approval</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{approvalsCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('ESCALATED')}
          className="bg-white hover:bg-lime-50/40 border border-lime-200 hover:border-lime-400 p-5 rounded-2xl cursor-pointer transition-all space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Human Escalations</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">{escalatedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className="bg-white hover:bg-lime-50/40 border border-lime-200 hover:border-lime-400 p-5 rounded-2xl cursor-pointer transition-all space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-lime-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-lime-700">{inProgressCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className="bg-white hover:bg-lime-50/40 border border-lime-200 hover:border-lime-400 p-5 rounded-2xl cursor-pointer transition-all space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-lime-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-lime-700">{resolvedCount}</div>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-white border border-lime-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-lime-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            Case Queue ({filteredCases.length} records)
          </h2>

          <div className="flex items-center space-x-2 text-xs">
            {['ALL', 'APPROVAL', 'ESCALATED', 'ACTIVE', 'RESOLVED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  statusFilter === tab
                    ? 'bg-lime-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-lime-50 text-slate-600 hover:text-slate-900 border border-lime-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-lime-700 font-mono text-sm">
            Loading queue...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No cases match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lime-50/70 text-slate-700 uppercase font-mono border-b border-lime-200">
                <tr>
                  <th className="p-3.5">Case #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Complaint Summary</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Resolution</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lime-100 text-slate-900">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-lime-50/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-lime-700">
                      #{c.case_number}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900">{c.customer?.full_name || c.customer_id}</span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-600 font-medium" title={c.customer_request}>
                      {c.customer_request}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded border uppercase ${getStatusBadge(c.status)}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {c.resolution_type || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/employee/cases/${c.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-lime-50 hover:bg-lime-500 hover:text-slate-950 text-lime-800 rounded-lg font-semibold border border-lime-300 hover:border-lime-500 transition-all shadow-sm"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

