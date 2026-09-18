import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineerAvatar } from './EngineerAvatar';
import { 
  X, 
  Coffee, 
  Sparkles, 
  GitBranch, 
  CheckCircle2, 
  Bug, 
  Terminal, 
  Code2, 
  Award,
  Zap,
  Glasses,
  Headphones
} from 'lucide-react';
import { CODE_SNIPPETS } from './officeData';

export const WorkerInspector = ({
  worker,
  onClose,
  onBoostCoffee,
  onPraisePR,
  onToggleGear,
}) => {
  if (!worker) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh] space-y-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full ring-2 ring-slate-700"
                style={{ backgroundColor: worker.color }}
              />
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {worker.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    {worker.level}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{worker.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Engineer Avatar Spotlight & Live State */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex-shrink-0 bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 shadow-inner">
              <EngineerAvatar worker={worker} isTyping={true} size={120} />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  {worker.state.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 italic">
                "{worker.thought}"
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-slate-400 pt-1">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate max-w-[200px]">{worker.branch}</span>
              </div>
            </div>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Lines of Code</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {worker.loc.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Bugs Squashed</span>
              <span className="text-base font-bold font-mono text-rose-400 flex items-center justify-center gap-1">
                <Bug className="w-3.5 h-3.5" />
                {worker.bugsFixed}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Coffee Fuel</span>
              <span className="text-base font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
                <Coffee className="w-3.5 h-3.5" />
                {worker.coffeeCups}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Typing Speed</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {worker.typingSpeed}x
              </span>
            </div>
          </div>

          {/* Motivation & Worker Actions */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Engineer Motivation & Actions
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onBoostCoffee(worker.id)}
                className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Coffee className="w-4 h-4" /> Double Espresso (+20% Spd)
              </button>

              <button
                onClick={() => onPraisePR(worker.id)}
                className="py-2.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" /> Praise PR (Ship It!)
              </button>
            </div>
          </div>

          {/* Wardrobe & Gear Customizer */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Engineer Gear & Attire
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleGear(worker.id, 'hasGlasses')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-colors ${
                  worker.hasGlasses
                    ? 'bg-slate-800 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Glasses className="w-4 h-4" />
                Glasses {worker.hasGlasses ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => onToggleGear(worker.id, 'hasHeadphones')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-colors ${
                  worker.hasHeadphones
                    ? 'bg-slate-800 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Headphones className="w-4 h-4" />
                Headphones {worker.hasHeadphones ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Tech Stack & Core Competencies
            </span>
            <div className="flex flex-wrap gap-2">
              {worker.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Live Code Stream Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Active Buffer
              </span>
              <span>UTF-8</span>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto">
              <code>{CODE_SNIPPETS[Math.abs(worker.name.length) % CODE_SNIPPETS.length]}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
