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
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'WAITING_FOR_APPROVAL':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50 ring-1 ring-amber-500/30';
      case 'ESCALATED':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/50 ring-1 ring-purple-500/30';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-blue-950/60 text-blue-300 border-blue-700/50';
      case 'WAITING_FOR_PROVIDER':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Support Specialist Operations</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-950 text-purple-400 border border-purple-800 rounded">
              Employee Console
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review autonomous AI decisions, pending policy approvals, and escalated edge cases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/employee/approvals"
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Pending Approvals ({approvalsCount})</span>
          </Link>

          <button
            onClick={fetchCases}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
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
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Approval</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{approvalsCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('ESCALATED')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Human Escalations</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">{escalatedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{inProgressCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('RESOLVED')}
          className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 p-5 rounded-2xl cursor-pointer transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{resolvedCount}</div>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">
            Case Queue ({filteredCases.length} records)
          </h2>

          <div className="flex items-center space-x-2 text-xs">
            {['ALL', 'APPROVAL', 'ESCALATED', 'ACTIVE', 'RESOLVED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg font-mono font-medium transition-all ${
                  statusFilter === tab ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-sm">
            Loading queue...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No cases match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-400">
                      #{c.case_number}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200">{c.customer?.full_name || c.customer_id}</span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-300" title={c.customer_request}>
                      {c.customer_request}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded border uppercase ${getStatusBadge(c.status)}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {c.resolution_type || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/employee/cases/${c.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded font-semibold transition-all"
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
