import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Background: React.FC<{ accentColor?: string }> = ({
  accentColor = '#84cc16',
}) => {
  const frame = useCurrentFrame();

  const pulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.15, 0.35]);
  const rotateGlow = (frame * 0.4) % 360;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#090d0b',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Dynamic Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor} 0%, rgba(16, 185, 129, 0.2) 40%, transparent 70%)`,
          opacity: pulse,
          filter: 'blur(120px)',
          transform: `rotate(${rotateGlow}deg)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)',
          opacity: pulse * 0.8,
          filter: 'blur(140px)',
        }}
      />

      {/* Cybernetic Tech Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.8,
        }}
      />

      {/* Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, transparent 40%, rgba(9, 13, 11, 0.85) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
