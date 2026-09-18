import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { build3DOfficeEnvironment } from './office3DBuilder';
import { create3DWorker } from './worker3DBuilder';
import { EmployeeAIController } from './aiSimulation';
import { 
  Camera, 
  Sparkles, 
  UserPlus, 
  Coffee, 
  Play, 
  Pause, 
  Maximize2, 
  RotateCcw,
  Compass,
  Cpu,
  Eye
} from 'lucide-react';

const INITIAL_3D_EMPLOYEES = [
  {
    id: 'worker-1',
    name: 'Maya Lin',
    role: 'Payment & Gateway Sentinel',
    suitColor: 0x1e3a8a,      // Royal Navy Suit
    shirtColor: 0xffffff,     // Crisp White Dress Shirt
    tieColor: 0x3b82f6,       // Electric Blue Silk Tie
    pantsColor: 0x1e3a8a,     // Matching Navy Trousers
    skinColor: 0xf5d0b5,      // Warm Natural Skin Tone
    hairColor: 0x1e1e24,      // Dark Hair
    hasGlasses: true,
    hasCoffeeMug: true,
    thought: 'Validating simulated banking gateway response for TXN987654 💳',
  },
  {
    id: 'worker-2',
    name: 'Alex Chen',
    role: 'Order & Inventory Specialist',
    suitColor: 0x064e3b,      // Emerald Forest Tailored Suit
    shirtColor: 0xe0f2fe,     // Light Sky Blue Shirt
    tieColor: 0x10b981,       // Bright Emerald Silk Tie
    pantsColor: 0x064e3b,     // Matching Trousers
    skinColor: 0xc68642,
    hairColor: 0x271911,
    hasGlasses: false,
    hasHeadphones: true,
    thought: 'Checking warehouse inventory stock and cart session CHK-RS-77210 📦',
  },
  {
    id: 'worker-3',
    name: 'Samira Khan',
    role: 'Policy & Cognee Strategist',
    suitColor: 0x4c1d95,      // Deep Royal Purple Suit
    shirtColor: 0xffffff,     // White Dress Shirt
    tieColor: 0x8b5cf6,       // Violet Silk Tie
    pantsColor: 0x4c1d95,     // Matching Violet Trousers
    skinColor: 0xe0ac69,
    hairColor: 0x451a03,
    hasGlasses: true,
    hasHeadphones: false,
    thought: 'Querying Cognee knowledge layer for store recovery policies 🧠',
  },
  {
    id: 'worker-4',
    name: 'Marcus Vance',
    role: 'Verification & Audit Controller',
    suitColor: 0x78350f,      // Amber Bronze Executive Suit
    shirtColor: 0xfef08a,     // Soft Champagne Shirt
    tieColor: 0xf59e0b,       // Amber Gold Silk Tie
    pantsColor: 0x78350f,     // Matching Trousers
    skinColor: 0xfde2e4,
    hairColor: 0x09090b,
    hasGlasses: false,
    hasHeadphones: true,
    thought: 'Enforcing 13 Deterministic Business Rules (AI PROPOSES, CODE DECIDES) 🛡️',
  }
];

export const Tiny3DOffice = ({
  height = '620px',
  theme = 'dark',
  showUI = true,
  showTags = false,
  onWorkerSelect,
  className = '',
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState('isometric');
  const [screenLabels, setScreenLabels] = useState([]);

  // Internal references for animation loop
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controllersRef = useRef([]);
  const deskLocationsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(theme === 'dark' ? 0x090d16 : 0xf1f5f9);

    // 2. Camera Setup (Isometric Angle)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 11, 14);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with Shadows
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. High-End Octane Studio 3-Point Lighting (Key, Fill, Rim)
    // Key Light (Warm Sun Studio Light)
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.6);
    keyLight.position.set(10, 16, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light (Soft Cool Sky Hemisphere Bounce)
    const fillLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 1.3);
    scene.add(fillLight);

    // Rim / Backlight (Pixar Signature Silhouette Highlight)
    const rimLight = new THREE.DirectionalLight(0xdbeafe, 2.2);
    rimLight.position.set(-8, 14, -12);
    scene.add(rimLight);

    // Soft colored accent lights
    const cyanLight = new THREE.PointLight(0x38bdf8, 1.8, 8);
    cyanLight.position.set(-3.5, 2, -2);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 1.8, 8);
    purpleLight.position.set(3.5, 2, -2);
    scene.add(purpleLight);

    // 5. Build 3D Office Environment (Desks, Server, Coffee Station, Whiteboard)
    const { deskLocations } = build3DOfficeEnvironment(scene);
    deskLocationsRef.current = deskLocations;

    // 6. Spawn 3D Workers & AI Controllers
    const controllers = [];
    INITIAL_3D_EMPLOYEES.forEach((empData, index) => {
      const deskLoc = deskLocations[index % deskLocations.length];
      const worker3D = create3DWorker(empData);
      scene.add(worker3D.root);

      const controller = new EmployeeAIController(empData, worker3D, deskLoc);
      controllers.push(controller);
    });
    controllersRef.current = controllers;

    // 7. Mouse Orbit & Interaction Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical(20, Math.PI / 3.5, Math.PI / 4);

    const updateCameraFromSpherical = () => {
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0.8, 0);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spherical.theta -= deltaX * 0.007;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2.1, spherical.phi - deltaY * 0.007));

      updateCameraFromSpherical();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius = Math.max(8, Math.min(30, spherical.radius + e.deltaY * 0.02));
      updateCameraFromSpherical();
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation & Render Loop
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update AI employees with collision & obstacle avoidance
      if (isPlaying) {
        const allCtrls = controllersRef.current;
        allCtrls.forEach((controller) => {
          controller.update(delta, speed, allCtrls);
        });
      }

      // Project 3D worker positions to 2D screen coordinates for overlay bubbles
      const labels = controllersRef.current.map((ctrl) => {
        const headPos = ctrl.model.position.clone();
        headPos.y += 1.4; // above head
        headPos.project(camera);

        const x = (headPos.x * 0.5 + 0.5) * width;
        const y = (-(headPos.y * 0.5) + 0.5) * height;
        const isVisible = headPos.z < 1;

        return {
          id: ctrl.data.id,
          name: ctrl.data.name,
          role: ctrl.data.role,
          thought: ctrl.data.thought,
          state: ctrl.state,
          x,
          y,
          isVisible,
          color: `#${(ctrl.data.tieColor || ctrl.data.suitColor || 0x2563eb).toString(16).padStart(6, '0')}`,
        };
      });

      setScreenLabels(labels);

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 9. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvasEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [theme]);

  // Camera presets
  const handleCameraPreset = (mode) => {
    setCameraMode(mode);
    if (!cameraRef.current) return;

    if (mode === 'isometric') {
      cameraRef.current.position.set(12, 11, 14);
      cameraRef.current.lookAt(0, 1, 0);
    } else if (mode === 'top') {
      cameraRef.current.position.set(0, 20, 0.1);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (mode === 'close') {
      cameraRef.current.position.set(-3.5, 2.2, -0.6);
      cameraRef.current.lookAt(-3.5, 1.1, -2.0);
    } else if (mode === 'turnaround') {
      cameraRef.current.position.set(-3.5, 1.4, 0.2);
      cameraRef.current.lookAt(-3.5, 1.1, -0.5);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none ${className}`}
      style={{ height }}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* 2D Projected Floating Names / Overlays on 3D Workers (if enabled) */}
      {showTags && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {screenLabels.map((lbl) => {
            if (!lbl.isVisible || lbl.x < 0 || lbl.x > 1400 || lbl.y < 0 || lbl.y > 900) {
              return null;
            }

            return (
              <div
                key={lbl.id}
                className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 flex flex-col items-center gap-1"
                style={{ left: `${lbl.x}px`, top: `${lbl.y}px` }}
              >
                {/* Subtle Name Tag Pill */}
                <div className="bg-slate-950/80 border border-slate-800 text-[9px] font-mono text-slate-400 px-2 py-0.5 rounded-md shadow">
                  {lbl.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating 3D Control Deck UI */}
      {showUI && (
        <>
          {/* Top Bar: Live Employees Counter & Camera Presets */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md text-xs font-mono text-slate-200 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">3D Office Swarm</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">5 Tiny Engineers Active</span>
            </div>

            {/* Camera View Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 backdrop-blur-md rounded-2xl p-1 text-xs shadow-lg">
              <button
                onClick={() => handleCameraPreset('isometric')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 font-medium ${
                  cameraMode === 'isometric'
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Isometric</span>
              </button>

              <button
                onClick={() => handleCameraPreset('close')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 font-medium ${
                  cameraMode === 'close'
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Action Typing</span>
              </button>

              <button
                onClick={() => handleCameraPreset('turnaround')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 font-medium ${
                  cameraMode === 'turnaround'
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Character Turnaround</span>
              </button>

              <button
                onClick={() => handleCameraPreset('top')}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 font-medium ${
                  cameraMode === 'top'
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Top Down</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Play/Pause, Speed, Orbit Instructions */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            {/* Navigation Tip */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-[11px] text-slate-400 font-mono shadow">
              <span>🖱️ Drag to Orbit 3D</span>
              <span>•</span>
              <span>Scroll to Zoom</span>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/90 backdrop-blur-md rounded-2xl p-1.5 shadow-lg">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Speed multiplier */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      speed === s
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
