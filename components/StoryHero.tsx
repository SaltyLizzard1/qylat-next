'use client';

import Image from 'next/image';

const headingFont = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function StoryHero() {
  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <Image
        src="/My Story/traffic.png"
        alt="Bumper to bumper morning commute"
        fill
        priority
        className="object-cover"
      />

      {/* Dark storm overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(36,40,38,0.55)' }} />

      {/* Real rain video overlay. Its black background disappears via screen blend on desktop; hidden on mobile where blend modes fail. */}
      <video
        className="storm-rain-video absolute inset-0 w-full h-full object-cover pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src="/rain-overlay.mp4" type="video/mp4" />
      </video>

      {/* Lightning flash */}
      <div className="storm-lightning absolute inset-0 bg-white pointer-events-none" />

      {/* Headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-sm uppercase tracking-[0.28em] font-semibold" style={{ color: '#E8C84A' }}>My Story</p>
        <h1
          style={headingFont}
          className="mt-4 max-w-4xl text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white"
        >
          Somewhere on a two-hour Monday commute, I decided the next year would not look like this.
        </h1>
      </div>

      <style>{`
        .storm-rain-video {
          mix-blend-mode: screen;
          opacity: 0.7;
        }
        .storm-lightning {
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .storm-rain-video {
            display: none;
          }
        }
        @media (max-width: 1023px) {
          .storm-rain-video {
            display: none;
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .storm-lightning {
            animation: lightning-flash 9s ease-in-out infinite;
          }
        }
        @keyframes lightning-flash {
          0%, 88%, 100% {
            opacity: 0;
          }
          89% {
            opacity: 0.45;
          }
          90% {
            opacity: 0.05;
          }
          91.5% {
            opacity: 0.35;
          }
          93% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
