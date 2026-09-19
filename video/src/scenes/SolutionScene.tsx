import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WORKERS = [
  {
    name: 'Alex',
    role: 'Vision AI & Ingestion',
    color: '#06b6d4',
    badge: 'INGEST',
    desc: 'Extracts bank screenshot receipts, UPI TXN IDs, and order tokens in 100ms with zero manual data entry.',
  },
  {
    name: 'Marcus',
    role: 'Cross-System Investigator',
    color: '#3b82f6',
    badge: 'QUERY',
    desc: 'Simultaneously cross-queries Banking Gateway, Storefront OMS, and Warehouse inventory in parallel.',
  },
  {
    name: 'Maya',
    role: 'Policy & Guardrails',
    color: '#a855f7',
    badge: 'RULES',
    desc: 'Enforces 13 deterministic code rules and threshold checks. Zero AI hallucinations or unauthorized payouts.',
  },
  {
    name: 'Samira',
    role: 'Action & Verification',
    color: '#84cc16',
    badge: 'RESOLVE',
    desc: 'Executes 1-click cart recovery, dispatches store manager approvals, and sends instant SMS confirmations.',
  },
];

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 80px',
        color: '#ffffff',
      }}
    >
      {/* Category Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(132, 204, 22, 0.15)',
          border: '1px solid rgba(132, 204, 22, 0.4)',
          color: '#a3e635',
          padding: '6px 16px',
          borderRadius: 99,
          fontSize: 13,
          fontWeight: 800,
          fontFamily: 'monospace',
          marginBottom: 16,
          transform: `translateY(${20 * (1 - titleSpring)}px)`,
          opacity: titleSpring,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#84cc16',
            boxShadow: '0 0 10px #84cc16',
          }}
        />
        INTRODUCING RESOLVE AI
      </div>

      {/* Main Headline */}
      <h1
        style={{
          fontSize: 52,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: 1150,
          margin: 0,
          transform: `scale(${interpolate(titleSpring, [0, 1], [0.92, 1])})`,
          opacity: titleSpring,
        }}
      >
        The Autonomous AI Teammate That Takes{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #84cc16 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          End-to-End Accountability.
        </span>
      </h1>

      <p
        style={{
          fontSize: 20,
          color: '#cbd5e1',
          textAlign: 'center',
          maxWidth: 900,
          marginTop: 12,
          lineHeight: 1.5,
          opacity: titleSpring,
        }}
      >
        Built on the inviolable core principle: <strong style={{ color: '#84cc16' }}>"AI Proposes. Code Decides."</strong>{' '}
        A collaborative multi-agent workforce resolving cases in under 3 seconds.
      </p>

      {/* 4 AI Teammates Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          width: '100%',
          maxWidth: 1350,
          marginTop: 40,
        }}
      >
        {WORKERS.map((worker, idx) => {
          const cardSpring = spring({
            frame: frame - (20 + idx * 15),
            fps,
            config: { damping: 13, stiffness: 100 },
          });

          return (
            <div
              key={worker.name}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: `1.5px solid ${worker.color}40`,
                borderRadius: 22,
                padding: 24,
                backdropFilter: 'blur(16px)',
                boxShadow: `0 15px 35px rgba(0, 0, 0, 0.4)`,
                transform: `translateY(${35 * (1 - cardSpring)}px)`,
                opacity: cardSpring,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: `${worker.color}25`,
                        border: `1px solid ${worker.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: worker.color,
                        fontWeight: 900,
                        fontSize: 14,
                        fontFamily: 'monospace',
                      }}
                    >
                      {worker.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                        {worker.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                        {worker.role}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      background: `${worker.color}20`,
                      color: worker.color,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontWeight: 800,
                      border: `1px solid ${worker.color}60`,
                    }}
                  >
                    {worker.badge}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12.5,
                    color: '#94a3b8',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  {worker.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: worker.color,
                  fontWeight: 700,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: worker.color,
                  }}
                />
                AUTONOMOUS · ACTIVE
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
