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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pending Human Approvals</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Review high-value refunds and restricted actions flagged by policy thresholds.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="p-2.5 bg-white border border-lime-200 hover:bg-lime-50 text-lime-800 rounded-xl text-xs font-mono transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-lime-700 font-mono text-sm">
          Loading pending approval queue...
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white border border-lime-200 p-12 rounded-2xl text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-lime-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No Pending Approvals</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All AI-proposed financial actions have been reviewed or are within auto-authorized thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((appr) => (
            <div
              key={appr.id}
              className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg">
                    {appr.action_type}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    Amount: ₹{appr.amount} INR
                  </span>
                </div>

                <Link
                  to={`/employee/cases/${appr.case_id}`}
                  className="text-xs font-mono text-lime-700 hover:text-lime-900 font-semibold flex items-center space-x-1"
                >
                  <span>Inspect Case Telemetry</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-lime-50/60 p-4 rounded-xl border border-lime-200 space-y-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  AI Proposal Reason
                </span>
                <p className="text-sm text-slate-800 font-medium">{appr.reason}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Manager Decision Notes (e.g. Approved under policy exception)..."
                  value={decisionNotes[appr.id] || ''}
                  onChange={(e) => setDecisionNotes({ ...decisionNotes, [appr.id]: e.target.value })}
                  className="flex-1 bg-slate-50 border border-lime-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDecision(appr.id, true)}
                    disabled={actionLoading === appr.id}
                    className="flex-1 sm:flex-none bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-lime-500/20 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading === appr.id ? 'Processing...' : 'Approve Refund'}</span>
                  </button>

                  <button
                    onClick={() => handleDecision(appr.id, false)}
                    disabled={actionLoading === appr.id}
                    className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
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

