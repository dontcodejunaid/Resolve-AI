import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
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
  Box
} from 'lucide-react';
import { CaseTimeline } from '../components/CaseTimeline';
import { InvestigationSteps } from '../components/InvestigationSteps';
import { EvidenceCard } from '../components/EvidenceCard';
import { ResolveAIWorkerFloor } from '../components/ResolveAIWorkerFloor';

export const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('workers'); // 'workers' | 'linear'

  const fetchCase = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await client.get(`/cases/${id}`);
      setCaseData(res.data);
      setNotFound(false);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setNotFound(true);
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
  }, [id]);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-mono text-sm">
        Retrieving case telemetry...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-300">Case Not Found</h2>
        <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-blue-950/60 text-blue-300 border-blue-700/60 animate-pulse';
      case 'WAITING_FOR_APPROVAL':
      case 'WAITING_FOR_PROVIDER':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/60';
      case 'ESCALATED':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      default:
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* View Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setViewMode('workers')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'workers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Teammates Floor
            </button>
            <button
              onClick={() => setViewMode('linear')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'linear' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Linear Steps
            </button>
          </div>

          <button
            onClick={fetchCase}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-mono font-extrabold text-blue-400">
              #{caseData.case_number}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded border ${getStatusBadgeClass(
                caseData.status
              )}`}
            >
              {caseData.status.replace(/_/g, ' ')}
            </span>
            {caseData.resolution_type && (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                {caseData.resolution_type.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Reported: {new Date(caseData.created_at).toLocaleString()}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Customer Statement
          </span>
          <p className="text-base text-slate-100 font-medium bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
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
        <div className="bg-gradient-to-r from-blue-950/30 via-slate-900 to-purple-950/30 border border-blue-500/30 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>AI Teammate Synthesis & Reasoning</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {caseData.ai_summary}
          </p>
        </div>
      )}

      {/* Interactive Action Prompt for Customer */}
      {caseData.status === 'WAITING_FOR_CUSTOMER' && (
        <div className="bg-blue-950/40 border-2 border-blue-500 rounded-2xl p-6 shadow-2xl space-y-4 animate-pulse">
          <div className="flex items-center space-x-2 text-blue-300">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Your Confirmation Required to Recover Order</h3>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            Your payment was confirmed and stock is available in store inventory. Would you like Resolve AI to complete and recover your original purchase without any extra charges?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleCustomerConfirmation(true)}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 text-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionLoading ? 'Executing & Verifying...' : 'Recover My Order (No Extra Charge)'}</span>
            </button>

            <button
              onClick={() => handleCustomerConfirmation(false)}
              disabled={actionLoading}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              Decline & Escalate
            </button>
          </div>
        </div>
      )}

      {/* Verified Resolution Outcome Card */}
      {caseData.status === 'RESOLVED' && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Case Successfully Verified & Resolved</h3>
          </div>
          <p className="text-sm text-slate-200">
            The expected outcome has been independently confirmed by our backend rules engine.
          </p>
          {caseData.order_id && (
            <div className="pt-2">
              <Link
                to="/orders"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
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
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Verified Investigation Evidence
          </h3>

          <EvidenceCard
            title="Simulated Payment Gateway"
            status={caseData.payment_id ? 'CONFIRMED' : 'SEARCHED'}
            details={[
              { label: 'Payment Ref', value: caseData.payment_id ? 'TXN987654' : 'Looking up...' },
              { label: 'Gateway Status', value: 'SUCCESS' },
              { label: 'Amount', value: '₹799.00 INR' },
              { label: 'Environment', value: 'SIMULATED' },
            ]}
          />

          <EvidenceCard
            title="Order & Checkout Records"
            status={caseData.order_id ? 'CONFIRMED' : 'RECOVERABLE'}
            details={[
              { label: 'Checkout Cart', value: 'CHK-RS-77210' },
              { label: 'Linked Order', value: caseData.order_id ? 'ORD-CONFIRMED' : 'MISSING' },
              { label: 'Item', value: 'Wireless Headset' },
            ]}
          />

          <EvidenceCard
            title="Inventory & Stock Availability"
            status="AVAILABLE"
            details={[
              { label: 'Item Name', value: 'Wireless Headset' },
              { label: 'Stock Status', value: '10 Units in Stock' },
              { label: 'Policy Path', value: 'ORDER_RECOVERY' },
            ]}
          />
        </div>

        {/* Right Column: Dynamic Event Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Immutable Case Audit Timeline ({caseData.events?.length || 0} Events)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Live Database Log</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <CaseTimeline events={caseData.events} />
          </div>
        </div>
      </div>
    </div>
  );
};
