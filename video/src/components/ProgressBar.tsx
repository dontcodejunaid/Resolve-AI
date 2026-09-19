import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const STAGES = [
  { label: '01. THE CRISIS', startFrame: 0, endFrame: 360 },
  { label: '02. RESOLVE AI', startFrame: 360, endFrame: 720 },
  { label: '03. 4-WAY ENGINE', startFrame: 720, endFrame: 1020 },
  { label: '04. BUSINESS MODEL & ROI', startFrame: 1020, endFrame: 1260 },
  { label: '05. THE FUTURE', startFrame: 1260, endFrame: 1350 },
];

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  const currentStage =
    STAGES.find((s) => frame >= s.startFrame && frame < s.endFrame) || STAGES[STAGES.length - 1];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 35,
        left: 60,
        right: 60,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          fontFamily: 'monospace',
          fontWeight: 700,
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {STAGES.map((s, idx) => {
            const isActive = frame >= s.startFrame && frame < s.endFrame;
            return (
              <span
                key={idx}
                style={{
                  color: isActive ? '#a3e635' : '#475569',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isActive && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: '#84cc16',
                    }}
                  />
                )}
                {s.label}
              </span>
            );
          })}
        </div>

        <span style={{ color: '#84cc16' }}>
          {Math.floor((frame / 30) * 10) / 10}s / {Math.floor(durationInFrames / 30)}s
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 99,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #84cc16 0%, #10b981 100%)',
            borderRadius: 99,
            boxShadow: '0 0 12px #84cc16',
          }}
        />
      </div>
    </div>
  );
};
