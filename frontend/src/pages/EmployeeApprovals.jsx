import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { ShieldAlert, CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export const EmployeeApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await client.get('/employee/approvals');
      setApprovals(res.data);
    } catch (e) {
      console.error('Failed to load approvals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleDecision = async (approvalId, approved) => {
    setActionLoading(approvalId);
    try {
      const endpoint = approved
        ? `/employee/approvals/${approvalId}/approve`
        : `/employee/approvals/${approvalId}/reject`;

      await client.post(endpoint, {
        approved,
        decision_notes: decisionNotes[approvalId] || (approved ? 'Manager approved per policy threshold' : 'Rejected by manager')
      });
      await fetchApprovals();
    } catch (err) {
      console.error('Failed approval decision', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Pending Human Approvals</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800 rounded">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review high-value refunds and restricted actions flagged by policy thresholds.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 font-mono text-sm">
          Loading pending approval queue...
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 p-12 rounded-2xl text-center space-y-3 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Pending Approvals</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All AI-proposed financial actions have been reviewed or are within auto-authorized thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((appr) => (
            <div
              key={appr.id}
              className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60 rounded">
                    {appr.action_type}
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    Amount: ₹{appr.amount} INR
                  </span>
                </div>

                <Link
                  to={`/employee/cases/${appr.case_id}`}
                  className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Inspect Case Telemetry</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  AI Proposal Reason
                </span>
                <p className="text-sm text-slate-200">{appr.reason}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Manager Decision Notes (e.g. Approved under policy exception)..."
                  value={decisionNotes[appr.id] || ''}
                  onChange={(e) => setDecisionNotes({ ...decisionNotes, [appr.id]: e.target.value })}
                  className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDecision(appr.id, true)}
                    disabled={actionLoading === appr.id}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading === appr.id ? 'Processing...' : 'Approve Refund'}</span>
                  </button>

                  <button
                    onClick={() => handleDecision(appr.id, false)}
                    disabled={actionLoading === appr.id}
                    className="flex-1 sm:flex-none bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
