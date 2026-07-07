'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

export default function ThenNowSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPercent((x / rect.width) * 100);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPercent((p) => Math.max(p - 5, 0));
    if (e.key === 'ArrowRight') setPercent((p) => Math.min(p + 5, 100));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        ref={containerRef}
        className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden select-none cursor-ew-resize touch-none shadow-lg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label="Drag to compare then and now"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {/* NOW — base layer (beach) */}
        <Image
          src="/My Story/workingfromhoe.jpg"
          alt="Working from the beach now"
          fill
          className="object-cover"
          draggable={false}
        />

        {/* THEN — clipped top layer (old desk) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          <Image
            src="/My Story/deskwithmonitor.png"
            alt="The old office desk"
            fill
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* Labels */}
        <span className="absolute top-4 left-4 uppercase text-xs sm:text-sm tracking-widest font-bold bg-slate-900/70 text-white px-3 py-1 rounded-full pointer-events-none">
          Then
        </span>
        <span
          className="absolute top-4 right-4 uppercase text-xs sm:text-sm tracking-widest font-bold px-3 py-1 rounded-full pointer-events-none"
          style={{ background: 'rgba(201, 160, 48, 0.9)', color: '#2D1A00' }}
        >
          Now
        </span>

        {/* Divider line + handle */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${percent}%`, transform: 'translateX(-50%)' }}
        >
          <div className="h-full w-[3px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D1A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 3 12 9 6" />
              <polyline points="15 6 21 12 15 18" />
            </svg>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-slate-500">Drag to see the difference.</p>
    </div>
  );
}
