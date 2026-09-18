import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Code,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PRESET_TASKS } from './officeData';

export const TaskPipeline = ({
  workers,
  activeTasks,
  commitLogs,
  onAssignTask,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState('Frontend');
  const [assignedWorkerId, setAssignedWorkerId] = useState('auto');
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateCustomTask = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onAssignTask({
      id: `task-${Date.now()}`,
      title: customTitle,
      type: customType,
      priority: 'High',
      duration: 10,
      points: 85,
      workerId: assignedWorkerId,
    });

    setCustomTitle('');
    setIsAdding(false);
  };

  const handlePresetClick = (preset) => {
    onAssignTask({
      ...preset,
      id: `task-${Date.now()}`,
      workerId: assignedWorkerId,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Dispatch New Engineering Task / Presets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-100">Sprint Task Dispatcher</h4>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1 shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAdding ? 'Close' : 'Custom Task'}
            </button>
          </div>

          {/* Custom Task Form Drawer */}
          <AnimatePresence>
            {isAdding && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateCustomTask}
                className="my-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 overflow-hidden"
              >
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                    Task Title / Feature Spec
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Build Vector Search Pipeline..."
                    className="w-full text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                      Discipline
                    </label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="AI / ML">AI / ML</option>
                      <option value="DevOps">DevOps</option>
                      <option value="QA">QA & Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                      Assignee
                    </label>
                    <select
                      value={assignedWorkerId}
                      onChange={(e) => setAssignedWorkerId(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="auto">Auto-Assign (Swarm)</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.role.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Play className="w-3 h-3 fill-white" /> Dispatch to Engineer
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Quick Presets */}
          <div className="mt-3 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Quick One-Click Tickets
            </span>
            <div className="space-y-1.5">
              {PRESET_TASKS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                      {preset.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {preset.type}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        +{preset.points} pts
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all flex-shrink-0 shadow">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>AI Task Scheduler: Ready</span>
          <span className="text-indigo-400">v2.4 Swarm</span>
        </div>
      </div>

      {/* 2. Active Sprint Queue */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-100">Active Work Queue</h4>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
              {activeTasks.length} In Flight
            </span>
          </div>

          <div className="mt-3 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
            {activeTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <p>No active tasks in queue.</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Select a preset or create a custom task to start coding!
                </p>
              </div>
            ) : (
              activeTasks.map((task) => {
                const assigned = workers.find((w) => w.id === task.workerId);
                return (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate pr-2">
                        {task.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: assigned?.color || '#38bdf8' }}
                        />
                        {assigned?.name || 'Worker Swarm'}
                      </span>
                      <span className="font-mono text-cyan-400">{task.progress || 0}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Sprint Capacity: 100%</span>
          <span className="text-emerald-400">Auto-Scaling</span>
        </div>
      </div>

      {/* 3. Live Git Commit & Build Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-100">Live Commit & CI Feed</h4>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
              CI Passed ✓
            </span>
          </div>

          <div className="mt-3 space-y-2 max-h-[310px] overflow-y-auto font-mono text-xs pr-1">
            {commitLogs.map((log, idx) => (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start gap-2"
              >
                <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">●</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500">
                    <span className="text-indigo-400 font-semibold truncate">{log.author}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">{log.message}</p>
                  <span className="text-[9px] text-slate-600">{log.hash} • {log.branch}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Main: 0 failing tests</span>
          <span className="text-emerald-400">Green Build 🟢</span>
        </div>
      </div>

    </div>
  );
};
