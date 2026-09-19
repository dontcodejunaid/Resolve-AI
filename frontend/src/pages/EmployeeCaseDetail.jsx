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
import { UserAvatar } from '../components/UserAvatar';

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
      console.error('Failed to load case', e);
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
      await client.post(`/employee/cases/${id}/notes`, { note: noteText });
      setNoteText('');
      fetchCase();
    } catch (e) {
      console.error('Failed to post note', e);
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500 font-mono text-sm">
        Loading case #{id}...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-rose-500 font-mono text-sm">
        Case not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        to="/employee/dashboard"
        className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-lime-800 hover:text-lime-950 bg-lime-50 hover:bg-lime-100 border border-lime-300 px-3 py-1.5 rounded-xl transition-all shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Support Queue</span>
      </Link>

      {/* Case Header Card */}
      <div className="bg-white border border-lime-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <UserAvatar
              email={caseData.customer?.email}
              name={caseData.customer?.full_name}
              role="customer"
              size="lg"
              showBadge={true}
            />
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xl font-bold font-mono text-lime-700">
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

              <div className="text-xs font-mono text-slate-500 mt-1">
                Customer: <span className="text-slate-900 font-bold">{caseData.customer?.full_name}</span> ({caseData.customer?.email})
              </div>
            </div>
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

          {/* Add Human Support Note */}
          <div className="bg-white border border-lime-200 p-5 rounded-2xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add Support Specialist Note
            </h4>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-xs rounded-xl p-2.5 outline-none focus:border-lime-500 focus:bg-white transition-colors"
                placeholder="Document actions taken or manual phone verification..."
              />
              <button
                type="submit"
                disabled={noteLoading}
                className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-lime-500/20"
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

