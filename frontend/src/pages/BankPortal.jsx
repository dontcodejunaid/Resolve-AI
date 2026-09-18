import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

export const BankPortal = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);
  const [notification, setNotification] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SUCCESS'

  const fetchRefunds = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await client.get('/simulator/bank/refunds');
      setRefunds(res.data.refunds || []);
    } catch (e) {
      console.error('Failed to load bank refunds', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds(true);
    const interval = setInterval(() => {
      fetchRefunds(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleIssueRefund = async (refundId, providerRef) => {
    setSettlingId(refundId);
    setNotification('');
    try {
      const res = await client.post(`/simulator/bank/refunds/${refundId}/settle`);
      setNotification(`Bank Settlement Confirmed for ${providerRef}! Payout transferred to customer.`);
      await fetchRefunds(false);
    } catch (e) {
      console.error('Failed to settle refund', e);
      setNotification(`Failed to settle refund: ${e.message}`);
    } finally {
      setSettlingId(null);
    }
  };

  const pendingRefunds = refunds.filter((r) => r.status === 'PENDING');
  const settledRefunds = refunds.filter((r) => r.status === 'SUCCESS');

  const filteredRefunds =
    filter === 'PENDING' ? pendingRefunds : filter === 'SUCCESS' ? settledRefunds : refunds;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/80 via-white to-lime-50/80 p-6 rounded-2xl border border-emerald-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Simulated Bank Gateway & Provider Portal
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg">
                  LIVE GATEWAY
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                Inspect incoming merchant refund requests and release payout settlements back to card/UPI rails.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchRefunds(false)}
            className="flex items-center space-x-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sync Gateway</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-mono flex items-center space-x-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-amber-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Bank Payouts</span>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{pendingRefunds.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settled & Credited Payouts</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{settledRefunds.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-lime-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Gateway Dispatches</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{refunds.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Section 1: Incoming Pending Payments Queue (For Scenario 3 & Bank Clearances) */}
      <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="p-5 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Incoming Bank Payment Clearances (Scenario 3 / Holds)</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              When a payment is PENDING with the bank (e.g. Scenario 3 ₹499), click "Clear & Confirm Payment" to release bank funds and trigger automated order recovery.
            </p>
          </div>
        </div>

        <PendingPaymentsList onCleared={() => fetchRefunds(false)} />
      </div>

      {/* Section 2: Outgoing Refunds Settlement Queue */}
      <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="p-5 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>Bank Gateway Refund Settlement Queue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Release & Settle Refund Payout" to execute payout and confirm bank settlement.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              All ({refunds.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'PENDING'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              Pending ({pendingRefunds.length})
            </button>
            <button
              onClick={() => setFilter('SUCCESS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'SUCCESS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50'
              }`}
            >
              Settled ({settledRefunds.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-emerald-800 font-mono text-sm">
            Loading banking gateway refund records...
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700">No Refund Transactions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run Scenario 2 in the Demo Lab or approve an out-of-stock refund to dispatch a payout transaction.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <span>Go to Demo Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-emerald-100">
            {filteredRefunds.map((rfd) => {
              const isSettling = settlingId === rfd.id;
              const isSettled = rfd.status === 'SUCCESS';

              return (
                <div
                  key={rfd.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-emerald-50/40 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-emerald-800">
                        {rfd.provider_reference}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-lg border ${
                          isSettled
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        }`}
                      >
                        {isSettled ? '✓ SETTLED (SUCCESS)' : '⏳ PENDING SETTLEMENT'}
                      </span>
                      {rfd.case_number && (
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Case #{rfd.case_number}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-700">
                      <strong>Reason:</strong> {rfd.reason || 'Customer refund request'}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500">
                      <span>Internal Ref: <strong>{rfd.refund_reference}</strong></span>
                      <span>Payment Ref: <strong>{rfd.payment_id}</strong></span>
                      {rfd.created_at && (
                        <span>Initiated: {formatDateTime(rfd.created_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="text-right sm:pr-4">
                      <div className="text-xs text-slate-500 font-mono">Refund Amount</div>
                      <div className="text-lg font-bold font-mono text-emerald-800">
                        ₹{Number(rfd.amount).toFixed(2)} {rfd.currency || 'INR'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isSettled ? (
                        <button
                          onClick={() => handleIssueRefund(rfd.id, rfd.provider_reference)}
                          disabled={isSettling}
                          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Check className={`w-3.5 h-3.5 ${isSettling ? 'animate-spin' : ''}`} />
                          <span>{isSettling ? 'Processing Bank Rail...' : 'Release & Settle Refund Payout'}</span>
                        </button>
                      ) : (
                        <div className="px-3 py-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Payout Settled</span>
                        </div>
                      )}

                      {rfd.case_id && (
                        <Link
                          to={`/case/${rfd.case_id}`}
                          className="p-2.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-100 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all"
                          title="View Case in Resolve AI"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const PendingPaymentsList = ({ onCleared }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingId, setClearingId] = useState(null);

  const fetchPayments = async () => {
    try {
      const res = await client.get('/simulator/bank/pending-payments');
      setPayments(res.data.pending_payments || []);
    } catch (e) {
      console.error('Failed to load pending payments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClearPayment = async (paymentId, ref) => {
    setClearingId(paymentId);
    try {
      await client.post(`/simulator/bank/payments/${paymentId}/clear`);
      await fetchPayments();
      if (onCleared) onCleared();
    } catch (e) {
      console.error('Failed to clear payment', e);
    } finally {
      setClearingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-500">
        Checking pending incoming bank transfers...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-400">
        No payments currently held in PENDING state with the bank.
      </div>
    );
  }

  return (
    <div className="divide-y divide-emerald-100 bg-amber-50/20">
      {payments.map((p) => {
        const isClearing = clearingId === p.id;

        return (
          <div
            key={p.id}
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/50 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm text-slate-900">
                  {p.payment_reference}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  Bank Status: PENDING
                </span>
                {p.case_number && (
                  <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Linked to Case #{p.case_number}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600">
                Payment held by gateway provider waiting for bank settlement authorization.
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right sm:pr-2">
                <div className="text-[11px] text-slate-500 font-mono">Amount Held</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  ₹{Number(p.amount).toFixed(2)} {p.currency}
                </div>
              </div>

              <button
                onClick={() => handleClearPayment(p.id, p.payment_reference)}
                disabled={isClearing}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                <Check className={`w-3.5 h-3.5 ${isClearing ? 'animate-spin' : ''}`} />
                <span>{isClearing ? 'Clearing Bank Rails...' : 'Clear & Confirm Payment (Resolve AI Auto-Recovers)'}</span>
              </button>

              {p.case_id && (
                <Link
                  to={`/case/${p.case_id}`}
                  className="p-2.5 text-slate-500 hover:text-emerald-800 hover:bg-white rounded-xl border border-slate-200 transition-all"
                  title="View Case in Resolve AI"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
