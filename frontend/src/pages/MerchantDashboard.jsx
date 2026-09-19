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
  ExternalLink,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

export const MerchantDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, approvalsRes, productsRes, storeRes] = await Promise.all([
        client.get('/merchant/metrics'),
        client.get('/employee/approvals'),
        client.get('/merchant/products'),
        client.get('/merchant/store').catch(() => ({ data: { name: 'AURA STUDIO', store_url: 'https://aura-nine-virid.vercel.app/' } }))
      ]);
      setMetrics(metricsRes.data);
      setApprovals(approvalsRes.data);
      setProducts(productsRes.data || []);
      setStoreInfo(storeRes.data);
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

  const auraProducts = products.filter(p => p.id.startsWith('prod_'));
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const inStockCount = products.filter(p => p.stock > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Aura Store Connection Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 text-xs font-mono font-bold bg-lime-400 text-slate-950 rounded-full flex items-center space-x-1.5 shadow-sm">
              <Store className="w-3.5 h-3.5" />
              <span>LIVE STOREFRONT CONNECTED</span>
            </span>
            <span className="text-xs font-mono text-slate-400">Merchant: {storeInfo?.name || 'AURA STUDIO'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Aura Studio <span className="text-lime-400 font-normal text-xl sm:text-2xl">| Store Manager Console</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Autonomous dispute resolution & inventory synchronization for <strong className="text-white">aura-nine-virid.vercel.app</strong>. 
            All simulated checkout errors, transaction IDs (<code className="text-lime-300 font-mono">TXN_..._INR</code>), and stock counts are tied to this store console.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <a
            href={storeInfo?.store_url || "https://aura-nine-virid.vercel.app/"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all group"
          >
            <span>Open Aura Store</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-700" />
          </a>

          <Link
            to="/merchant/products"
            className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-lime-500/20 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-lime-400 rounded-xl border border-slate-700 shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory & Stock Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-lime-200 p-4 sm:p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Catalog SKUs</span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900">{products.length}</div>
          <span className="text-[10px] text-lime-700 font-mono">Luxury Apparel & Accessories</span>
        </div>

        <div className="bg-white border border-lime-200 p-4 sm:p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Available In-Stock</span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-700">{inStockCount} Items</div>
          <span className="text-[10px] text-emerald-700 font-mono">Ready for AI order recovery</span>
        </div>

        <div className="bg-white border border-amber-200 p-4 sm:p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Out of Stock (Zero Units)</span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-700">{outOfStockCount} Items</div>
          <span className="text-[10px] text-amber-700 font-mono">Triggers refund approval flow</span>
        </div>

        <div className="bg-white border border-lime-200 p-4 sm:p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Approvals</span>
          <div className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-700">{approvals.length}</div>
          <span className="text-[10px] text-rose-700 font-mono">Requires Store Manager sign-off</span>
        </div>
      </div>

      {/* Pending Approvals Section (Human-in-the-Loop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Pending Store Manager Approvals ({approvals.length})
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
            <p className="text-xs text-slate-500">No high-value refund actions or policy threshold flags currently waiting for review.</p>
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

      {/* Featured Products Quick Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-lime-700" />
            <h2 className="text-lg font-bold text-slate-900">Aura Studio Live Inventory</h2>
          </div>
          <Link
            to="/merchant/products"
            className="text-xs font-mono font-bold text-lime-700 hover:text-lime-900 flex items-center space-x-1"
          >
            <span>Full Inventory Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-lime-200 rounded-2xl p-3.5 shadow-sm space-y-2.5 hover:border-lime-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-full h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={prod.image_url || "/assets/images/hoodie.jpg"}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/images/hoodie.jpg'; }}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{prod.category || 'apparel'}</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                  <div className="text-xs font-mono font-extrabold text-slate-900 mt-0.5">₹{Number(prod.price).toFixed(2)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">Stock:</span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${prod.stock > 0 ? 'bg-lime-100 text-lime-800' : 'bg-rose-100 text-rose-800'}`}>
                  {prod.stock > 0 ? `${prod.stock} left` : 'Out of Stock'}
                </span>
              </div>
            </div>
          ))}
        </div>
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
            <h3 className="text-base font-bold text-slate-900">Aura Store Policy Engine</h3>
            <Sliders className="w-5 h-5 text-lime-700" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure automated order recovery permissions, refund limits, manager approval thresholds, and Cognee knowledge parameters for Aura Studio.
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
            <h3 className="text-base font-bold text-slate-900">Live Inventory & Stock Editor</h3>
            <Package className="w-5 h-5 text-lime-700" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Adjust real-time stock levels for all luxury apparel items. Toggle stock to zero to trigger manager refund approval flows.
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

