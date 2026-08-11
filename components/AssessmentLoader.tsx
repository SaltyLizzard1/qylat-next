'use client';

import { useEffect, useRef, useState } from 'react';

const GOLD_DEEP = '#8B6914';
const GOLD_MID = '#C9A030';
const GOLD_BRIGHT = '#E8C84A';
const GOLD_LIGHT = '#F5E070';

// Logo silhouette, short to tall, left to right.
const BAR_MAX = [30, 46, 62];
const BAR_MIN = [4, 6, 8];

// Progress never passes this on the timer alone. Only a real
// completion takes it to 100. A bar that fills to 100 while the
// request is still open is a lie, and people notice.
const CAP = 90;

// How far the star overlaps into the top of the tallest bar.
const STAR_OVERLAP = 8;

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
   * Set true when the real response arrives. The bars complete and the
   * star lands. Leave undefined if the parent simply unmounts instead.
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

  // Let the bars finish their transition before the star lands.
  useEffect(() => {
    if (!isComplete) {
      setStarIn(false);
      return;
    }
    const id = setTimeout(() => setStarIn(true), 400);
    return () => clearTimeout(id);
  }, [isComplete]);

  const progress = isComplete ? 100 : pct;
  const fraction = Math.max(0, Math.min(1, progress / 100));

  // All three bars grow together so the ascending logo shape holds
  // at every moment rather than assembling only at the end.
  const barHeight = (i: number) =>
    Math.round(BAR_MIN[i] + (BAR_MAX[i] - BAR_MIN[i]) * fraction);

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
        @keyframes qylBreathe {
          0%, 100% { opacity: 0.78; }
          50% { opacity: 1; }
        }
        @keyframes qylShine {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(245, 224, 112, 0.9)); }
          50% { filter: drop-shadow(0 0 10px rgba(245, 224, 112, 1)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .qyl-bar { animation: none !important; opacity: 1 !important; }
          .qyl-star { animation: none !important; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: '88px',
        }}
      >
        {barColors.map((color, i) => {
          const bar = (
            <div
              key={i}
              className="qyl-bar"
              style={{
                display: 'block',
                width: '15px',
                borderRadius: '2px',
                background: color,
                height: `${barHeight(i)}px`,
                transition: 'height 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isComplete
                  ? 'none'
                  : `qylBreathe 2s ease-in-out ${i * 0.25}s infinite`,
                opacity: isComplete ? 1 : undefined,
              }}
            />
          );

          // The star belongs to the tallest bar, so it is nested with it
          // and tracks the top edge as that bar grows.
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
                  bottom: `${barHeight(2) - STAR_OVERLAP}px`,
                  opacity: starIn ? 1 : 0,
                  transform: starIn
                    ? 'scale(1) rotate(0deg)'
                    : 'scale(0.2) rotate(-50deg)',
                  transformOrigin: 'center',
                  transition:
                    'opacity 0.45s ease-out, transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), bottom 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
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
