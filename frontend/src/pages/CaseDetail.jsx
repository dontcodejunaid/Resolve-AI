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
  User
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

      {/* Verified Resolution Outcome Card */}
      {caseData.status === 'RESOLVED' && (
        <div className="bg-lime-50 border border-lime-300 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-lime-800">
            <CheckCircle2 className="w-6 h-6 text-lime-700" />
            <h3 className="text-lg font-bold text-slate-900">Case Successfully Verified & Resolved</h3>
          </div>
          <p className="text-sm text-slate-700">
            The expected outcome has been independently confirmed by our backend rules engine.
          </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Evidence Facts */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
            Verified Investigation Evidence
          </h3>

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
    </div>
  );
};

