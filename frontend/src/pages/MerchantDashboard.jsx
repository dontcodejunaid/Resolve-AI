import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  TrendingUp,
  Package,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const MerchantDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await client.get('/merchant/metrics');
      setMetrics(res.data);
    } catch (e) {
      console.error('Failed to load merchant metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Merchant & Store Console</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 rounded">
              Resolve Store
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Store policy configuration, real-time inventory management, and dispute metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/merchant/policies"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Policies</span>
          </Link>
          <button
            onClick={fetchMetrics}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims Processed</span>
          <div className="text-3xl font-mono font-extrabold text-white">{metrics?.total_cases ?? '—'}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution Rate</span>
          <div className="text-3xl font-mono font-extrabold text-emerald-400">{metrics?.resolution_rate ?? '—'}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recovered Purchases</span>
          <div className="text-3xl font-mono font-extrabold text-blue-400">{metrics?.recovery_resolutions ?? '—'}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Refunds Issued</span>
          <div className="text-3xl font-mono font-extrabold text-amber-400">{metrics?.refund_resolutions ?? '—'}</div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Merchant Policy Engine</h3>
            <Sliders className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure automated order recovery permissions, refund limits, manager approval thresholds, and Cognee knowledge parameters.
          </p>
          <Link
            to="/merchant/policies"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            <span>Edit Policy Rules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Product Inventory & Stock</h3>
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage live stock counts. Test zero-stock refund triggers vs available stock recovery triggers in real time.
          </p>
          <Link
            to="/merchant/products"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
