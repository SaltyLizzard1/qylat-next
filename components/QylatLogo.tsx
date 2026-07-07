'use client';

import Image from 'next/image';

/*
  Animated QYLAT logo.
  Assets (all in /public):
    /qylat-logo-base.png — wordmark, fully cleaned (no baked line, plane, or debris)
    /qylat-line.png      — gold underline, extended to reach the T (751px @ 1:1 scale)
    /qylat-plane.png     — the plane sprite (unchanged)
  On load, the plane flies from the Q's swoosh to just beyond the T's stand,
  drawing the gold line behind it. Runs once. Reduced motion shows it static.
*/

export default function QylatLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`qylat-logo relative inline-block ${className}`} style={{ aspectRatio: '1250 / 449' }}>
      {/* Base wordmark */}
      <Image
        src="/qylat-logo-base.png"
        alt="QYLAT"
        fill
        priority
        sizes="301px"
        className="object-contain"
      />

      {/* Gold line, revealed left to right, swoosh to the T */}
      <img
        src="/qylat-line.png"
        alt=""
        aria-hidden="true"
        className="qylat-line absolute"
        style={{
          left: '32.72%',
          top: '87.1%',
          width: '60.08%',
          height: 'auto',
        }}
      />

      {/* Plane, flying the same path, resting just beyond the T's stand */}
      <img
        src="/qylat-plane.png"
        alt=""
        aria-hidden="true"
        className="qylat-plane absolute"
        style={{
          left: '92.08%',
          top: '82.18%',
          width: '7.92%',
          height: 'auto',
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .qylat-line {
            clip-path: inset(0 100% 0 0);
            animation: qylat-draw-line 1.3s cubic-bezier(0.45, 0, 0.25, 1) 1.2s forwards;
          }
          .qylat-plane {
            transform: translateX(-749%);
            animation: qylat-fly 1.3s cubic-bezier(0.45, 0, 0.25, 1) 1.2s forwards;
          }
        }
        @keyframes qylat-draw-line {
          to {
            clip-path: inset(0 0% 0 0);
          }
        }
        @keyframes qylat-fly {
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </span>
  );
}