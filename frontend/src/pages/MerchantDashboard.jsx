import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  TrendingUp,
  Package,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertTriangle,
  ArrowRight,
  Clock,
  XCircle
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

export const MerchantDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, approvalsRes] = await Promise.all([
        client.get('/merchant/metrics'),
        client.get('/employee/approvals'),
      ]);
      setMetrics(metricsRes.data);
      setApprovals(approvalsRes.data);
    } catch (e) {
      console.error('Failed to load merchant data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprovalDecision = async (approvalId, approved) => {
    setActionLoading(approvalId);
    try {
      const endpoint = approved
        ? `/employee/approvals/${approvalId}/approve`
        : `/employee/approvals/${approvalId}/reject`;

      await client.post(endpoint, {
        approved,
        decision_notes: approved ? 'Store Manager approved refund per store policy' : 'Store Manager rejected action'
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed approval decision', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-lime-50/80 via-white to-lime-50/80 p-6 rounded-2xl border border-lime-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Merchant & Store Manager Console</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-full">
              Resolve Store
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Store policy configuration, pending refund approvals, real-time inventory management, and dispute metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/merchant/policies"
            className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-lime-500/20 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Policies</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white hover:bg-lime-50 text-lime-800 rounded-xl border border-lime-200 shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Approvals Section (Human-in-the-Loop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Pending Manager Approvals ({approvals.length})
            </h2>
            {approvals.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>

          <Link
            to="/employee/approvals"
            className="text-xs font-mono font-bold text-lime-700 hover:text-lime-900 flex items-center space-x-1"
          >
            <span>Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {approvals.length === 0 ? (
          <div className="bg-white border border-lime-200 p-8 rounded-2xl text-center space-y-2 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-lime-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">All Approvals Clear</h4>
            <p className="text-xs text-slate-500">No high-value actions or policy threshold flags currently waiting for review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvals.map((appr) => (
              <div
                key={appr.id}
                className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3.5 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg">
                    {appr.action_type}
                  </span>
                  <span className="text-base font-mono font-extrabold text-slate-900">
                    ₹{Number(appr.amount).toFixed(2)} INR
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-700 font-medium">
                    {appr.reason || 'High-value action exceeding policy threshold.'}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Flagged: {formatDateTime(appr.created_at)}
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/case/${appr.case_id}`}
                    className="text-xs font-mono font-bold text-lime-700 hover:text-lime-900 underline"
                  >
                    Inspect Case →
                  </Link>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprovalDecision(appr.id, false)}
                      disabled={actionLoading === appr.id}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovalDecision(appr.id, true)}
                      disabled={actionLoading === appr.id}
                      className="px-4 py-1.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-lime-500/25 transition-all flex items-center space-x-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 font-bold" />
                      <span>{actionLoading === appr.id ? 'Processing...' : 'Approve Refund'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-lime-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claims Processed</span>
          <div className="text-3xl font-mono font-extrabold text-slate-900">{metrics?.total_cases ?? '—'}</div>
        </div>

        <div className="bg-white border border-lime-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolution Rate</span>
          <div className="text-3xl font-mono font-extrabold text-lime-700">{metrics?.resolution_rate ?? '—'}</div>
        </div>

        <div className="bg-white border border-lime-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recovered Purchases</span>
          <div className="text-3xl font-mono font-extrabold text-emerald-700">{metrics?.recovery_resolutions ?? '—'}</div>
        </div>

        <div className="bg-white border border-lime-200 p-5 rounded-2xl space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Refunds Issued</span>
          <div className="text-3xl font-mono font-extrabold text-amber-700">{metrics?.refund_resolutions ?? '—'}</div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-lime-200 hover:border-lime-400 p-6 rounded-2xl shadow-sm hover:shadow-md space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Merchant Policy Engine</h3>
            <Sliders className="w-5 h-5 text-lime-700" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure automated order recovery permissions, refund limits, manager approval thresholds, and Cognee knowledge parameters.
          </p>
          <Link
            to="/merchant/policies"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-lime-700 hover:text-lime-900"
          >
            <span>Edit Policy Rules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-lime-200 hover:border-lime-400 p-6 rounded-2xl shadow-sm hover:shadow-md space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Product Inventory & Stock</h3>
            <Package className="w-5 h-5 text-lime-700" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Manage live stock counts. Test zero-stock refund triggers vs available stock recovery triggers in real time.
          </p>
          <Link
            to="/merchant/products"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-lime-700 hover:text-lime-900"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
