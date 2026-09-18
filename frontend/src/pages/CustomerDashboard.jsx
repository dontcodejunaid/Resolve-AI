import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  RefreshCw,
  Bot,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResolveAIWorkerFloor } from '../components/ResolveAIWorkerFloor';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showOfficeFloor, setShowOfficeFloor] = useState(true);

  const fetchCases = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await client.get('/cases');
      setCases(res.data);
    } catch (e) {
      console.error('Failed to load customer cases', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases(true);
  }, []);

  const openCases = cases.filter(c => c.status !== 'RESOLVED');
  const resolvedCases = cases.filter(c => c.status === 'RESOLVED');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-blue-950/60 text-blue-300 border-blue-700/60 animate-pulse';
      case 'WAITING_FOR_APPROVAL':
      case 'WAITING_FOR_PROVIDER':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
      case 'ESCALATED':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/50';
      case 'INVESTIGATING':
      case 'ACTION_IN_PROGRESS':
      case 'VERIFYING':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50 animate-pulse';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name}
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
              Customer Portal
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Resolve AI is actively monitoring your transactions and resolving payment mismatches.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCases}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/80 transition-all"
            title="Refresh Cases"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/new-case"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Report Missing Order</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Investigations</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{openCases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Resolutions</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{resolvedCases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Claims Filed</span>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1">{cases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Autonomous AI Teammates Floor (Collapsible Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Autonomous AI Floor (4 Teammates Working)</h2>
          </div>

          <button
            onClick={() => setShowOfficeFloor(!showOfficeFloor)}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg transition-all"
          >
            <span>{showOfficeFloor ? 'Hide Floor' : 'Show Floor'}</span>
            {showOfficeFloor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showOfficeFloor && <ResolveAIWorkerFloor />}
      </div>

      {/* Cases List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">Your Cases & Investigations</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              All ({cases.length})
            </button>
            <button
              onClick={() => setFilter('OPEN')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'OPEN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              Active ({openCases.length})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'RESOLVED' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              Resolved ({resolvedCases.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-sm">
            Loading cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-300">No cases found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reported any payment or missing order issues yet. Click below to test an autonomous investigation.
            </p>
            <Link
              to="/new-case"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Report Sample Issue</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {cases
              .filter(c => {
                if (filter === 'OPEN') return c.status !== 'RESOLVED';
                if (filter === 'RESOLVED') return c.status === 'RESOLVED';
                return true;
              })
              .map((c) => (
                <div key={c.id} className="p-5 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-mono font-bold text-blue-400">
                        #{c.case_number}
                      </span>
                      <span className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded border uppercase ${getStatusBadge(c.status)}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                      {c.resolution_type && (
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {c.resolution_type}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-200 font-medium line-clamp-1">
                      {c.customer_request}
                    </p>

                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
                      <span>Created: {new Date(c.created_at).toLocaleDateString()} at {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>Events: {c.events?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {c.status === 'WAITING_FOR_CUSTOMER' && (
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </span>
                    )}

                    <Link
                      to={`/case/${c.id}`}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <span>View Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
