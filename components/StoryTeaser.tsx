import Image from 'next/image';
import Link from 'next/link';

const headingFont = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

export default function StoryTeaser() {
  return (
    <section className="py-16" style={{ background: '#FBF6E3' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden">
            <Image
              src="/My Story/traffic.png"
              alt="Bumper to bumper morning commute"
              width={1200}
              height={700}
              className="object-cover w-full"
            />
            <video
              className="teaser-rain absolute inset-0 w-full h-full object-cover pointer-events-none"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            >
              <source src="/rain-overlay.mp4" type="video/mp4" />
            </video>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] font-semibold" style={{ color: '#8B6914' }}>My Story</p>
            <h2 style={headingFont} className="mt-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Somewhere on a two-hour Monday commute, I decided the next year would not look like this.
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: '#3A281A' }}>
              Two decades in corporate IT. A one-way ticket to Thailand. A pandemic that took the house, the plan, and six years.
            </p>
            <p className="mt-2 text-lg font-medium" style={{ color: '#2D1A00' }}>I left anyway.</p>
            <Link
              href="/story"
              className="mt-6 inline-block font-semibold text-lg underline underline-offset-4 transition hover:opacity-70"
              style={{ color: '#8B6914' }}
            >
              Read the whole story &rarr;
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .teaser-rain {
          mix-blend-mode: screen;
          opacity: 0.65;
        }
        @media (prefers-reduced-motion: reduce) {
          .teaser-rain {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
