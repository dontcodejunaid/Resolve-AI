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
import { UserAvatar } from '../components/UserAvatar';
import { formatActualDateTime } from '../utils/dateUtils';

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
    const interval = setInterval(() => fetchCases(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const openCases = cases.filter((c) => c.status !== 'CLOSED' && c.status !== 'RESOLVED');
  const resolvedCases = cases.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');

  const filteredCases = cases.filter((c) => {
    if (filter === 'ACTIVE') return c.status !== 'CLOSED' && c.status !== 'RESOLVED';
    if (filter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AUTO_RECOVERED':
      case 'AUTO_REFUNDED':
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'ESCALATED':
      case 'ACTION_REQUIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-lime-50/80 via-white to-lime-50/80 p-6 rounded-2xl border border-lime-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <UserAvatar user={user} size="xl" showBadge={true} />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.full_name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-lg">
                Customer Portal
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              RESOLVE<sub className="text-xs font-mono font-bold text-lime-600 lowercase ml-0.5">.ai</sub> is actively monitoring your transactions and resolving payment mismatches.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchCases(false)}
            className="p-2.5 bg-white hover:bg-lime-50 text-lime-800 rounded-xl border border-lime-200 shadow-sm transition-all"
            title="Refresh Cases"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/new-case"
            className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-lime-500/25 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Report Missing Order or Payment</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-lime-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Investigations</span>
            <div className="text-2xl font-bold font-mono text-lime-700 mt-1">{openCases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-lime-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Resolutions</span>
            <div className="text-2xl font-bold font-mono text-lime-700 mt-1">{resolvedCases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-lime-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Claims Filed</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{cases.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Autonomous AI Teammates Floor (Collapsible Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-lime-700" />
            <h2 className="text-lg font-bold text-slate-900">Autonomous AI Floor (4 Teammates Working)</h2>
          </div>

          <button
            onClick={() => setShowOfficeFloor(!showOfficeFloor)}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-3 py-1 bg-white border border-lime-200 shadow-sm rounded-lg transition-all"
          >
            <span>{showOfficeFloor ? 'Hide Floor' : 'Show Floor'}</span>
            {showOfficeFloor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showOfficeFloor && <ResolveAIWorkerFloor />}
      </div>

      {/* Cases List */}
      <div className="bg-white border border-lime-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-lime-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">Your Cases & Investigations</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'ALL' ? 'bg-lime-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({cases.length})
            </button>
            <button
              onClick={() => setFilter('OPEN')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'OPEN' ? 'bg-lime-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({openCases.length})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filter === 'RESOLVED' ? 'bg-lime-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolvedCases.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-lime-700 font-mono text-sm">
            Loading active cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700">No Cases Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you had a payment debited without getting an order, click below to start an investigation.
            </p>
            <Link
              to="/new-case"
              className="inline-flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-black text-xs font-bold px-4 py-2 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-lime-100">
            {(filter === 'ALL' ? cases : filter === 'OPEN' ? openCases : resolvedCases).map((c) => (
              <Link
                key={c.id}
                to={`/case/${c.id}`}
                className="p-5 flex items-center justify-between hover:bg-lime-50/50 transition-all group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-lime-700 group-hover:text-lime-800">
                      #{c.case_number}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-lg border ${getStatusBadge(c.status)}`}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 line-clamp-1 max-w-xl font-medium">
                    "{c.customer_request}"
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {formatActualDateTime(c.created_at)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-lime-700 group-hover:text-lime-900 text-xs font-mono font-bold">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

