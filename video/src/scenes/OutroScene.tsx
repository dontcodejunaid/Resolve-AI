import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const buttonSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const badgeSpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const pulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.95, 1.05]);

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
        THE AUTONOMOUS E-COMMERCE FUTURE
      </div>

      {/* Main Headline */}
      <h1
        style={{
          fontSize: 54,
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
        Turn Payment Drop-Offs Into{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #84cc16 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lifetime Customer Loyalty.
        </span>
      </h1>

      <p
        style={{
          fontSize: 22,
          color: '#cbd5e1',
          textAlign: 'center',
          maxWidth: 860,
          marginTop: 14,
          lineHeight: 1.5,
          opacity: titleSpring,
        }}
      >
        Zero manual ticket queues. 100% deterministic code guardrails. Sub-3s automated recovery.
      </p>

      {/* Animated Call-To-Action Card */}
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          transform: `scale(${interpolate(buttonSpring, [0, 1], [0.85, 1])}) translateY(${
            30 * (1 - buttonSpring)
          }px)`,
          opacity: buttonSpring,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            background: 'linear-gradient(135deg, #84cc16 0%, #10b981 100%)',
            color: '#090d0b',
            padding: '18px 42px',
            borderRadius: 99,
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            boxShadow: '0 0 40px rgba(132, 204, 22, 0.45)',
            transform: `scale(${pulse})`,
          }}
        >
          <span>Deploy RESOLVE AI Today</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#090d0b" strokeWidth="2.8">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Integration Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            transform: `translateY(${20 * (1 - badgeSpring)}px)`,
            opacity: badgeSpring,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            INTEGRATES WITH: SHOPIFY · STRIPE · RAZORPAY · WOOCOMMERCE
          </span>

          <span
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#a3e635',
              background: 'rgba(132, 204, 22, 0.12)',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid rgba(132, 204, 22, 0.3)',
            }}
          >
            5-MINUTE SDK SETUP
          </span>
        </div>
      </div>
    </div>
  );
};
