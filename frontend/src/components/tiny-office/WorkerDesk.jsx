import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineerAvatar } from './EngineerAvatar';
import { soundFx } from './SoundFX';
import { 
  Flame, 
  Coffee, 
  CheckCircle2, 
  Terminal, 
  Sparkles,
  GitBranch,
  Cpu
} from 'lucide-react';

export const WorkerDesk = ({
  worker,
  isSelected,
  onSelect,
  isCrunch = false,
  onQuickBoost,
}) => {
  const [activeCodeLine, setActiveCodeLine] = useState(0);

  // Monitor code animation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCodeLine((prev) => (prev + 1) % 8);
      if (!isCrunch && Math.random() > 0.6) {
        soundFx.playKeyClick(worker.typingSpeed);
      } else if (isCrunch) {
        soundFx.playKeyClick(worker.typingSpeed * 1.3);
      }
    }, isCrunch ? 180 : 360);

    return () => clearInterval(interval);
  }, [isCrunch, worker.typingSpeed]);

  const monitorType = worker.deskItems?.monitorSetup || 'dual';

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(worker)}
      className={`relative group cursor-pointer p-4 rounded-2xl transition-all duration-300 ${
        isSelected
          ? 'bg-slate-800/90 ring-2 ring-indigo-400 shadow-xl shadow-indigo-500/20'
          : 'bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800/80 hover:border-slate-700'
      } backdrop-blur-md`}
    >
      {/* Crunch Fire Aura if active */}
      {isCrunch && (
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-orange-500/20 blur-sm pointer-events-none animate-pulse" />
      )}

      {/* Thought / Status Bubble */}
      <AnimatePresence>
        <motion.div
          key={worker.thought}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[210px] w-max"
        >
          <div className="bg-slate-900/95 border border-slate-700/80 text-slate-200 text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="truncate max-w-[170px] font-medium">{worker.thought}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Top Bar: Name, Role Badge, Quick Boost */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-700 flex-shrink-0"
            style={{ backgroundColor: worker.color }}
          />
          <span className="font-semibold text-sm text-slate-100 truncate">
            {worker.name}
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
            {worker.level}
          </span>
        </div>

        <button
          title="Give Coffee Boost ☕"
          onClick={(e) => {
            e.stopPropagation();
            onQuickBoost(worker.id);
          }}
          className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors flex items-center gap-1 text-[11px] font-medium"
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{worker.coffeeCups}</span>
        </button>
      </div>

      {/* Workstation Desk Area */}
      <div className="relative h-44 w-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-xl border border-slate-800 flex flex-col justify-end items-center overflow-hidden p-2">
        {/* Desk Backdrop Ambient Glow */}
        <div 
          className="absolute inset-0 opacity-15 blur-2xl pointer-events-none"
          style={{ backgroundColor: worker.color }}
        />

        {/* Floating Code Matrix Particle in background */}
        <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-600 select-none space-y-0.5 opacity-60">
          <div>$ git status</div>
          <div className="text-emerald-500/70">{worker.branch}</div>
        </div>

        {/* Monitors & Tech Hardware Setup */}
        <div className="relative z-10 flex items-end justify-center gap-2 mb-1">
          {/* Secondary Monitor (Vertical or Standard) */}
          {(monitorType === 'dual' || monitorType === 'vertical-dual' || monitorType === 'triple') && (
            <div className={`relative ${monitorType === 'vertical-dual' ? 'w-10 h-18' : 'w-16 h-12'} bg-slate-950 rounded-t-md border-2 border-slate-700 shadow-md flex flex-col p-1 overflow-hidden`}>
              {/* Terminal / Code stream on 2nd monitor */}
              <div className="w-full flex items-center justify-between pb-0.5 border-b border-slate-800 text-[6px] text-slate-500 font-mono">
                <span className="text-indigo-400">term</span>
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-0.5 mt-1">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-0.5 rounded-full"
                    style={{
                      width: `${40 + ((i * 17) % 55)}%`,
                      backgroundColor: i === activeCodeLine ? '#38bdf8' : '#334155',
                    }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              {/* Stand */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-slate-600 rounded-t-sm" />
            </div>
          )}

          {/* Primary Main Monitor / Laptop */}
          <div className="relative w-24 h-16 bg-slate-950 rounded-t-lg border-2 border-slate-600 shadow-xl flex flex-col p-1.5 overflow-hidden">
            {/* Monitor Header with IDE tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[7px] font-mono text-slate-400 truncate max-w-[45px]">
                {worker.role.split(' ')[0]}.tsx
              </span>
            </div>

            {/* Glowing Syntax Highlighting Editor */}
            <div className="space-y-1 mt-1 font-mono">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <span className="text-[6px] text-slate-600 w-2">{i + 1}</span>
                  <div
                    className="h-1 rounded-full transition-all duration-200"
                    style={{
                      width: `${30 + ((i * 23) % 60)}%`,
                      backgroundColor:
                        i === activeCodeLine % 5
                          ? '#10b981'
                          : i % 2 === 0
                          ? '#818cf8'
                          : '#f59e0b',
                      opacity: i === activeCodeLine % 5 ? 1 : 0.7,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Monitor Stand */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-slate-500 rounded-t-sm" />
          </div>

          {/* Laptop Side Machine */}
          <div className="relative w-14 h-10 bg-slate-900 rounded-t-md border border-slate-700 shadow-sm flex flex-col p-1">
            <div className="w-full h-full bg-slate-950 rounded-sm flex items-center justify-center relative overflow-hidden">
              <span className="text-[6px] font-mono text-cyan-400 animate-pulse">
                {worker.techStack[0]}
              </span>
              {/* Laptop back sticker */}
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
            </div>
          </div>
        </div>

        {/* Desk Surface (Warm Modern Wood Grain) */}
        <div className="relative w-full h-12 bg-gradient-to-r from-amber-900/80 via-amber-800/80 to-amber-900/80 rounded-lg border-t border-amber-600/40 shadow-inner flex items-center justify-between px-3">
          {/* Desk Mat & RGB Keyboard */}
          <div className="relative w-28 h-5 bg-slate-950 rounded border border-slate-700/80 mx-auto flex items-center justify-center shadow">
            {/* RGB Underglow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/40 via-emerald-500/40 to-blue-500/40 rounded blur-xs animate-pulse opacity-75" />
            {/* Keyboard Keys */}
            <div className="relative z-10 grid grid-cols-8 gap-0.5 w-24">
              {[...Array(16)].map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-1 rounded-[1px] bg-slate-700 block"
                  style={{
                    backgroundColor: i === (activeCodeLine * 2) % 16 ? '#38bdf8' : '#475569'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Coffee Mug with Animated Steam */}
          <div className="absolute left-3 top-2 flex flex-col items-center">
            <motion.div
              animate={{ y: [-1, -4, -1], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[9px] select-none text-slate-400"
            >
              ~
            </motion.div>
            <div className="w-3.5 h-4 rounded-sm bg-slate-200 border border-slate-300 shadow flex items-center justify-center relative">
              <div className="w-2 h-1.5 rounded-full bg-amber-900" />
              <div className="absolute -right-1 top-1 w-1 h-2 rounded-r-full border border-slate-300" />
            </div>
          </div>

          {/* Rubber Duck / Mascot */}
          {worker.deskItems?.duck && (
            <div
              title="Rubber Duck Debugger"
              className="absolute right-3 top-2 w-3.5 h-3.5 bg-yellow-400 rounded-full border border-yellow-500 shadow flex items-center justify-center text-[7px]"
            >
              🦆
            </div>
          )}
        </div>

        {/* Engineer Seated in Chair */}
        <div className="absolute bottom-1 z-20 pointer-events-none">
          <EngineerAvatar
            worker={worker}
            isTyping={worker.state !== 'thinking'}
            isCrunch={isCrunch}
            size={96}
          />
        </div>
      </div>

      {/* Bottom Task & Progress Indicator */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium truncate max-w-[150px]">
            {worker.currentTask || 'Idle / Reviewing PRs'}
          </span>
          <span className="text-slate-300 font-mono text-[11px] font-semibold">
            {worker.progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: worker.color,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${worker.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Footer Pills: Tech tags */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          {worker.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/40"
            >
              {tech}
            </span>
          ))}
          {worker.techStack.length > 3 && (
            <span className="text-[10px] text-slate-500 font-mono">
              +{worker.techStack.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
