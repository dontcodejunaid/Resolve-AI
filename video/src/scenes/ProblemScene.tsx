import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const card1Spring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const card2Spring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const statCardSpring = spring({
    frame: frame - 100,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const glitchOpacity = interpolate(
    Math.sin(frame / 3),
    [-1, 1],
    [0.7, 1]
  );

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
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
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
            backgroundColor: '#ef4444',
            boxShadow: '0 0 8px #ef4444',
          }}
        />
        THE $100B E-COMMERCE PAYMENT CRISIS
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
        Money Left The Bank Account.{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          No Order Was Created.
        </span>
      </h1>

      <p
        style={{
          fontSize: 20,
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: 820,
          marginTop: 14,
          lineHeight: 1.5,
          opacity: titleSpring,
        }}
      >
        Webhook timeouts, 504 gateway drops, and stock race conditions cost global merchants
        billions in churned customers and painful chargebacks.
      </p>

      {/* Interactive Dilemma Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 28,
          width: '100%',
          maxWidth: 1300,
          marginTop: 48,
        }}
      >
        {/* Card 1: Bank Reality */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1.5px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 24,
            padding: 28,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            transform: `translateY(${40 * (1 - card1Spring)}px)`,
            opacity: card1Spring,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#60a5fa', fontWeight: 800 }}>
              BANKING GATEWAY
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              SUCCESS (200 OK)
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
            ₹2,499.00 Debited
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4, margin: 0, fontFamily: 'monospace' }}>
            TXN_4829103_INR verified on UPI rails. Funds transferred from customer account.
          </p>
        </div>

        {/* Card 2: Merchant Reality (Failure) */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid rgba(239, 68, 68, 0.5)',
            borderRadius: 24,
            padding: 28,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.1)',
            transform: `translateY(${40 * (1 - card2Spring)}px)`,
            opacity: card2Spring * glitchOpacity,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#f87171', fontWeight: 800 }}>
              STORE CHECKOUT / OMS
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              504 TIMEOUT
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171', marginBottom: 8 }}>
            Order Missing
          </div>
          <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.4, margin: 0, fontFamily: 'monospace' }}>
            Confirmation webhook never arrived. Cart orphaned. Customer left in distress.
          </p>
        </div>

        {/* Card 3: The Traditional Human Support Cost */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 24,
            padding: 28,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            transform: `translateY(${40 * (1 - statCardSpring)}px)`,
            opacity: statCardSpring,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#fbbf24', fontWeight: 800 }}>
              LEGACY SUPPORT
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fde047',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              48H LATENCY
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fde047', marginBottom: 8 }}>
            $8.50 / Ticket Cost
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4, margin: 0, fontFamily: 'monospace' }}>
            Human agents manually cross-checking 4 dashboards, risking double refunds & stock errors.
          </p>
        </div>
      </div>
    </div>
  );
};
