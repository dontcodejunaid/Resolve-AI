import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Package,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  Layers,
  Box,
  UserCheck,
  ShieldAlert,
  User,
  Building2
} from 'lucide-react';
import { CaseTimeline } from '../components/CaseTimeline';
import { InvestigationSteps } from '../components/InvestigationSteps';
import { EvidenceCard } from '../components/EvidenceCard';
import { ResolveAIWorkerFloor } from '../components/ResolveAIWorkerFloor';
import { formatActualDateTime, formatActualTime } from '../utils/dateUtils';

export const CaseDetail = () => {
  const { id } = useParams();
  const { user, switchAccount } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbiddenError, setForbiddenError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [switchingUser, setSwitchingUser] = useState(false);
  const [viewMode, setViewMode] = useState('workers'); // 'workers' | 'linear'
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  const fetchCase = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await client.get(`/cases/${id}`);
      setCaseData(res.data);
      setNotFound(false);
      setForbiddenError(false);
    } catch (e) {
      if (e.response && e.response.status === 403) {
        setForbiddenError(true);
        setNotFound(false);
        setCaseData(null);
      } else if (e.response && e.response.status === 404) {
        setNotFound(true);
        setForbiddenError(false);
        setCaseData(null);
      }
      console.error('Failed to load case details', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase(true);
    const interval = setInterval(() => {
      fetchCase(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [id, user?.id]);

  const handleQuickSwitch = async (email) => {
    setSwitchingUser(true);
    try {
      await switchAccount(email);
      setTimeout(() => {
        fetchCase(true);
      }, 300);
    } catch (err) {
      console.error('Failed to switch user', err);
    } finally {
      setSwitchingUser(false);
    }
  };

  const handleCustomerConfirmation = async (accepted) => {
    setActionLoading(true);
    try {
      const res = await client.post(`/cases/${id}/customer-confirmation`, {
        accepted,
        notes: accepted ? 'Customer confirmed order recovery' : 'Customer declined recovery'
      });
      setCaseData(res.data);
    } catch (e) {
      console.error('Confirmation error', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManagerApproval = async (approved) => {
    setActionLoading(true);
    try {
      // Find pending approval for this case
      const approval = caseData.approvals?.find((a) => a.status === 'PENDING') || caseData.approvals?.[0];
      if (approval) {
        if (user?.role === 'customer') {
          await switchAccount('manager@resolvestore.com');
        }
        const endpoint = approved
          ? `/employee/approvals/${approval.id}/approve`
          : `/employee/approvals/${approval.id}/reject`;

        await client.post(endpoint, {
          approved,
          decision_notes: approved ? 'Manager approved high-value refund per policy threshold' : 'Manager rejected action'
        });
      }
      // Re-fetch updated case with new status & timeline
      await fetchCase(true);
    } catch (e) {
      console.error('Manager approval error', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStepRefundVerification = async () => {
    setActionLoading(true);
    try {
      if (user?.role === 'customer') {
        await switchAccount('manager@resolvestore.com');
      }
      await client.post(`/employee/cases/${id}/step-refund`);
      await fetchCase(true);
    } catch (e) {
      console.error('Step refund error', e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || switchingUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-lime-700 font-mono text-sm">
        {switchingUser ? 'Switching demo user session...' : 'Retrieving case telemetry...'}
      </div>
    );
  }

  if (forbiddenError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-14 h-14 bg-amber-100 border border-amber-300 rounded-2xl mx-auto flex items-center justify-center text-amber-800 shadow-sm">
          <ShieldAlert className="w-7 h-7 text-amber-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900">Deterministic Rule 1 Enforced: Customer Data Isolation</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This case belongs to another customer account. Under deterministic rule 1, customers cannot inspect records owned by other users.
          </p>
          <p className="text-xs font-mono text-lime-800 bg-lime-50 py-1.5 px-3 rounded-lg border border-lime-200 inline-block">
            Logged in as: <span className="font-bold">{user?.full_name || user?.email}</span> ({user?.role})
          </p>
        </div>

        <div className="bg-white border border-lime-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            1-Click Switch Demo Persona
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickSwitch('aisha@example.com')}
              className="flex items-center justify-between p-3 rounded-xl border border-lime-300 bg-lime-50 hover:bg-lime-100 text-left transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-lime-800">Aisha Khan (Customer 2)</div>
                <div className="text-[11px] text-slate-500 font-mono">aisha@example.com · Scenario 2 Owner</div>
              </div>
              <User className="w-4 h-4 text-lime-700 shrink-0" />
            </button>

            <button
              onClick={() => handleQuickSwitch('rahul@example.com')}
              className="flex items-center justify-between p-3 rounded-xl border border-lime-200 bg-white hover:bg-lime-50 text-left transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-lime-800">Rahul Sharma (Customer 1)</div>
                <div className="text-[11px] text-slate-500 font-mono">rahul@example.com · Scenario 1 Owner</div>
              </div>
              <User className="w-4 h-4 text-slate-400 group-hover:text-lime-700 shrink-0" />
            </button>

            <button
              onClick={() => handleQuickSwitch('arjun@example.com')}
              className="flex items-center justify-between p-3 rounded-xl border border-lime-200 bg-white hover:bg-lime-50 text-left transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-lime-800">Arjun Verma (Customer 3)</div>
                <div className="text-[11px] text-slate-500 font-mono">arjun@example.com · Scenario 3 Owner</div>
              </div>
              <User className="w-4 h-4 text-slate-400 group-hover:text-lime-700 shrink-0" />
            </button>

            <button
              onClick={() => handleQuickSwitch('agent@resolveai.com')}
              className="flex items-center justify-between p-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-left transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">Dev Specialist (Agent)</div>
                <div className="text-[11px] text-amber-700 font-mono">agent@resolveai.com · Support Access</div>
              </div>
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            </button>

            <button
              onClick={() => handleQuickSwitch('bank@gateway.com')}
              className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">Bank Provider Sentinel</div>
                <div className="text-[11px] text-emerald-700 font-mono">bank@gateway.com · Gateway Provider</div>
              </div>
              <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Link to="/demo" className="text-lime-700 hover:text-lime-900 text-sm font-semibold">
            ← Return to Demo Lab
          </Link>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Case Not Found</h2>
        <div className="flex items-center justify-center space-x-4 text-sm font-semibold">
          <Link to="/dashboard" className="text-lime-700 hover:text-lime-900">
            Return to Dashboard
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/demo" className="text-lime-700 hover:text-lime-900">
            Go to Demo Lab
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-lime-100 text-lime-900 border-lime-400 animate-pulse';
      case 'WAITING_FOR_APPROVAL':
      case 'WAITING_FOR_PROVIDER':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ESCALATED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-lime-100 text-lime-800 border-lime-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode('workers')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'workers' ? 'bg-lime-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              AI Teammates Floor
            </button>
            <button
              onClick={() => setViewMode('linear')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'linear' ? 'bg-lime-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Linear Steps
            </button>
          </div>

          <button
            onClick={() => fetchCase(false)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-lime-200 hover:border-lime-400 text-lime-800 rounded-lg text-xs font-mono shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-lime-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-mono font-extrabold text-lime-700">
              #{caseData.case_number}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg border ${getStatusBadgeClass(
                caseData.status
              )}`}
            >
              {caseData.status.replace(/_/g, ' ')}
            </span>
            {caseData.resolution_type && (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-lime-50 text-lime-900 border border-lime-300">
                {caseData.resolution_type.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Reported: {formatActualDateTime(caseData.created_at)}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Customer Statement
          </span>
          <p className="text-base text-slate-900 font-medium bg-slate-50 p-3.5 rounded-xl border border-lime-200">
            "{caseData.customer_request}"
          </p>
        </div>
      </div>

      {/* ⚡ Priority 1: Interactive Settlement / Clearance / Action Banners at the Top */}
      {caseData.status === 'WAITING_FOR_PROVIDER' && (
        <div className="bg-emerald-50/90 border-2 border-emerald-400 rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-sm">
                <Clock className="w-5 h-5 animate-pulse text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {caseData.refund_id || caseData.resolution_type === 'REFUND_ISSUED'
                    ? 'Refund Dispatched to Banking Provider — Waiting for Settlement'
                    : 'Payment Status PENDING with Banking Gateway'}
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  {caseData.refund_id
                    ? `Provider Reference: ${caseData.refund?.provider_reference || 'REF-SETTLING'} · Status: PENDING`
                    : `Payment Reference: ${caseData.payment?.payment_reference || 'TXN987656'} · Gateway Status: PENDING`}
                </p>
              </div>
            </div>

            {caseData.refund_id ? (
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={handleStepRefundVerification}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs transition-all flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Confirming Settlement...' : '✓ Accept & Settle Bank Refund'}</span>
                </button>

                <Link
                  to="/bank"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Open Bank Portal →</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      const payId = caseData.payment?.id || caseData.payment_id;
                      if (payId) {
                        await client.post(`/simulator/bank/payments/${payId}/clear`);
                        await fetchCase(true);
                      }
                    } catch (e) {
                      console.error('Failed to clear payment', e);
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Confirming Bank Receipt...' : '✓ Bank Received Funds (Recover Order & Resolve)'}</span>
                </button>

                <Link
                  to="/bank"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Open Bank Gateway →</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Action Prompt for Customer */}
      {caseData.status === 'WAITING_FOR_CUSTOMER' && (
        <div className="bg-lime-50 border-2 border-lime-500 rounded-2xl p-6 shadow-md space-y-4 animate-pulse">
          <div className="flex items-center space-x-2 text-lime-900">
            <Sparkles className="w-5 h-5 text-lime-700" />
            <h3 className="text-base font-bold text-slate-900">Your Confirmation Required to Recover Order</h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Your payment was confirmed and stock is available in store inventory. Would you like Resolve AI to complete and recover your original purchase without any extra charges?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleCustomerConfirmation(true)}
              disabled={actionLoading}
              className="bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-lime-500/25 flex items-center space-x-2 text-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 font-bold" />
              <span>{actionLoading ? 'Executing & Verifying...' : 'Recover My Order (No Extra Charge)'}</span>
            </button>

            <button
              onClick={() => handleCustomerConfirmation(false)}
              disabled={actionLoading}
              className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 shadow-sm transition-all"
            >
              Decline & Escalate
            </button>
          </div>
        </div>
      )}

      {/* Interactive Manager Approval Action Prompt */}
      {caseData.status === 'WAITING_FOR_APPROVAL' && (
        <div className="bg-amber-50/90 border-2 border-amber-400 rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop: Manager Approval Required</h3>
                <p className="text-xs text-amber-800 font-mono">Store Policy Threshold: ₹500.00 Limit Exceeded</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-900 self-start sm:self-auto">
              ACTION: REQUEST REFUND (₹1499.00 INR)
            </span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            The customer paid for an item that is currently out of stock. Resolve AI has synthesized a refund payout of <strong>₹1499.00</strong>, which requires Store Manager sign-off under Deterministic Rule 8.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleManagerApproval(true)}
              disabled={actionLoading}
              className="bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-lime-500/25 flex items-center space-x-2 text-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 font-bold" />
              <span>{actionLoading ? 'Executing Decision...' : 'Approve Refund as Manager (1-Click)'}</span>
            </button>

            <button
              onClick={() => handleManagerApproval(false)}
              disabled={actionLoading}
              className="bg-white hover:bg-rose-50 disabled:opacity-50 text-rose-700 border border-rose-300 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Reject Action
            </button>

            <Link
              to="/employee/approvals"
              className="text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 underline ml-auto"
            >
              Open Full Manager Approval Queue →
            </Link>
          </div>
        </div>
      )}

      {/* Verified Resolution Outcome Card */}
      {caseData.status === 'RESOLVED' && (
        <div className="bg-gradient-to-r from-emerald-50 via-lime-50 to-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-extrabold text-slate-900">
              {caseData.resolution_type === 'REFUND_ISSUED'
                ? 'Payment Refund Successfully Verified & Settled'
                : 'Case Successfully Verified & Resolved'}
            </h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {caseData.resolution_type === 'REFUND_ISSUED'
              ? 'The full purchase amount has been confirmed settled by the banking gateway back to the customer’s original payment method.'
              : 'The expected outcome has been independently confirmed by our backend rules engine.'}
          </p>

          {/* Refund Settlement Receipt Details */}
          {caseData.resolution_type === 'REFUND_ISSUED' && (
            <div className="bg-white/90 border border-emerald-300 rounded-xl p-4 shadow-inner space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <span className="text-slate-500">Refund Amount Settled:</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {caseData.payment?.amount ? `₹${Number(caseData.payment.amount).toFixed(2)} ${caseData.payment.currency || 'INR'}` : '₹1499.00 INR'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Refund Payout Ref:</span>
                <span className="font-bold text-slate-800">{caseData.refund?.provider_reference || caseData.refund_id || 'REF-CONFIRMED'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Original Payment Ref:</span>
                <span className="font-bold text-slate-800">{caseData.payment?.payment_reference || 'TXN987655'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payout Destination:</span>
                <span className="font-bold text-slate-800">Original Payment Method (Card / UPI)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                  ✓ 100% POST-ACTION VERIFIED
                </span>
              </div>
            </div>
          )}

          {caseData.order_id && (
            <div className="pt-2">
              <Link
                to="/orders"
                className="inline-flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-lime-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Recovered Order in Orders</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Display: AI Workers Office (Default) or Linear Steps */}
      {viewMode === 'workers' ? (
        <ResolveAIWorkerFloor caseData={caseData} />
      ) : (
        <InvestigationSteps currentStatus={caseData.status} events={caseData.events} />
      )}

      {/* AI Proposal & Decision Banner */}
      {caseData.ai_summary && (
        <div className="bg-gradient-to-r from-lime-50 via-white to-lime-50 border border-lime-300 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-lime-800 text-xs font-mono font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4 text-lime-700" />
            <span>AI Teammate Synthesis & Reasoning</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {caseData.ai_summary}
          </p>
        </div>
      )}

      {/* Interactive Action Prompt for Customer */}
      {caseData.status === 'WAITING_FOR_CUSTOMER' && (
        <div className="bg-lime-50 border-2 border-lime-500 rounded-2xl p-6 shadow-md space-y-4 animate-pulse">
          <div className="flex items-center space-x-2 text-lime-900">
            <Sparkles className="w-5 h-5 text-lime-700" />
            <h3 className="text-base font-bold text-slate-900">Your Confirmation Required to Recover Order</h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Your payment was confirmed and stock is available in store inventory. Would you like RESOLVE<sub className="text-xs font-mono font-bold text-lime-600">.ai</sub> to complete and recover your original purchase without any extra charges?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleCustomerConfirmation(true)}
              disabled={actionLoading}
              className="bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-lime-500/25 flex items-center space-x-2 text-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 font-bold" />
              <span>{actionLoading ? 'Executing & Verifying...' : 'Recover My Order (No Extra Charge)'}</span>
            </button>

            <button
              onClick={() => handleCustomerConfirmation(false)}
              disabled={actionLoading}
              className="bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 shadow-sm transition-all"
            >
              Decline & Escalate
            </button>
          </div>
        </div>
      )}

      {/* Interactive Manager Approval Action Prompt */}
      {caseData.status === 'WAITING_FOR_APPROVAL' && (
        <div className="bg-amber-50/90 border-2 border-amber-400 rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop: Manager Approval Required</h3>
                <p className="text-xs text-amber-800 font-mono">Store Policy Threshold: ₹500.00 Limit Exceeded</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-900 self-start sm:self-auto">
              ACTION: REQUEST REFUND (₹1499.00 INR)
            </span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            The customer paid for an item that is currently out of stock. Resolve AI has synthesized a refund payout of <strong>₹1499.00</strong>, which requires Store Manager sign-off under Deterministic Rule 8.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleManagerApproval(true)}
              disabled={actionLoading}
              className="bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-lime-500/25 flex items-center space-x-2 text-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 font-bold" />
              <span>{actionLoading ? 'Executing Decision...' : 'Approve Refund as Manager (1-Click)'}</span>
            </button>

            <button
              onClick={() => handleManagerApproval(false)}
              disabled={actionLoading}
              className="bg-white hover:bg-rose-50 disabled:opacity-50 text-rose-700 border border-rose-300 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Reject Action
            </button>

            <Link
              to="/employee/approvals"
              className="text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 underline ml-auto"
            >
              Open Full Manager Approval Queue →
            </Link>
          </div>
        </div>
      )}

      {/* Interactive Provider Settlement / Polling Prompt */}
      {caseData.status === 'WAITING_FOR_PROVIDER' && (
        <div className="bg-lime-50 border-2 border-lime-400 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-5 h-5 text-lime-700 animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {caseData.refund_id || caseData.resolution_type === 'REFUND_ISSUED'
                    ? 'Refund Approved & Dispatched to Banking Provider'
                    : 'Payment Status PENDING with Banking Gateway'}
                </h3>
                <p className="text-xs text-slate-600 font-mono">
                  {caseData.refund_id
                    ? `Provider Reference: ${caseData.refund?.provider_reference || 'REF-SETTLING'} · Status: PENDING`
                    : `Payment Reference: ${caseData.payment?.payment_reference || 'TXN-SEARCHED'} · Gateway Status: PENDING (Scheduled Recheck)`}
                </p>
              </div>
            </div>

            {caseData.refund_id ? (
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={handleStepRefundVerification}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs transition-all flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Confirming Settlement...' : '✓ Accept & Confirm Bank Payout'}</span>
                </button>

                <Link
                  to="/bank"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Open Bank Portal →</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      const payId = caseData.payment?.id || caseData.payment_id;
                      if (payId) {
                        await client.post(`/simulator/bank/payments/${payId}/clear`);
                        await fetchCase(true);
                      }
                    } catch (e) {
                      console.error('Failed to clear payment', e);
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md text-xs transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Confirming Bank Receipt...' : '✓ Bank Received Funds (Recover Order & Resolve)'}</span>
                </button>

                <Link
                  to="/bank"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Open Bank Gateway →</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verified Resolution Outcome Card */}
      {caseData.status === 'RESOLVED' && (
        <div className="bg-gradient-to-r from-emerald-50 via-lime-50 to-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-extrabold text-slate-900">
              {caseData.resolution_type === 'REFUND_ISSUED'
                ? 'Payment Refund Successfully Verified & Settled'
                : 'Case Successfully Verified & Resolved'}
            </h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {caseData.resolution_type === 'REFUND_ISSUED'
              ? 'The full purchase amount has been confirmed settled by the banking gateway back to the customer’s original payment method.'
              : 'The expected outcome has been independently confirmed by our backend rules engine.'}
          </p>

          {/* Refund Settlement Receipt Details */}
          {caseData.resolution_type === 'REFUND_ISSUED' && (
            <div className="bg-white/90 border border-emerald-300 rounded-xl p-4 shadow-inner space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <span className="text-slate-500">Refund Amount Settled:</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {caseData.payment?.amount ? `₹${Number(caseData.payment.amount).toFixed(2)} ${caseData.payment.currency || 'INR'}` : '₹1499.00 INR'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Refund Payout Ref:</span>
                <span className="font-bold text-slate-800">{caseData.refund?.provider_reference || caseData.refund_id || 'REF-CONFIRMED'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Original Payment Ref:</span>
                <span className="font-bold text-slate-800">{caseData.payment?.payment_reference || 'TXN987655'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payout Destination:</span>
                <span className="font-bold text-slate-800">Original Payment Method (Card / UPI)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                  ✓ 100% POST-ACTION VERIFIED
                </span>
              </div>
            </div>
          )}

          {caseData.order_id && (
            <div className="pt-2">
              <Link
                to="/orders"
                className="inline-flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-lime-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Recovered Order in Orders</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Telemetry & Timeline Grid */}
      {(() => {
        const paymentRef = caseData.payment?.payment_reference || caseData.payment_id || (caseData.customer_request?.match(/TXN[0-9A-Z_]+/i)?.[0]) || 'TXN-SEARCHED';
        const paymentStatus = caseData.payment?.status || (caseData.status === 'WAITING_FOR_PROVIDER' ? 'PENDING' : 'SUCCESS');
        const paymentAmount = caseData.payment?.amount
          ? `₹${Number(caseData.payment.amount).toFixed(2)} ${caseData.payment.currency || 'INR'}`
          : (caseData.customer_request?.match(/₹([0-9]+)/)?.[0] || '₹799.00 INR');

<<<<<<< HEAD
        const isKeyboard = caseData.customer_id === 'usr_aisha' || caseData.customer_request?.includes('Keyboard');
        const isMouse = caseData.customer_id === 'usr_arjun' || caseData.customer_request?.includes('Mouse');

        const itemName = isKeyboard ? 'Mechanical Keyboard' : isMouse ? 'Wireless Mouse' : 'Wireless Headset';
        const checkoutRef = isKeyboard ? 'CHK-RS-77211' : isMouse ? 'CHK-RS-77212' : 'CHK-RS-77210';
        const linkedOrder = caseData.order_id
          ? (caseData.order?.order_number || 'ORD-CONFIRMED')
          : caseData.status === 'RESOLVED' && caseData.resolution_type === 'ORDER_RECOVERY'
          ? 'ORD-RECOVERED'
          : 'MISSING (RECOVERY ELIGIBLE)';

        const stockStatus = isKeyboard ? '0 Units (OUT OF STOCK)' : isMouse ? '20 Units in Stock' : '10 Units in Stock';
        const stockBadgeStatus = isKeyboard ? 'UNAVAILABLE' : 'AVAILABLE';
        const policyPath = caseData.resolution_type || (isKeyboard || caseData.status === 'WAITING_FOR_APPROVAL' ? 'MANAGER_REFUND_APPROVAL' : caseData.status === 'WAITING_FOR_PROVIDER' ? 'BACKGROUND_POLL_RECHECK' : 'ORDER_RECOVERY');

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Evidence Facts (Sticky) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 self-start">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Verified Investigation Evidence
                </h3>
                <span className="text-[10px] font-mono text-lime-800 bg-lime-100 px-2 py-0.5 rounded border border-lime-300">
                  {caseData.refund || caseData.refund_id || caseData.status === 'WAITING_FOR_PROVIDER' || caseData.resolution_type === 'REFUND_ISSUED' ? '4 Fact Cards' : '3 Fact Cards'}
                </span>
              </div>

              <div className="space-y-3.5">
                <EvidenceCard
                  title="Simulated Payment Gateway"
                  status={paymentStatus === 'SUCCESS' ? 'CONFIRMED' : paymentStatus}
                  details={[
                    { label: 'Payment Ref', value: paymentRef },
                    { label: 'Gateway Status', value: paymentStatus },
                    { label: 'Amount', value: paymentAmount },
                    { label: 'Environment', value: 'SIMULATED' },
                  ]}
                />

                <EvidenceCard
                  title="Order & Checkout Records"
                  status={caseData.order_id ? 'CONFIRMED' : 'RECOVERABLE'}
                  details={[
                    { label: 'Checkout Cart', value: checkoutRef },
                    { label: 'Linked Order', value: linkedOrder },
                    { label: 'Item', value: itemName },
                  ]}
                />

                <EvidenceCard
                  title="Inventory & Stock Availability"
                  status={stockBadgeStatus}
                  details={[
                    { label: 'Item Name', value: itemName },
                    { label: 'Stock Status', value: stockStatus },
                    { label: 'Policy Path', value: policyPath },
                  ]}
                />

                {(caseData.refund || caseData.refund_id || caseData.status === 'WAITING_FOR_PROVIDER' || caseData.resolution_type === 'REFUND_ISSUED') && (
                  <EvidenceCard
                    title="Bank Provider Gateway (Payout)"
                    status={caseData.refund?.status === 'SUCCESS' || caseData.resolution_type === 'REFUND_ISSUED' ? 'SUCCESS' : 'PENDING'}
                    details={[
                      { label: 'Provider Ref', value: caseData.refund?.provider_reference || caseData.refund_id || 'REF-F699B9' },
                      { label: 'Gateway Name', value: 'SIMULATED_BANK_GATEWAY' },
                      { label: 'Payout State', value: caseData.refund?.status === 'SUCCESS' || caseData.resolution_type === 'REFUND_ISSUED' ? 'SETTLED (SUCCESS)' : 'QUEUED (PENDING)' },
                      { label: 'Settlement Route', value: 'Original Method (UPI/Card)' },
                    ]}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Event Timeline (Contained Scrollable View) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Immutable Case Audit Timeline ({caseData.events?.length || 0} Events)
                  </h3>
                  <span className="text-[10px] font-mono text-lime-800 bg-lime-100 px-2 py-0.5 rounded border border-lime-300">
                    Live Log
                  </span>
                </div>

                <button
                  onClick={() => setTimelineExpanded(!timelineExpanded)}
                  className="text-xs font-mono font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-lime-50 px-2.5 py-1 rounded-lg border border-lime-200 shadow-sm transition-all flex items-center space-x-1"
                >
                  <span>{timelineExpanded ? 'Compact View ↑' : 'Expand All ↓'}</span>
                </button>
              </div>

              <div className="bg-white border border-lime-200 rounded-2xl p-5 shadow-sm">
                <div className={`${timelineExpanded ? '' : 'max-h-[500px] overflow-y-auto pr-2'}`}>
                  <CaseTimeline events={caseData.events} />
                </div>
                {!timelineExpanded && (caseData.events?.length || 0) > 4 && (
                  <div className="mt-3 pt-2.5 border-t border-lime-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Showing scrollable event stream ({caseData.events?.length || 0} events)</span>
                    <button
                      onClick={() => setTimelineExpanded(true)}
                      className="text-lime-700 hover:text-lime-900 font-bold hover:underline"
                    >
                      Expand View ↓
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
=======
          <EvidenceCard
            title="Banking Gateway Telemetry"
            status={caseData.payment ? caseData.payment.status : (caseData.payment_id ? 'CONFIRMED' : 'SEARCHED')}
            details={[
              { label: 'Payment Ref', value: caseData.payment?.payment_reference || (caseData.payment_id ? 'Verified' : 'Investigating') },
              { label: 'Gateway Status', value: caseData.payment?.status || 'CONFIRMED' },
              { label: 'Amount', value: caseData.payment ? `₹${caseData.payment.amount} ${caseData.payment.currency}` : '₹799.00 INR' },
              { label: 'Verified At', value: caseData.payment?.created_at ? formatActualTime(caseData.payment.created_at) : formatActualTime(caseData.created_at) },
            ]}
          />

          <EvidenceCard
            title="Order & Checkout Records"
            status={caseData.order ? caseData.order.status : (caseData.order_id ? 'CONFIRMED' : 'RECOVERABLE')}
            details={[
              { label: 'Checkout Session', value: caseData.order?.checkout_id || `CHK-RS-${caseData.case_number?.slice(3) || '77210'}` },
              { label: 'Linked Order', value: caseData.order?.order_number || (caseData.status === 'RESOLVED' ? 'ORD-CONFIRMED' : 'MISSING') },
              { label: 'Status', value: caseData.order ? caseData.order.status : (caseData.status === 'RESOLVED' ? 'RECOVERED' : 'PENDING RECOVERY') },
            ]}
          />

          <EvidenceCard
            title="Inventory & Stock Availability"
            status="AVAILABLE"
            details={[
              { label: 'Item Name', value: caseData.customer_request.includes('Keyboard') ? 'Mechanical Keyboard' : caseData.customer_request.includes('Mouse') ? 'Wireless Mouse' : 'Wireless Headset' },
              { label: 'Stock Status', value: caseData.customer_request.includes('Keyboard') ? '0 Units (Out of Stock)' : 'Units Available' },
              { label: 'Policy Path', value: caseData.customer_request.includes('Keyboard') ? 'REFUND_APPROVAL' : 'ORDER_RECOVERY' },
            ]}
          />
        </div>

        {/* Right Column: Dynamic Event Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
              Verification & Task Execution Pipeline
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Deterministic Engine Audit</span>
          </div>

          <div className="bg-white border border-lime-200 rounded-2xl p-5 shadow-sm">
            <CaseTimeline events={caseData.events} />
          </div>
        </div>
      </div>
>>>>>>> origin/main
    </div>
  );
};

