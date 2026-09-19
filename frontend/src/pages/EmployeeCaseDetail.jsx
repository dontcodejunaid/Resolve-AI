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
import { VisionEvidenceCard } from '../components/VisionEvidenceCard';

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

  const handleResolveCase = async () => {
    setNoteLoading(true);
    try {
      const res = await client.post(`/employee/cases/${id}/resolve`, {
        notes: noteText.trim() || 'Support Specialist reconciled discrepancy and marked case resolved',
        resolution_type: 'MANUAL_RECONCILIATION_RESOLVED'
      });
      setCaseData(res.data);
      setNoteText('');
    } catch (err) {
      console.error('Failed to resolve case', err);
    } finally {
      setNoteLoading(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-lime-700 font-mono text-sm">
        Loading case telemetry...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Case Not Found</h2>
        <Link to="/employee/dashboard" className="text-lime-700 hover:text-lime-800 text-sm font-semibold">
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
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Queue</span>
        </Link>

        <div className="flex items-center space-x-3">
          {caseData.status !== 'RESOLVED' && (
            <button
              onClick={handleResolveCase}
              disabled={noteLoading}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{noteLoading ? 'Resolving...' : '✓ Resolve Case'}</span>
            </button>
          )}

          <button
            onClick={fetchCase}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-lime-200 text-lime-800 hover:bg-lime-50 rounded-lg text-xs font-mono transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Case Telemetry Header */}
      <div className="bg-white border border-lime-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-mono font-extrabold text-lime-700">
              #{caseData.case_number}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg border bg-lime-100 text-lime-800 border-lime-300">
              {caseData.status}
            </span>
            {caseData.resolution_type && (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-lime-100 text-lime-900 border border-lime-300">
                {caseData.resolution_type}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-500">
            Customer: <span className="text-slate-900 font-bold">{caseData.customer?.full_name}</span> ({caseData.customer?.email})
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Customer Complaint
          </span>
          <p className="text-sm text-slate-800 font-medium bg-lime-50/60 p-3.5 rounded-xl border border-lime-200">
            "{caseData.customer_request}"
          </p>
        </div>

        {caseData.ai_summary && (
          <div className="p-4 rounded-xl bg-lime-50 border border-lime-200 space-y-1">
            <div className="flex items-center space-x-2 text-lime-800 text-xs font-mono font-bold uppercase">
              <Bot className="w-4 h-4 text-lime-700" />
              <span>AI Reasoning & Handoff Summary</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-mono">
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
            <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
              System Verification State
            </h3>

            {(caseData.screenshot_url || caseData.screenshot_analysis) && (
              <VisionEvidenceCard
                screenshotUrl={caseData.screenshot_url}
                analysis={
                  typeof caseData.screenshot_analysis === 'string'
                    ? (() => {
                        try {
                          return JSON.parse(caseData.screenshot_analysis);
                        } catch (e) {
                          return null;
                        }
                      })()
                    : caseData.screenshot_analysis
                }
              />
            )}

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

          {/* Add Human Support Note & Manual Resolve Card */}
          <div className="bg-white border border-lime-200 p-5 rounded-2xl space-y-4 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Support Specialist Triage & Resolution
              </h4>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Log investigation notes or resolve escalated discrepancy.
              </p>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-xs rounded-xl p-2.5 outline-none focus:border-lime-500 focus:bg-white transition-colors"
                placeholder="Document actions taken, e.g. Customer approved price adjustment / manual refund confirmed..."
              />
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={noteLoading || !noteText.trim()}
                  className="w-full bg-lime-100 hover:bg-lime-200 disabled:opacity-50 text-lime-900 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all border border-lime-300"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{noteLoading ? 'Saving...' : 'Post Event to Timeline'}</span>
                </button>

                {caseData.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={handleResolveCase}
                    disabled={noteLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{noteLoading ? 'Resolving...' : '✓ Resolve Case (Reconciled & Closed)'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
              Verification & Task Execution Pipeline
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Autonomous Telemetry</span>
          </div>

          <div className="bg-white border border-lime-200 rounded-2xl p-5 shadow-sm">
            <CaseTimeline events={caseData.events} />
          </div>
        </div>
      </div>
    </div>
  );
};

