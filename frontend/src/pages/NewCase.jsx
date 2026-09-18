import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Search, CheckCircle2, Clock } from 'lucide-react';

export const NewCase = () => {
  const [requestText, setRequestText] = useState('I paid ₹799 for the Wireless Headset via UPI (TXN987654) but my order confirmation is missing.');
  const [paymentRef, setPaymentRef] = useState('TXN987654');
  const [loading, setLoading] = useState(false);
  const [investigating, setInvestigating] = useState(false);
  const [investigationStep, setInvestigationStep] = useState(0);
  const navigate = useNavigate();

  const handleQuickFill = (text, ref) => {
    setRequestText(text);
    setPaymentRef(ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInvestigating(true);

    try {
      // Create case and trigger investigation
      const res = await client.post('/cases', {
        customer_request: requestText,
        payment_reference: paymentRef || null,
      });

      const caseId = res.data.id;
      // Brief simulated progress for smooth UI UX
      setTimeout(() => setInvestigationStep(1), 300);
      setTimeout(() => setInvestigationStep(2), 700);
      setTimeout(() => setInvestigationStep(3), 1100);
      setTimeout(() => setInvestigationStep(4), 1500);
      setTimeout(() => {
        navigate(`/case/${caseId}`);
      }, 1900);
    } catch (err) {
      console.error('Error opening case', err);
      setLoading(false);
      setInvestigating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-400 text-xs font-mono font-semibold uppercase">
          <Bot className="w-3.5 h-3.5" />
          <span>Resolve AI Autonomous Teammate</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Report a Payment or Order Mismatch</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Describe what happened. Resolve AI will autonomously investigate across banking gateways, checkouts, and inventory to verify an outcome.
        </p>
      </div>

      {investigating ? (
        /* Real-Time Investigation Progress Animation */
        <div className="bg-slate-900/95 border border-blue-500/40 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/40 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
            <Search className="w-7 h-7 text-blue-400 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Autonomous Investigation in Progress</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">Querying connected systems and evaluating merchant policy rules...</p>
          </div>

          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono">
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${investigationStep >= 1 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              <span>1. Validating Simulated Banking Gateway...</span>
              {investigationStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-spin" />}
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${investigationStep >= 2 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              <span>2. Inspecting Saved Checkout Cart...</span>
              {investigationStep >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-700" />}
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${investigationStep >= 3 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              <span>3. Checking Store Inventory & Stock Availability...</span>
              {investigationStep >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-700" />}
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${investigationStep >= 4 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
              <span>4. Synthesizing Cognee Policy & Decision Rules...</span>
              {investigationStep >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-700" />}
            </div>
          </div>
        </div>
      ) : (
        /* Issue Form */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick Pre-fill chips */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Test Prompts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('I paid ₹799 for the Wireless Headset via UPI (TXN987654) but my order confirmation is missing.', 'TXN987654')}
                className="text-left p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all"
              >
                <span className="text-[11px] font-bold text-emerald-400 block font-mono">Scenario 1 (Recovery)</span>
                <span className="text-xs text-slate-300 line-clamp-2">Paid ₹799, item in stock, order missing</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('I paid ₹1499 for the Mechanical Keyboard (TXN987655) but didn\'t get my order.', 'TXN987655')}
                className="text-left p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all"
              >
                <span className="text-[11px] font-bold text-amber-400 block font-mono">Scenario 2 (Refund Approval)</span>
                <span className="text-xs text-slate-300 line-clamp-2">Paid ₹1499, item out of stock</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('I made a payment for Wireless Mouse (TXN987656), has it completed?', 'TXN987656')}
                className="text-left p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all"
              >
                <span className="text-[11px] font-bold text-blue-400 block font-mono">Scenario 3 (Pending)</span>
                <span className="text-xs text-slate-300 line-clamp-2">Pending with bank, schedule check</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                What happened? Describe your issue
              </label>
              <textarea
                rows={3}
                required
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="e.g. My bank debited ₹799 for my headset purchase, but I didn't get an order confirmation number."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Transaction or Payment Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 font-mono"
                placeholder="TXN987654"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Initializing Investigation...' : 'Start Autonomous Investigation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
