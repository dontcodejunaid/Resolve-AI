import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const PATHWAYS = [
  {
    title: 'Path A: 1-Click Order Recovery',
    condition: 'Payment SUCCESS + Stock In Inventory',
    action: 'Order recovered immediately without extra charge',
    color: '#84cc16',
    tag: 'RECOVERY',
    badge: 'AUTONOMOUS',
  },
  {
    title: 'Path B: Human-in-the-Loop Refund',
    condition: 'Item Out of Stock + Amount ≥ ₹500 Threshold',
    action: 'Routes to Store Manager 1-Click Approval Queue',
    color: '#f59e0b',
    tag: 'HITL APPROVAL',
    badge: 'RULE 8 ENFORCED',
  },
  {
    title: 'Path C: Proactive Recon Engine',
    condition: 'Orphan Gateway Debits Detected in Background',
    action: 'Autonomously reconciles before customer files ticket',
    color: '#06b6d4',
    tag: 'PROACTIVE',
    badge: 'ZERO CHURN',
  },
];

export const WorkflowScene: React.FC = () => {
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
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#60a5fa',
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
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 10px #3b82f6',
          }}
        />
        4-WAY CROSS-SYSTEM ORCHESTRATION
      </div>

      {/* Main Headline */}
      <h1
        style={{
          fontSize: 50,
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
        Deterministic Guardrails.{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Zero False Dispatches.
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
        Every decision is validated against 13 strict code rules, banking APIs, and warehouse telemetry.
      </p>

      {/* 3 Pathway Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 26,
          width: '100%',
          maxWidth: 1300,
          marginTop: 44,
        }}
      >
        {PATHWAYS.map((path, idx) => {
          const cardSpring = spring({
            frame: frame - (20 + idx * 18),
            fps,
            config: { damping: 13, stiffness: 95 },
          });

          return (
            <div
              key={path.title}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: `1.5px solid ${path.color}50`,
                borderRadius: 24,
                padding: 28,
                backdropFilter: 'blur(16px)',
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4)`,
                transform: `translateY(${40 * (1 - cardSpring)}px)`,
                opacity: cardSpring,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'monospace',
                      background: `${path.color}20`,
                      color: path.color,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontWeight: 800,
                      border: `1px solid ${path.color}50`,
                    }}
                  >
                    {path.tag}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>
                    {path.badge}
                  </span>
                </div>

                <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                  {path.title}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '8px 12px',
                    borderRadius: 10,
                    marginBottom: 12,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <strong style={{ color: '#e2e8f0' }}>Condition:</strong> {path.condition}
                </div>

                <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.45, margin: 0 }}>
                  {path.action}
                </p>
              </div>

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: path.color,
                  fontWeight: 700,
                }}
              >
                <span>VERIFIED & AUDITED</span>
                <span>&lt; 3.0s</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
