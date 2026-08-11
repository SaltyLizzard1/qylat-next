'use client';

import { useEffect, useRef, useState } from 'react';

const GOLD_DEEP = '#8B6914';
const GOLD_MID = '#C9A030';
const GOLD_BRIGHT = '#E8C84A';
const GOLD_LIGHT = '#F5E070';

// Logo silhouette, short to tall, left to right.
const BAR_MAX = [30, 46, 62];

// Progress never passes this on the timer alone. Only a real completion
// takes it to 100. A bar that fills to 100 while the request is still
// open is a lie, and people notice.
const CAP = 90;

// Star clearance above the tallest bar.
const STAR_LIFT = 6;

const STAGES: Array<[string, string]> = [
  ['Reading your answers', 'This takes about 60 to 90 seconds'],
  ['Checking what is trending right now', 'Pulling current market signals'],
  ['Matching against your skills', 'Weighing saturation and fit'],
  ['Writing your first steps', 'Almost there'],
];

const OVERRUN_NOTE = 'Still working. Longer than usual, but nothing is broken';

type Props = {
  /** Typical run time in ms. Stages are paced across this. */
  expectedMs?: number;
  /**
   * Set true when the real response arrives. The bars settle into the
   * logo and the star lands. Give it roughly 900ms before switching
   * away so the moment is visible.
   */
  isComplete?: boolean;
  /** Override the stage copy. */
  stages?: Array<[string, string]>;
  /** Heading colour. Use a light value on dark backgrounds. */
  headingColor?: string;
  /** Subcopy colour. */
  subColor?: string;
  /** Track colour behind the progress bar. */
  trackColor?: string;
};

export default function AssessmentLoader({
  expectedMs = 75000,
  isComplete = false,
  stages = STAGES,
  headingColor = '#2C3340',
  subColor = '#6b7280',
  trackColor = 'rgba(44, 51, 64, 0.12)',
}: Props) {
  const [pct, setPct] = useState(2);
  const [stageIndex, setStageIndex] = useState(0);
  const [overrun, setOverrun] = useState(false);
  const [starIn, setStarIn] = useState(false);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isComplete) return;
    startRef.current = Date.now();
    const step = expectedMs / stages.length;

    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const next = Math.min(CAP, 2 + (elapsed / expectedMs) * (CAP - 2));
      setPct(next);
      setStageIndex(Math.min(stages.length - 1, Math.floor(elapsed / step)));
      if (next >= CAP) setOverrun(true);
    }, 900);

    return () => clearInterval(tick);
  }, [expectedMs, isComplete, stages.length]);

  // Let the bars settle before the star lands.
  useEffect(() => {
    if (!isComplete) {
      setStarIn(false);
      return;
    }
    const id = setTimeout(() => setStarIn(true), 450);
    return () => clearTimeout(id);
  }, [isComplete]);

  const progress = isComplete ? 100 : pct;
  const heading = isComplete ? 'Your results are ready' : stages[stageIndex][0];
  const sub = isComplete ? '' : overrun ? OVERRUN_NOTE : stages[stageIndex][1];
  const barColors = [GOLD_DEEP, GOLD_MID, GOLD_BRIGHT];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={heading}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '26px',
        padding: '3rem 1.5rem',
      }}
    >
      <style>{`
        /* Each bar oscillates within its own band around its logo
           height, so the ascending silhouette holds at every frame. */
        @keyframes qylPulse1 { 0%, 100% { height: 17px; } 50% { height: 30px; } }
        @keyframes qylPulse2 { 0%, 100% { height: 25px; } 50% { height: 46px; } }
        @keyframes qylPulse3 { 0%, 100% { height: 34px; } 50% { height: 62px; } }
        @keyframes qylShine {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(245, 224, 112, 0.9)); }
          50% { filter: drop-shadow(0 0 10px rgba(245, 224, 112, 1)); }
        }
        .qyl-bar-1 { animation: qylPulse1 1.5s ease-in-out infinite; }
        .qyl-bar-2 { animation: qylPulse2 1.5s ease-in-out 0.18s infinite; }
        .qyl-bar-3 { animation: qylPulse3 1.5s ease-in-out 0.36s infinite; }
        .qyl-settled {
          animation: none !important;
          transition: height 0.5s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .qyl-bar-1, .qyl-bar-2, .qyl-bar-3 { animation: none !important; }
          .qyl-star { animation: none !important; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: '100px',
        }}
      >
        {barColors.map((color, i) => {
          const bar = (
            <div
              key={i}
              className={`qyl-bar-${i + 1}${isComplete ? ' qyl-settled' : ''}`}
              style={{
                display: 'block',
                width: '15px',
                borderRadius: '2px',
                background: color,
                ...(isComplete ? { height: `${BAR_MAX[i]}px` } : null),
              }}
            />
          );

          // The star belongs to the tallest bar, so it is nested with it.
          if (i !== barColors.length - 1) return bar;

          return (
            <div key={i} style={{ position: 'relative' }}>
              <div
                className="qyl-star"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '50%',
                  marginLeft: '-13px',
                  bottom: `${BAR_MAX[2] + STAR_LIFT}px`,
                  opacity: starIn ? 1 : 0,
                  transform: starIn
                    ? 'scale(1) rotate(0deg)'
                    : 'scale(0.2) rotate(-50deg)',
                  transformOrigin: 'center',
                  transition:
                    'opacity 0.45s ease-out, transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: starIn ? 'qylShine 2.4s ease-in-out infinite' : 'none',
                  pointerEvents: 'none',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path
                    d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z"
                    fill={GOLD_LIGHT}
                  />
                </svg>
              </div>
              {bar}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', minHeight: '46px' }}>
        <p style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: headingColor }}>
          {heading}
        </p>
        <p style={{ margin: '5px 0 0', fontSize: '13px', color: subColor, minHeight: '18px' }}>
          {sub}
        </p>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          height: '6px',
          background: trackColor,
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: '3px',
            background: `linear-gradient(90deg, ${GOLD_DEEP} 0%, ${GOLD_MID} 45%, ${GOLD_LIGHT} 100%)`,
            transition: isComplete ? 'width 0.45s ease-out' : 'width 0.9s linear',
          }}
        />
      </div>
    </div>
  );
}
