'use client';

import { useEffect, useRef, useState } from 'react';

export default function AnimatedLogo({
  className,
  showTagline = true,
  animate = true,
}: {
  className?: string;
  showTagline?: boolean;
  animate?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!animate) return;

    const el = svgRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  // animate=false → static finished state (no observer, no animation class)
  // animate=true + not in view → start position, no play class
  // animate=true + in view → play class triggers keyframes
  const svgClass = !animate
    ? `${className ?? ''} done`.trimStart()
    : inView
    ? `${className ?? ''} play`.trimStart()
    : className;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showTagline ? "65 75 840 381" : "65 75 840 335"}
      className={svgClass}
      role="img"
      aria-label="IdeaToPlan — Shape your future. Start today."
    >
      <defs>
        <filter id="sparkle-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="outer" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="inner" />
          <feMerge>
            <feMergeNode in="outer" />
            <feMergeNode in="inner" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g id="icon">
        <rect x="80" y="300" width="52" height="100" fill="#6B4C08" rx="4" />
        <rect x="152" y="240" width="52" height="160" fill="#C9A030" rx="4" />
        <rect x="224" y="180" width="52" height="220" fill="#F5D020" rx="4" />

        {/* Outer group = position (the hops). Inner group = scale/shine. */}
        <g className="star-mover" filter="url(#sparkle-glow)">
          <g className="star-shine">
            <polygon points="0,-36 3,-4 0,36 -3,-4" fill="#F5E070" />
            <polygon points="-36,0 -4,3 36,0 -4,-3" fill="#F5E070" />
            <g transform="rotate(45)">
              <polygon points="0,-22 2,-3 0,22 -2,-3" fill="#FFF8B0" />
              <polygon points="-22,0 -3,2 22,0 -3,-2" fill="#FFF8B0" />
            </g>
            <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
          </g>
        </g>
      </g>

      <g id="wordmark">
        <text y="400" fontFamily="Georgia, 'Times New Roman', serif" textAnchor="start">
          <tspan x="315" fontSize="68" fontWeight="700" fill="#8B6914">Idea</tspan>
          <tspan fontSize="96" fontWeight="400" fill="#C9A030" dx="10">To</tspan>
          <tspan fontSize="132" fontWeight="700" fill="#F5D020" dx="6">Plan</tspan>
        </text>
        {showTagline && <line x1="315" y1="416" x2="875" y2="416" stroke="#C9A030" strokeWidth="1.5" />}
      </g>

      {showTagline && (
        <g id="tagline">
          <text
            x="317"
            y="436"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="22"
            fontStyle="italic"
            fill="#8B6914"
            letterSpacing="3"
          >
            Shape your future. Start today.
          </text>
        </g>
      )}

      <style>{`
        /* Star parked at start position (first bar) until animation fires */
        .star-mover {
          transform: translate(106px, 262px);
        }
        .star-shine {
          transform-box: fill-box;
          transform-origin: center;
          transform: scale(0.55);
          opacity: 0.85;
        }

        /* Viewport-triggered animation */
        .play .star-mover {
          animation: star-hop 2.6s forwards;
        }
        @keyframes star-hop {
          0%   { transform: translate(106px, 262px); animation-timing-function: ease-in-out; }
          12%  { transform: translate(106px, 262px); animation-timing-function: ease-out; }
          24%  { transform: translate(142px, 190px); animation-timing-function: ease-in; }
          36%  { transform: translate(178px, 202px); animation-timing-function: ease-out; }
          48%  { transform: translate(214px, 130px); animation-timing-function: ease-in; }
          58%  { transform: translate(250px, 140px); }
          100% { transform: translate(250px, 140px); }
        }

        .play .star-shine {
          animation: star-flare 2.6s forwards;
        }
        @keyframes star-flare {
          0%, 58% { transform: scale(0.55); opacity: 0.85; filter: brightness(1); }
          70%     { transform: scale(1.5) rotate(25deg); opacity: 1; filter: brightness(1.9); }
          82%     { transform: scale(0.92) rotate(0deg); filter: brightness(1.1); }
          100%    { transform: scale(1); opacity: 1; filter: brightness(1); }
        }

        /* Static finished state (animate=false prop) */
        .done .star-mover { transform: translate(250px, 140px); }
        .done .star-shine  { transform: scale(1); opacity: 1; }

        /* Accessibility: skip motion, show finished state */
        @media (prefers-reduced-motion: reduce) {
          .star-mover,      .play .star-mover { animation: none; transform: translate(250px, 140px); }
          .star-shine,      .play .star-shine { animation: none; transform: scale(1); opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
