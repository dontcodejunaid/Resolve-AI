import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Search, CheckCircle2, Clock, Image as ImageIcon, Phone, Upload, X } from 'lucide-react';

export const NewCase = () => {
  const [requestText, setRequestText] = useState('I paid ₹799 for the Wireless Headset via UPI (TXN987654) but my order confirmation is missing.');
  const [paymentRef, setPaymentRef] = useState('TXN987654');
  const [screenshotUrl, setScreenshotUrl] = useState('https://placehold.co/900x500/e11d48/ffffff.png?text=PAYMENT+SUCCESS+-+UPI+DEBITED+TXN987654');
  const [customerPhone, setCustomerPhone] = useState('917892724453');
  const [productId, setProductId] = useState('prod_headset');
  const [loading, setLoading] = useState(false);
  const [investigating, setInvestigating] = useState(false);
  const [investigationStep, setInvestigationStep] = useState(0);
  const navigate = useNavigate();

  const handleQuickFill = (text, ref, prod = 'prod_headset', screen = '') => {
    setRequestText(text);
    setPaymentRef(ref);
    setProductId(prod);
    if (screen) setScreenshotUrl(screen);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInvestigating(true);

    try {
      // Create case and trigger investigation with all workflow metadata
      const res = await client.post('/cases', {
        customer_request: requestText,
        payment_reference: paymentRef || null,
        screenshot_url: screenshotUrl || null,
        customer_phone: customerPhone || null,
        product_id: productId || null,
      });

      const caseId = res.data.id;
      setTimeout(() => setInvestigationStep(1), 300);
      setTimeout(() => setInvestigationStep(2), 700);
      setTimeout(() => setInvestigationStep(3), 1100);
      setTimeout(() => setInvestigationStep(4), 1500);
      setTimeout(() => setInvestigationStep(5), 1900);
      setTimeout(() => {
        navigate(`/case/${caseId}`);
      }, 2300);
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-800 text-xs font-mono font-bold uppercase">
          <img src="/logo.png" alt="RESOLVE.ai" className="w-3.5 h-3.5 object-contain" />
          <span>RESOLVE<sub className="text-[10px] font-mono font-bold text-lime-700 lowercase ml-0.5">.ai</sub> Autonomous Teammate</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report a Payment or Order Mismatch</h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Describe what happened. RESOLVE<sub className="text-xs font-mono font-bold text-lime-600 lowercase ml-0.5">.ai</sub> will autonomously investigate across banking gateways, checkouts, and inventory to verify an outcome.
        </p>
      </div>

      {investigating ? (
        /* Real-Time Investigation Progress Animation */
        <div className="bg-white border border-lime-300 rounded-2xl p-8 shadow-xl shadow-lime-900/5 space-y-6 text-center">
          <div className="w-14 h-14 bg-lime-100 border border-lime-300 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
            <Search className="w-7 h-7 text-lime-700 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Autonomous Investigation in Progress</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">Querying connected systems and evaluating merchant policy rules...</p>
          </div>

          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${investigationStep >= 1 ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>1. Ingesting Telemetry & Vision AI Triage...</span>
              {investigationStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-lime-600" /> : <Clock className="w-4 h-4 animate-spin text-lime-600" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${investigationStep >= 2 ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>2. Validating Simulated Banking Gateway...</span>
              {investigationStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-lime-600" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${investigationStep >= 3 ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>3. Inspecting Saved Checkout Cart & Orders...</span>
              {investigationStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-lime-600" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${investigationStep >= 4 ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>4. Checking Store Inventory & Stock Availability...</span>
              {investigationStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-lime-600" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
            </div>
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${investigationStep >= 5 ? 'bg-lime-50 border-lime-300 text-lime-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              <span>5. Synthesizing Cognee Policy & Decision Rules...</span>
              {investigationStep >= 5 ? <CheckCircle2 className="w-4 h-4 text-lime-600" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
            </div>
          </div>
        </div>
      ) : (
        /* Issue Form */
        <div className="bg-white border border-lime-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Quick Pre-fill chips */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Test Prompts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('I paid ₹799 for the Wireless Headset via UPI (TXN987654) but my order confirmation is missing.', 'TXN987654', 'prod_headset', 'https://placehold.co/900x500/059669/ffffff.png?text=UPI+SUCCESS+-+Rs+799+Debited+TXN987654')}
                className="text-left p-2.5 bg-lime-50/60 hover:bg-lime-100/80 border border-lime-200 hover:border-lime-400 rounded-xl transition-all"
              >
                <span className="text-[11px] font-bold text-lime-800 block font-mono">Scenario 1 (Recovery)</span>
                <span className="text-xs text-slate-700 line-clamp-2">Paid ₹799, item in stock, order missing</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('I paid ₹1499 for the Mechanical Keyboard (TXN987655) but didn\'t get my order.', 'TXN987655', 'prod_keyboard', 'https://placehold.co/900x500/d97706/ffffff.png?text=PAYMENT+SUCCESS+-+Rs+1499+TXN987655')}
                className="text-left p-2.5 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 hover:border-amber-400 rounded-xl transition-all"
              >
                <span className="text-[11px] font-bold text-amber-800 block font-mono">Scenario 2 (Refund Approval)</span>
                <span className="text-xs text-slate-700 line-clamp-2">Paid ₹1499, item out of stock</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('I made a payment for Wireless Mouse (TXN987656), has it completed?', 'TXN987656', 'prod_mouse', 'https://placehold.co/900x500/e11d48/ffffff.png?text=PAYMENT+PENDING+-+Bank+Processing+TXN987656')}
                className="text-left p-2.5 bg-lime-50/60 hover:bg-lime-100/80 border border-lime-200 hover:border-lime-400 rounded-xl transition-all"
              >
                <span className="text-[11px] font-bold text-lime-800 block font-mono">Scenario 3 (Pending)</span>
                <span className="text-xs text-slate-700 line-clamp-2">Pending with bank, schedule check</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                What happened? Describe your issue
              </label>
              <textarea
                rows={3}
                required
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl p-3.5 outline-none focus:border-lime-500 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="e.g. My bank debited ₹799 for my headset purchase, but I didn't get an order confirmation number."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Transaction or Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-lime-500 focus:bg-white font-mono transition-all"
                  placeholder="TXN987654"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Product / Item</span>
                  <span className="text-[10px] text-slate-400 font-mono">Simulated Catalog</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-lime-500 focus:bg-white font-mono transition-all"
                >
                  <option value="prod_headset">Wireless Noise-Canceling Headset (₹799)</option>
                  <option value="prod_keyboard">Mechanical RGB Gaming Keyboard (₹1499)</option>
                  <option value="prod_mouse">Ergonomic Wireless Mouse (₹499)</option>
                </select>
              </div>
            </div>

            {/* New Workflow Component: Customer Phone / Multi-Channel Alert */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-lime-700" />
                  <span>Customer Phone Number (SMS / WhatsApp Updates)</span>
                </span>
                <span className="text-[10px] text-lime-700 bg-lime-100 px-2 py-0.5 rounded font-mono font-bold">
                  Multi-Channel Dispatch
                </span>
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-lime-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-lime-500 focus:bg-white font-mono transition-all"
                placeholder="917892724453"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                RESOLVE AI will dispatch instant SMS and Email notifications to this phone upon order recovery or refund approval.
              </p>
            </div>

            {/* New Workflow Component: Screenshot Upload & Vision AI Triage */}
            <div className="bg-lime-50/50 border border-lime-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-lime-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Payment Screenshot / Receipt (Vision AI Triage)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-lime-800 bg-lime-100 px-2 py-0.5 rounded border border-lime-300">
                  GPT-4o Vision Node
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="w-full bg-white border border-lime-200 text-slate-900 text-xs rounded-lg px-3 py-2 outline-none focus:border-lime-500 font-mono transition-all"
                  placeholder="https://... or paste image URL / upload file below"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-lime-300 hover:border-lime-500 text-lime-900 rounded-lg text-xs font-mono cursor-pointer transition-all shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-lime-700" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {screenshotUrl && (
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="inline-flex items-center space-x-1 text-slate-400 hover:text-rose-600 text-xs font-mono"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Screenshot</span>
                    </button>
                  )}
                </div>

                {screenshotUrl && (
                  <div className="mt-2 flex items-center space-x-3 bg-white p-2 rounded-lg border border-lime-200">
                    <img
                      src={screenshotUrl}
                      alt="Preview"
                      className="w-16 h-10 object-cover rounded border border-slate-200"
                    />
                    <div className="text-[11px] text-slate-600 font-mono leading-tight">
                      <span className="font-bold text-slate-900 block">Screenshot Attached</span>
                      <span>Vision AI will inspect payment timestamps & debit reference</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 px-6 rounded-xl shadow-md shadow-lime-500/25 flex items-center justify-center space-x-2 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Initializing Investigation...' : 'Start Autonomous Investigation'}</span>
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};


