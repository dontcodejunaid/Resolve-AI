import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import {
  ArrowLeft,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { CaseTimeline } from '../components/CaseTimeline';
import { EvidenceCard } from '../components/EvidenceCard';

export const EmployeeCaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/employee/cases/${id}`);
      setCaseData(res.data);
    } catch (e) {
      console.error('Failed to load employee case', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      const res = await client.post(`/employee/cases/${id}/handoff-note`, { note: noteText });
      setCaseData(res.data);
      setNoteText('');
    } catch (err) {
      console.error('Failed to post note', err);
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-mono text-sm">
        Loading case telemetry...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-300">Case Not Found</h2>
        <Link to="/employee/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/employee/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Queue</span>
        </Link>

        <button
          onClick={fetchCase}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* Case Telemetry Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-mono font-extrabold text-blue-400">
              #{caseData.case_number}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded border bg-slate-800 text-slate-200 border-slate-700">
              {caseData.status}
            </span>
            {caseData.resolution_type && (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-blue-950 text-blue-300 border border-blue-800">
                {caseData.resolution_type}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Customer: <span className="text-slate-200 font-bold">{caseData.customer?.full_name}</span> ({caseData.customer?.email})
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Customer Complaint
          </span>
          <p className="text-sm text-slate-100 font-medium bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            "{caseData.customer_request}"
          </p>
        </div>

        {caseData.ai_summary && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono font-bold uppercase">
              <Bot className="w-4 h-4" />
              <span>AI Reasoning & Handoff Summary</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {caseData.ai_summary}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Left Evidence & Note, Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              System Verification State
            </h3>

            <EvidenceCard
              title="Payment Status"
              status="VERIFIED"
              details={[
                { label: 'Payment ID', value: caseData.payment_id || 'N/A' },
                { label: 'Gateway', value: 'SIMULATED_GATEWAY' },
                { label: 'Status', value: 'CONFIRMED' },
              ]}
            />

            <EvidenceCard
              title="Order Recovery Lock"
              status={caseData.order_id ? 'RECOVERED' : 'UNLOCKED'}
              details={[
                { label: 'Order Number', value: caseData.order_id || 'PENDING' },
                { label: 'Idempotency Key', value: `RECOVERY-${caseData.id}` },
              ]}
            />
          </div>

          {/* Add Human Support Note */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Add Support Specialist Note
            </h4>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 outline-none focus:border-blue-500"
                placeholder="Document actions taken or manual phone verification..."
              />
              <button
                type="submit"
                disabled={noteLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{noteLoading ? 'Saving...' : 'Post Event to Case Timeline'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Complete Event & Action Stream ({caseData.events?.length || 0} events)
            </h3>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <CaseTimeline events={caseData.events} />
          </div>
        </div>
      </div>
    </div>
  );
};
