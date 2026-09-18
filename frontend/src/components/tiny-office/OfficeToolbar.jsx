import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  UserPlus, 
  Zap, 
  Coffee, 
  Bug, 
  GitPullRequest, 
  Terminal,
  Sparkles,
  X
} from 'lucide-react';

export const OfficeToolbar = ({
  isCrunch,
  onToggleCrunch,
  isMuted,
  onToggleMute,
  simSpeed,
  onChangeSpeed,
  onHireWorker,
  stats,
}) => {
  const [showHireModal, setShowHireModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Frontend Engineer');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleHireSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onHireWorker({
      name: newName,
      role: newRole,
      color: newColor,
    });

    setNewName('');
    setShowHireModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Quick Office Telemetry & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-xl">
        
        {/* Left: Office Live Metric Counters */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Total LOC:</span>
            <span className="font-bold text-cyan-300">{stats.totalLoc.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Bugs Squashed:</span>
            <span className="font-bold text-rose-300">{stats.totalBugs}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Coffee Fuel:</span>
            <span className="font-bold text-amber-300">{stats.totalCoffee}</span>
          </div>
        </div>

        {/* Right: Interactive Mode Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
              !isMuted
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isMuted ? 'Unmute Mechanical Keyboard Audio' : 'Mute Audio'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline font-mono">{isMuted ? 'Muted' : 'SFX ON'}</span>
          </button>

          {/* Speed Selector (1x, 2x, 3x) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            {[1, 2, 3].map((speed) => (
              <button
                key={speed}
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  simSpeed === speed
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Crunch Sprint Mode Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCrunch}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-lg ${
              isCrunch
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400 shadow-rose-600/30 animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Flame className={`w-4 h-4 ${isCrunch ? 'text-amber-300 fill-amber-300 animate-bounce' : 'text-rose-400'}`} />
            <span>{isCrunch ? 'CRUNCH SPRINT ON' : 'Crunch Mode'}</span>
          </motion.button>

          {/* Hire New Engineer Button */}
          <button
            onClick={() => setShowHireModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Hire Engineer</span>
          </button>
        </div>
      </div>

      {/* Hire Engineer Modal */}
      <AnimatePresence>
        {showHireModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-100">Hire New Software Engineer</h3>
                </div>
                <button
                  onClick={() => setShowHireModal(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Engineer Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Jordan Reed"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Specialization & Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Frontend Ninja">Frontend Ninja (React/CSS/TypeScript)</option>
                    <option value="Backend Architect">Backend Architect (Go/Rust/Distributed)</option>
                    <option value="AI / ML Scientist">AI / ML Scientist (PyTorch/Transformers)</option>
                    <option value="DevOps & Cloud">DevOps & Cloud Lead (Kubernetes/AWS)</option>
                    <option value="QA & Security">QA & Bug Hunter (Playwright/Pentesting)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Hoodie Accent Color</label>
                  <div className="flex items-center gap-3">
                    {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          newColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Welcome to the Team 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
