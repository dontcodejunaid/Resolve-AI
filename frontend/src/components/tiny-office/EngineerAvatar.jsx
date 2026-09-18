import React from 'react';
import { motion } from 'framer-motion';

/**
 * EngineerAvatar - Detailed animated SVG tech worker character.
 * Shows software engineer dressed in hoodie/shirt, wearing headphones/glasses,
 * with animated typing hands, head bobbing, and expressions.
 */
export const EngineerAvatar = ({
  worker,
  isTyping = true,
  isCrunch = false,
  size = 110,
}) => {
  const {
    hoodieColor = '#1e3a8a',
    shirtColor = '#38bdf8',
    hairColor = '#1e1e24',
    skinTone = '#fcd34d',
    hasGlasses = true,
    hasHeadphones = true,
    state = 'coding',
  } = worker;

  // Typing animation speed based on state and crunch mode
  const typingDuration = isCrunch ? 0.08 : state === 'debugging' ? 0.12 : 0.18;
  const headBobDuration = isCrunch ? 0.35 : 1.2;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <linearGradient id={`hoodie-grad-${worker.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hoodieColor} />
            <stop offset="100%" stopColor={hoodieColor} stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow-subtle" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Chair Backrest Behind Worker */}
        <path
          d="M26 44 Q50 36 74 44 L72 82 Q50 86 28 82 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <rect x="36" y="24" width="28" height="14" rx="4" fill="#334155" stroke="#1e293b" />
        
        {/* Head Rest Cushion */}
        <rect x="40" y="16" width="20" height="9" rx="3" fill="#475569" />

        {/* Animated Torso & Head Group */}
        <motion.g
          animate={
            isTyping
              ? {
                  y: [0, -1.5, 0],
                  rotate: [0, 0.5, -0.5, 0],
                }
              : { y: [0, -0.5, 0] }
          }
          transition={{
            duration: headBobDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Hoodie / Upper Body */}
          <path
            d="M30 60 C30 52 38 48 50 48 C62 48 70 52 70 60 L72 84 C72 85 28 85 28 84 Z"
            fill={`url(#hoodie-grad-${worker.id})`}
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* Hoodie Collar / Drawstrings */}
          <path
            d="M44 51 Q50 56 56 51"
            fill="none"
            stroke={shirtColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line x1="46" y1="53" x2="45" y2="62" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="54" y1="53" x2="55" y2="62" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />

          {/* Company Tech Badge / Lanyard */}
          <rect x="47" y="62" width="6" height="8" rx="1" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" />
          <rect x="48" y="64" width="4" height="2" fill={worker.color || '#3b82f6'} />

          {/* Neck */}
          <rect x="46" y="44" width="8" height="8" rx="2" fill={skinTone} />

          {/* Head */}
          <ellipse cx="50" cy="36" rx="12" ry="13" fill={skinTone} />

          {/* Hair Styles */}
          <path
            d="M37 34 C37 23 42 21 50 21 C58 21 63 23 63 34 C63 29 59 27 50 27 C41 27 37 29 37 34 Z"
            fill={hairColor}
          />
          {/* Hair tufts */}
          <path
            d="M42 22 Q46 18 52 21 Q57 19 60 23"
            fill="none"
            stroke={hairColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Eyes with blinking / focus */}
          <motion.g
            animate={
              isTyping
                ? {
                    scaleY: [1, 1, 0.1, 1, 1],
                  }
                : {}
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              times: [0, 0.45, 0.5, 0.55, 1],
            }}
          >
            <circle cx="46" cy="35" r="1.5" fill="#0f172a" />
            <circle cx="54" cy="35" r="1.5" fill="#0f172a" />
            {/* Eye glint */}
            <circle cx="45.5" cy="34.5" r="0.4" fill="#ffffff" />
            <circle cx="53.5" cy="34.5" r="0.4" fill="#ffffff" />
          </motion.g>

          {/* Eyebrows */}
          {state === 'debugging' ? (
            <>
              <line x1="43" y1="31" x2="48" y2="33" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
              <line x1="57" y1="31" x2="52" y2="33" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="43" y1="32" x2="48" y2="31.5" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
              <line x1="52" y1="31.5" x2="57" y2="32" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
            </>
          )}

          {/* Smile / Mouth */}
          {state === 'celebrating' ? (
            <path d="M47 39 Q50 43 53 39" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
          ) : state === 'debugging' ? (
            <line x1="48" y1="40" x2="52" y2="40" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
          ) : (
            <path d="M47 39 Q50 41 53 39" fill="none" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
          )}

          {/* Glasses Option */}
          {hasGlasses && (
            <g>
              <rect x="42" y="32" width="7" height="6" rx="1.5" fill="none" stroke="#0f172a" strokeWidth="1.2" />
              <rect x="51" y="32" width="7" height="6" rx="1.5" fill="none" stroke="#0f172a" strokeWidth="1.2" />
              <line x1="49" y1="35" x2="51" y2="35" stroke="#0f172a" strokeWidth="1.2" />
              <line x1="39" y1="34" x2="42" y2="34" stroke="#0f172a" strokeWidth="1" />
              <line x1="58" y1="34" x2="61" y2="34" stroke="#0f172a" strokeWidth="1" />
              {/* Screen Reflection on Glasses */}
              <line x1="43" y1="33" x2="45" y2="37" stroke="#38bdf8" strokeWidth="0.8" opacity="0.7" />
              <line x1="52" y1="33" x2="54" y2="37" stroke="#38bdf8" strokeWidth="0.8" opacity="0.7" />
            </g>
          )}

          {/* Noise-canceling Over-Ear Headphones */}
          {hasHeadphones && (
            <g>
              {/* Headband */}
              <path
                d="M36 34 Q50 17 64 34"
                fill="none"
                stroke="#334155"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Ear Cups */}
              <rect x="34" y="31" width="4" height="9" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="0.5" />
              <rect x="62" y="31" width="4" height="9" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="0.5" />
              {/* Status LED on headphone */}
              <circle cx="64" cy="35" r="0.8" fill={isCrunch ? '#ef4444' : '#10b981'} className="animate-pulse" />
            </g>
          )}
        </motion.g>

        {/* Animated Typing Arms and Hands */}
        {isTyping ? (
          <g>
            {/* Left Arm / Hand */}
            <motion.path
              d="M32 62 Q36 70 42 70"
              fill="none"
              stroke={hoodieColor}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <motion.circle
              cx="43"
              cy="70"
              r="2.6"
              fill={skinTone}
              animate={{
                y: [0, -3, 1, -2, 0],
                x: [0, 1, -1, 0],
              }}
              transition={{
                duration: typingDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Right Arm / Hand */}
            <motion.path
              d="M68 62 Q64 70 58 70"
              fill="none"
              stroke={hoodieColor}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <motion.circle
              cx="57"
              cy="70"
              r="2.6"
              fill={skinTone}
              animate={{
                y: [-2, 1, -3, 0, -2],
                x: [0, -1, 1, 0],
              }}
              transition={{
                duration: typingDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.05,
              }}
            />
          </g>
        ) : (
          <g>
            {/* Resting / Thinking arms */}
            <path
              d="M32 62 Q40 68 46 64"
              fill="none"
              stroke={hoodieColor}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="47" cy="63" r="2.6" fill={skinTone} />
            <path
              d="M68 62 Q60 68 54 64"
              fill="none"
              stroke={hoodieColor}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="53" cy="63" r="2.6" fill={skinTone} />
          </g>
        )}
      </svg>
    </div>
  );
};
