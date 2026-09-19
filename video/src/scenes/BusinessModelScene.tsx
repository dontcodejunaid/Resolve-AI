import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const BusinessModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const col1Spring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 13, stiffness: 95 },
  });

  const col2Spring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 13, stiffness: 95 },
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
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          color: '#facc15',
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
            backgroundColor: '#eab308',
            boxShadow: '0 0 10px #eab308',
          }}
        />
        BUSINESS MODEL & UNIT ECONOMICS
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
        18x Cost Reduction.{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #facc15 0%, #84cc16 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          10x ROI For Merchants.
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
        Transforming customer support from a high-cost overhead into an autonomous revenue retention moat.
      </p>

      {/* 2-Column Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 28,
          width: '100%',
          maxWidth: 1300,
          marginTop: 40,
        }}
      >
        {/* Left: Unit Economics Breakdown */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 24,
            padding: 30,
            backdropFilter: 'blur(16px)',
            transform: `translateY(${35 * (1 - col1Spring)}px)`,
            opacity: col1Spring,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#94a3b8', fontWeight: 800, marginBottom: 16 }}>
              UNIT ECONOMICS PER CASE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Legacy Human Support</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>48h SLA · Manual Dashboards</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f87171', fontFamily: 'monospace' }}>$8.50</div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(132, 204, 22, 0.12)',
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: '1.5px solid rgba(132, 204, 22, 0.5)',
                  boxShadow: '0 0 20px rgba(132, 204, 22, 0.15)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#a3e635' }}>RESOLVE AI Teammate</div>
                  <div style={{ fontSize: 11, color: '#e2e8f0', fontFamily: 'monospace' }}>Sub-3s SLA · 100% Deterministic</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#a3e635', fontFamily: 'monospace' }}>$0.45</div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#84cc16',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✓ 94.7% SAVINGS PER RESOLVED INCIDENT</span>
          </div>
        </div>

        {/* Right: SaaS Revenue Model & Metrics */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1.5px solid rgba(132, 204, 22, 0.35)',
            borderRadius: 24,
            padding: 30,
            backdropFilter: 'blur(16px)',
            transform: `translateY(${35 * (1 - col2Spring)}px)`,
            opacity: col2Spring,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#a3e635', fontWeight: 800, marginBottom: 14 }}>
              SAAS REVENUE STREAMS & PROVEN TRACTION
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>85%+</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Autonomous Resolution Rate</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace' }}>99.4%</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Customer Satisfaction (CSAT)</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Usage-Based</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>$0.25 - $0.75 / Case</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Enterprise OMS</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: 'monospace' }}>Shopify · Stripe · n8n</div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#38bdf8',
              fontWeight: 800,
            }}
          >
            LIVE MERCHANTS: AURA STUDIO · RAZORPAY & STRIPE INTEGRATION READY
          </div>
        </div>
      </div>
    </div>
  );
};
