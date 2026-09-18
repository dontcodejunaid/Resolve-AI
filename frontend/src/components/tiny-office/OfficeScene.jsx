import React from 'react';
import { motion } from 'framer-motion';
import { WorkerDesk } from './WorkerDesk';
import { 
  Server, 
  Coffee, 
  Cpu, 
  Activity, 
  Wifi, 
  Zap, 
  Radio, 
  Code2, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';

export const OfficeScene = ({
  workers,
  selectedWorker,
  onSelectWorker,
  isCrunch,
  onQuickBoost,
  serverStatus = 'healthy', // 'healthy', 'overloaded', 'restarting'
}) => {
  return (
    <div className="relative w-full rounded-3xl bg-slate-950/80 border border-slate-800/80 p-5 lg:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Dynamic Background Office Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      {/* Office Floor Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Office Decor: Architecture Whiteboard, Server Rack, Coffee Bar */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Architecture & Sprint Whiteboard */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">Sprint Architecture</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              v2.4-prod
            </span>
          </div>

          <div className="my-2.5 grid grid-cols-3 gap-2">
            {/* Sticky Notes */}
            <div className="bg-amber-400/90 text-amber-950 p-2 rounded shadow text-[10px] font-medium rotate-[-2deg] flex flex-col justify-between h-14">
              <span>Auth Microservice</span>
              <span className="text-[8px] font-bold self-end text-amber-900">DONE ✓</span>
            </div>
            <div className="bg-cyan-400/90 text-cyan-950 p-2 rounded shadow text-[10px] font-medium rotate-[2deg] flex flex-col justify-between h-14">
              <span>Async Worker Swarm</span>
              <span className="text-[8px] font-bold self-end text-cyan-900">IN PROGRESS</span>
            </div>
            <div className="bg-rose-400/90 text-rose-950 p-2 rounded shadow text-[10px] font-medium rotate-[-1deg] flex flex-col justify-between h-14">
              <span>Zero-Day Audit</span>
              <span className="text-[8px] font-bold self-end text-rose-900">TESTING</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
            <span>Sprint Velocity: 94 pts</span>
            <span className="text-emerald-400">● 99.98% SLA</span>
          </div>
        </div>

        {/* Server Rack & Infrastructure Node */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Main Cluster Node</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
            </div>
          </div>

          {/* Animated Server Blinking LEDs */}
          <div className="my-2 bg-slate-950 rounded-lg p-2.5 border border-slate-800/90 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-cyan-400" /> CPU Cluster
              </span>
              <span className="text-slate-200">{isCrunch ? '89%' : '34%'}</span>
            </div>
            <div className="grid grid-cols-8 gap-1 py-1">
              {[...Array(16)].map((_, i) => (
                <motion.span
                  key={i}
                  className="h-1.5 rounded-xs block"
                  animate={{
                    backgroundColor:
                      isCrunch
                        ? i % 3 === 0
                          ? '#ef4444'
                          : '#f59e0b'
                        : i % 4 === 0
                        ? '#3b82f6'
                        : '#10b981',
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8 + (i % 5) * 0.2,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-indigo-400" /> 10 Gbps Mesh
            </span>
            <span className="text-slate-300">0 dropped pkts</span>
          </div>
        </div>

        {/* Office Coffee & Espresso Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Fuel & Espresso Bar</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Fresh Brew ☕
            </span>
          </div>

          <div className="my-2 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-11 bg-slate-800 rounded-md border border-slate-700 flex flex-col items-center justify-center">
                <div className="w-4 h-1 bg-amber-500 rounded-full mb-1" />
                <div className="w-5 h-4 bg-slate-900 rounded-sm flex items-center justify-center">
                  <span className="text-[7px]">☕</span>
                </div>
                {/* Coffee steam */}
                <motion.div
                  animate={{ y: [-2, -6, -2], opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute -top-3 text-[10px] text-amber-200"
                >
                  ~
                </motion.div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-200">Colombian Dark Roast</p>
                <p className="text-[10px] text-slate-400">Boosts typing speed +25%</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-amber-400">
                {workers.reduce((acc, w) => acc + (w.coffeeCups || 0), 0)}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Cups Today</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
            <span>Snack Stock: 98%</span>
            <span className="text-amber-400">Boba Refilled 🧋</span>
          </div>
        </div>
      </div>

      {/* Main Engineering Open Plan Area */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Open Plan Workstations</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {workers.length} Engineers Active
              </span>
            </h3>
          </div>

          {isCrunch && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              CRUNCH SPRINT MODE ACTIVE
            </motion.div>
          )}
        </div>

        {/* Worker Desks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {workers.map((worker) => (
            <WorkerDesk
              key={worker.id}
              worker={worker}
              isSelected={selectedWorker?.id === worker.id}
              onSelect={onSelectWorker}
              isCrunch={isCrunch}
              onQuickBoost={onQuickBoost}
            />
          ))}
        </div>
      </div>

      {/* Potted Floor Decor & Office Plants */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            🌿 Office Monstera Deliciosa (Watered)
          </span>
          <span className="hidden sm:inline text-slate-650">•</span>
          <span className="hidden sm:inline text-slate-400">
            Ergonomic Standing Desks calibrated
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Fiber Optic Mesh: 0.4ms ping</span>
        </div>
      </div>
    </div>
  );
};
