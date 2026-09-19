import React from 'react';
import { Sequence, useCurrentFrame } from 'remotion';
import { Background } from './components/Background';
import { BrandBadge } from './components/BrandBadge';
import { ProgressBar } from './components/ProgressBar';
import { ProblemScene } from './scenes/ProblemScene';
import { SolutionScene } from './scenes/SolutionScene';
import { WorkflowScene } from './scenes/WorkflowScene';
import { BusinessModelScene } from './scenes/BusinessModelScene';
import { OutroScene } from './scenes/OutroScene';

export const ResolveAIPitch: React.FC = () => {
  const frame = useCurrentFrame();

  // Dynamic accent color based on active scene
  let currentAccent = '#ef4444';
  let currentSubtitle = 'The $100B E-Commerce Payment Crisis';

  if (frame >= 1260) {
    currentAccent = '#10b981';
    currentSubtitle = 'The Autonomous E-Commerce Future';
  } else if (frame >= 1020) {
    currentAccent = '#eab308';
    currentSubtitle = 'Unit Economics & 18x Cost Reduction';
  } else if (frame >= 720) {
    currentAccent = '#3b82f6';
    currentSubtitle = '4-Way Cross-System Orchestration & Guardrails';
  } else if (frame >= 360) {
    currentAccent = '#84cc16';
    currentSubtitle = 'Autonomous AI Teammate · AI Proposes. Code Decides.';
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#090d0b',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Dynamic Ambient Background */}
      <Background accentColor={currentAccent} />

      {/* Global Brand Header & Status Pill */}
      <BrandBadge subtitle={currentSubtitle} />

      {/* Scene 1: The Problem (0s - 12s / 0 - 360 frames) */}
      <Sequence from={0} durationInFrames={360} name="Problem Statement">
        <ProblemScene />
      </Sequence>

      {/* Scene 2: The Solution (12s - 24s / 360 - 720 frames) */}
      <Sequence from={360} durationInFrames={360} name="Resolve AI Teammate">
        <SolutionScene />
      </Sequence>

      {/* Scene 3: How It Works & Guardrails (24s - 34s / 720 - 1020 frames) */}
      <Sequence from={720} durationInFrames={300} name="Cross-System Pathways">
        <WorkflowScene />
      </Sequence>

      {/* Scene 4: Business Model & Unit Economics (34s - 42s / 1020 - 1260 frames) */}
      <Sequence from={1020} durationInFrames={240} name="Business Model & ROI">
        <BusinessModelScene />
      </Sequence>

      {/* Scene 5: Outro & Call to Action (42s - 45s / 1260 - 1350 frames) */}
      <Sequence from={1260} durationInFrames={90} name="Call to Action">
        <OutroScene />
      </Sequence>

      {/* Global Interactive Bottom Timeline & Progress Indicator */}
      <ProgressBar />
    </div>
  );
};
