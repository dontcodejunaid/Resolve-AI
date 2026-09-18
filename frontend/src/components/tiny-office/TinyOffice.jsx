import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { OfficeScene } from './OfficeScene';
import { TaskPipeline } from './TaskPipeline';
import { WorkerInspector } from './WorkerInspector';
import { OfficeToolbar } from './OfficeToolbar';
import { soundFx } from './SoundFX';
import { 
  INITIAL_ENGINEERS, 
  TECH_THOUGHTS, 
  GIT_MESSAGES 
} from './officeData';

export const TinyOffice = () => {
  const [workers, setWorkers] = useState(INITIAL_ENGINEERS);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isCrunch, setIsCrunch] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [activeTasks, setActiveTasks] = useState([
    {
      id: 'task-init-1',
      title: 'Optimize 60FPS UI Transitions',
      type: 'Frontend',
      priority: 'High',
      progress: 68,
      workerId: 'worker-1',
    },
    {
      id: 'task-init-2',
      title: 'Scale Cache Invalidation Worker',
      type: 'Backend',
      priority: 'Medium',
      progress: 42,
      workerId: 'worker-2',
    }
  ]);

  const [commitLogs, setCommitLogs] = useState([
    {
      id: 'c-1',
      author: 'Alex Chen',
      message: 'feat: add smooth spring physics to layout transitions',
      hash: 'a7f39b1',
      branch: 'feature/smooth-animations',
      time: '1m ago',
    },
    {
      id: 'c-2',
      author: 'Samira Khan',
      message: 'perf: shard postgres database cluster partition table',
      hash: '9d2e10c',
      branch: 'perf/distributed-cache-v3',
      time: '3m ago',
    },
    {
      id: 'c-3',
      author: 'Elena Rostova',
      message: 'infra: k8s ingress autoscaling policy configured',
      hash: '4b88f21',
      branch: 'infra/zero-downtime-deploy',
      time: '6m ago',
    }
  ]);

  // Overall statistics
  const [stats, setStats] = useState({
    totalLoc: 138190,
    totalBugs: 357,
    totalCoffee: 30,
  });

  // Keep soundFx mute state synced
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Toggle crunch mode
  const handleToggleCrunch = () => {
    const nextCrunch = !isCrunch;
    setIsCrunch(nextCrunch);
    if (nextCrunch) {
      soundFx.playCrunchWarning();
    }
  };

  // Quick coffee boost on desk
  const handleQuickBoost = (workerId) => {
    soundFx.playCoffeeBoost();
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            coffeeCups: (w.coffeeCups || 0) + 1,
            typingSpeed: Math.min(3.0, +(w.typingSpeed + 0.2).toFixed(1)),
            thought: 'Caffeine power surge! Writing ultra-clean code ☕⚡',
          };
        }
        return w;
      })
    );
    setStats((prev) => ({ ...prev, totalCoffee: prev.totalCoffee + 1 }));
  };

  // Praise PR from modal
  const handlePraisePR = (workerId) => {
    soundFx.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            state: 'celebrating',
            bugsFixed: w.bugsFixed + 1,
            thought: 'PR merged with unanimous LGTMs! 🚀🎉',
          };
        }
        return w;
      })
    );
    setStats((prev) => ({ ...prev, totalBugs: prev.totalBugs + 1 }));
  };

  // Toggle glasses/headphones
  const handleToggleGear = (workerId, gearKey) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const updated = { ...w, [gearKey]: !w[gearKey] };
          if (selectedWorker?.id === workerId) {
            setSelectedWorker(updated);
          }
          return updated;
        }
        return w;
      })
    );
  };

  // Hire new engineer
  const handleHireWorker = ({ name, role, color }) => {
    soundFx.playSuccessChime();
    const newId = `worker-${Date.now()}`;
    const newWorker = {
      id: newId,
      name,
      role,
      title: `Specialist (${role.split(' ')[0]})`,
      level: 'L4',
      color,
      hoodieColor: color,
      shirtColor: '#94a3b8',
      hairColor: '#1e1e24',
      skinTone: '#fcd34d',
      hasGlasses: Math.random() > 0.5,
      hasHeadphones: true,
      typingSpeed: 1.2,
      state: 'coding',
      thought: 'Setting up local workspace & cloning repo 🚀',
      loc: 1200,
      coffeeCups: 1,
      bugsFixed: 2,
      branch: `feat/${name.toLowerCase().replace(/\s+/g, '-')}-init`,
      techStack: ['React', 'TypeScript', 'Node.js', 'Docker'],
      currentTask: 'Onboarding & Setting Up Environment',
      progress: 10,
      deskItems: {
        duck: true,
        stickers: ['react'],
        drink: 'coffee',
        monitorSetup: 'dual',
      },
    };

    setWorkers((prev) => [...prev, newWorker]);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  // Assign task from pipeline
  const handleAssignTask = (task) => {
    let targetWorkerId = task.workerId;
    if (!targetWorkerId || targetWorkerId === 'auto') {
      // Pick random worker
      const randomW = workers[Math.floor(Math.random() * workers.length)];
      targetWorkerId = randomW?.id || workers[0]?.id;
    }

    const newTask = {
      ...task,
      progress: 0,
      workerId: targetWorkerId,
    };

    setActiveTasks((prev) => [newTask, ...prev]);

    // Update worker's current task
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === targetWorkerId) {
          return {
            ...w,
            currentTask: task.title,
            progress: 0,
            state: 'coding',
            thought: `Working on: ${task.title.slice(0, 32)}... 💻`,
          };
        }
        return w;
      })
    );
  };

  // Real-time simulation loop
  useEffect(() => {
    const intervalTime = Math.max(200, Math.floor(1000 / simSpeed));
    const timer = setInterval(() => {
      // Increment active tasks progress
      setActiveTasks((prevTasks) => {
        let completedAny = false;

        const updated = prevTasks.map((t) => {
          const increment = (isCrunch ? 8 : 4) * simSpeed;
          const nextProgress = Math.min(100, (t.progress || 0) + increment);

          if (nextProgress >= 100 && (t.progress || 0) < 100) {
            completedAny = true;
            // Generate commit log
            const assignedWorker = workers.find((w) => w.id === t.workerId);
            const author = assignedWorker?.name || 'Tiny Worker';
            const randomMsg = GIT_MESSAGES[Math.floor(Math.random() * GIT_MESSAGES.length)];
            const newCommit = {
              id: `commit-${Date.now()}-${Math.random()}`,
              author,
              message: `feat(${t.type.toLowerCase().slice(0, 4)}): ${t.title}`,
              hash: Math.random().toString(16).slice(2, 9),
              branch: assignedWorker?.branch || 'main',
              time: 'Just now',
            };

            setCommitLogs((prevLogs) => [newCommit, ...prevLogs.slice(0, 15)]);
            setStats((prev) => ({
              ...prev,
              totalLoc: prev.totalLoc + Math.floor(120 + Math.random() * 300),
              totalBugs: prev.totalBugs + 1,
            }));
          }

          return { ...t, progress: nextProgress };
        });

        if (completedAny) {
          soundFx.playSuccessChime();
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.5 },
          });
        }

        // Filter out completed after delay
        return updated.filter((t) => t.progress < 100);
      });

      // Periodically update workers stats & thoughts
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) => {
          const isWorking = Math.random() > 0.2;
          const locDelta = isWorking ? Math.floor((isCrunch ? 24 : 8) * w.typingSpeed) : 0;
          const nextLoc = w.loc + locDelta;

          // Occasionally change thought bubble
          let newThought = w.thought;
          if (Math.random() < 0.12) {
            newThought = TECH_THOUGHTS[Math.floor(Math.random() * TECH_THOUGHTS.length)];
          }

          return {
            ...w,
            loc: nextLoc,
            thought: newThought,
            progress: (w.progress + (isCrunch ? 6 : 2)) % 100,
          };
        })
      );
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simSpeed, isCrunch, workers]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* 1. Office Control Toolbar & Live Telemetry */}
      <OfficeToolbar
        isCrunch={isCrunch}
        onToggleCrunch={handleToggleCrunch}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        simSpeed={simSpeed}
        onChangeSpeed={setSimSpeed}
        onHireWorker={handleHireWorker}
        stats={stats}
      />

      {/* 2. Main Open-Plan Office Scene */}
      <OfficeScene
        workers={workers}
        selectedWorker={selectedWorker}
        onSelectWorker={(w) => setSelectedWorker(w)}
        isCrunch={isCrunch}
        onQuickBoost={handleQuickBoost}
      />

      {/* 3. Task Pipeline, Active Tickets & Commit Feed */}
      <TaskPipeline
        workers={workers}
        activeTasks={activeTasks}
        commitLogs={commitLogs}
        onAssignTask={handleAssignTask}
      />

      {/* 4. Selected Worker Inspector Drawer */}
      <WorkerInspector
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
        onBoostCoffee={handleQuickBoost}
        onPraisePR={handlePraisePR}
        onToggleGear={handleToggleGear}
      />
    </div>
  );
};
