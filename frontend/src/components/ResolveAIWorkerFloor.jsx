import React, { useState } from 'react';
import { INITIAL_ENGINEERS } from './tiny-office/officeData';
import {
  Bot,
  CheckCircle2,
  Terminal,
  Sparkles,
  CreditCard,
  Package,
  Brain,
  ShieldCheck,
  X,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';

export const ResolveAIWorkerFloor = ({ caseData, className = '' }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('worker-1');

  const getCustomizedWorker = (w) => {
    if (!caseData) return w;
    const paymentRef = caseData.payment?.payment_reference || (caseData.payment_id ? 'Verified' : 'TXN987654');
    const amount = caseData.payment ? `₹${caseData.payment.amount}` : '₹799.00';
    const caseNum = caseData.case_number || 'Live Case';

    if (w.id === 'worker-1') {
      return {
        ...w,
        thought: `Validating gateway response for ${paymentRef} (${amount}) on #${caseNum} 💳`,
        currentTask: `Verify Gateway Status for ${paymentRef}`,
      };
    }
    if (w.id === 'worker-2') {
      return {
        ...w,
        thought: caseData.order
          ? `Order #${caseData.order.order_number} verified and stock allocated for #${caseNum} 📦`
          : `Auditing stock availability and checkout cart session for #${caseNum} 📦`,
        currentTask: caseData.order ? `Order Linked: ${caseData.order.order_number}` : `Stock & Cart Audit for #${caseNum}`,
      };
    }
    if (w.id === 'worker-3') {
      return {
        ...w,
        thought: caseData.resolution_type
          ? `Synthesized policy: ${caseData.resolution_type.replace(/_/g, ' ')} under merchant threshold 🧠`
          : `Evaluating merchant refund and recovery rules for #${caseNum} 🧠`,
        currentTask: `Policy Synthesis for #${caseNum}`,
      };
    }
    if (w.id === 'worker-4') {
      return {
        ...w,
        thought: `Enforcing 13 Deterministic Rules & immutable audit logging for #${caseNum} 🛡️`,
        currentTask: `Deterministic Verification: #${caseNum}`,
      };
    }
    return w;
  };

  const workers = INITIAL_ENGINEERS.map(getCustomizedWorker);
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  const getWorkerIcon = (workerId) => {
    switch (workerId) {
      case 'worker-1': return CreditCard;
      case 'worker-2': return Package;
      case 'worker-3': return Brain;
      default: return ShieldCheck;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Banner */}
      <div className="bg-white border border-lime-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700 shadow-sm">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Autonomous AI Investigation Floor</h3>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-full flex items-center space-x-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-600 animate-ping" />
                <span>4 Teammates Working Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any teammate below to inspect their real-time investigation pipeline, active tools, and telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-700 bg-lime-50/80 px-3.5 py-2 rounded-xl border border-lime-200 shadow-inner">
          <div className="flex items-center space-x-1 text-lime-600">
            <span className="w-1 bg-lime-600 rounded-full animate-wave-1" />
            <span className="w-1 bg-lime-600 rounded-full animate-wave-2" />
            <span className="w-1 bg-lime-600 rounded-full animate-wave-3" />
            <span className="w-1 bg-lime-600 rounded-full animate-wave-4" />
          </div>
          <span className="font-bold text-lime-800">AI PROPOSES</span>
          <span className="text-lime-400">·</span>
          <span className="font-bold text-slate-900">CODE DECIDES</span>
        </div>
      </div>

      {/* 4 2D Employees Sitting at Desks (Looping Video Feeds) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map((emp) => {
          const IconComp = getWorkerIcon(emp.id);
          const isSelected = selectedWorkerId === emp.id;

          return (
            <button
              key={emp.id}
              onClick={() => setSelectedWorkerId(emp.id)}
              className={`group relative text-left rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white hover:bg-lime-50/30 ${
                isSelected
                  ? 'border-lime-500 ring-2 ring-lime-400/50 shadow-xl shadow-lime-500/15 scale-[1.02]'
                  : 'border-lime-200 hover:border-lime-400 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Seamless Looping Video of Employee Working at Desk */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <video
                  src={emp.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={emp.animatedWebp || emp.image}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onLoadedData={(e) => e.target.play().catch(() => {})}
                >
                  <source src={emp.video} type="video/mp4" />
                  <img
                    src={emp.animatedWebp || emp.image}
                    alt={`${emp.name} working`}
                    className="w-full h-full object-cover object-center"
                  />
                </video>

                {/* Top Corner Teammate Level Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-lime-200 text-[10px] font-mono font-bold text-slate-900 shadow-md">
                  <IconComp className="w-3.5 h-3.5 text-lime-700" />
                  <span>{emp.level}</span>
                </div>

                {/* Working Status Badge with Live Equalizer */}
                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-lime-300 text-[9px] font-mono font-bold text-lime-800 shadow-md">
                  <div className="flex items-center space-x-0.5">
                    <span className="w-0.5 bg-lime-600 rounded-full animate-wave-1" />
                    <span className="w-0.5 bg-lime-600 rounded-full animate-wave-2" />
                    <span className="w-0.5 bg-lime-600 rounded-full animate-wave-3" />
                  </div>
                  <span>WORKING</span>
                </div>

                {/* Selection Indicator Banner */}
                {isSelected && (
                  <div className="absolute inset-x-0 bottom-0 py-1 bg-lime-500 text-center text-[10px] font-mono font-bold text-slate-950 uppercase tracking-wider shadow-md">
                    Viewing Active Workflow
                  </div>
                )}
              </div>

              {/* Info & Live Thought Preview */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-lime-700 transition-colors">
                      {emp.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-lime-800 bg-lime-100 px-1.5 py-0.5 rounded border border-lime-300">
                      ⚡ ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {emp.role}
                  </p>
                </div>

                {/* Live Thought Bubble */}
                <div className="bg-lime-50/70 p-2.5 rounded-xl border border-lime-200 text-[11px] text-slate-700 font-mono leading-relaxed line-clamp-2 shadow-inner">
                  "{emp.thought}"
                </div>

                <div className="pt-2 border-t border-lime-100 flex items-center justify-between text-[11px] font-mono">
                  <span className={`font-semibold transition-colors ${isSelected ? 'text-lime-700' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    {isSelected ? 'Inspecting Tasks' : 'Click to View →'}
                  </span>
                  <span className="text-lime-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ONLINE</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Teammate Sub-Workflow Drawer (Shows details of selected employee) */}
      {selectedWorker && (
        <div className="bg-white border-2 border-lime-300 rounded-2xl p-6 shadow-xl shadow-lime-900/5 space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-lime-100 pb-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-lime-400 shadow-md shadow-lime-500/15 flex-shrink-0">
                <video
                  src={selectedWorker.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={selectedWorker.animatedWebp || selectedWorker.image}
                  className="w-full h-full object-cover"
                  onLoadedData={(e) => e.target.play().catch(() => {})}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedWorker.name}</h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-lime-100 text-lime-900 border border-lime-300">
                    {selectedWorker.level}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-lime-100 text-lime-800 border border-lime-300 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-600 animate-pulse" />
                    <span>STATUS: EXECUTING</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{selectedWorker.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Branch</span>
                <span className="text-xs font-mono font-bold text-lime-700">{selectedWorker.branch}</span>
              </div>
            </div>
          </div>

          {/* Real-time Thought & Mission */}
          <div className="bg-lime-50/80 p-4 rounded-xl border border-lime-200 space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-800 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 animate-pulse text-lime-700" />
              <span>Live Agent Telemetry & Reasoning</span>
            </span>
            <p className="text-sm text-slate-800 font-mono">
              "{selectedWorker.thought}"
            </p>
          </div>

          {/* Workflow Pipeline Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-lime-600" />
                <span>Investigation & Tool Pipeline ({selectedWorker.workflowSteps?.length || 0} Steps)</span>
              </h4>
              <span className="text-[11px] font-mono text-lime-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autonomous Verification: 100%</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedWorker.workflowSteps?.map((wf, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-lime-200 p-4 rounded-xl space-y-2 hover:border-lime-400 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-lime-700">
                      STEP {wf.step}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded">
                      {wf.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{wf.name}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {wf.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-lime-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Tool: <strong className="text-lime-800">{wf.tool}</strong></span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack & Execution Environment */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs font-mono text-slate-500 border-t border-lime-100">
            <div className="flex items-center space-x-2">
              <span>Connected Engines:</span>
              {selectedWorker.techStack?.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-lime-50 rounded text-lime-800 border border-lime-200 text-[10px]">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-400">Current Task:</span>
              <span className="text-slate-800 font-semibold">{selectedWorker.currentTask}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

