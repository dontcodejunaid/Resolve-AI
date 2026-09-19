import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const BrandBadge: React.FC<{ subtitle?: string }> = ({
  subtitle = 'Autonomous Payment Resolution Engine',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: 60,
        right: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        opacity: entrance,
        transform: `translateY(${(-20 * (1 - entrance))}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #84cc16 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(132, 204, 22, 0.4)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#090d0b" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              RESOLVE<span style={{ color: '#84cc16' }}>.ai</span>
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                fontFamily: 'monospace',
                background: 'rgba(132, 204, 22, 0.15)',
                color: '#a3e635',
                border: '1px solid rgba(132, 204, 22, 0.4)',
                padding: '2px 8px',
                borderRadius: 99,
                letterSpacing: '0.05em',
              }}
            >
              PITCH 2026
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#94a3b8',
              fontFamily: 'monospace',
              letterSpacing: '0.02em',
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {/* Live System Telemetry Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '8px 16px',
          borderRadius: 99,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#84cc16',
            boxShadow: '0 0 10px #84cc16',
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#e2e8f0',
            fontWeight: 700,
          }}
        >
          AI PROPOSES · CODE DECIDES
        </span>
      </div>
    </div>
  );
};
