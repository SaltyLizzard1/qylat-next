import Link from 'next/link';

export default function LeapCalculatorTeaser() {
  const goldGradient =
    'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

  const chips = [
    '2-minute calculator',
    'Pre-filled with real Chiang Mai costs',
    'See your exact runway',
    'Adjust anything',
  ];

  return (
    <section
      id="leap-calculator"
      className="relative overflow-hidden py-20 px-6"
      style={{ background: '#FBF6E3' }}
    >
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
        style={{ background: goldGradient }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10"
        style={{ background: goldGradient }}
      />

      <div className="relative max-w-2xl mx-auto text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <span
          className="inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6"
          style={{
            background: '#3A281A',
            color: '#FBF6E3',
            border: '1px solid rgba(58,40,26,0.9)',
          }}
        >
          Free Runway Calculator
        </span>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#2D1A00',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          How Much Do You Need to Leap?
        </h2>

        <div className="text-gray-600 text-lg leading-relaxed mb-6 max-w-xl mx-auto">
          <p>
            You do not need to know what Thailand costs. I already filled that in from living
            here. See exactly how many months your savings buy you, in about two minutes.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {chips.map((chip) => (
            <span
              key={chip}
              className="text-xs font-sans font-medium px-3 py-1.5 rounded-full"
              style={{
                background: '#FFFFFF',
                color: '#3A281A',
                border: '1px solid rgba(58,40,26,0.3)',
                boxShadow: '0 2px 8px rgba(58,40,26,0.08)',
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          href="/calculator"
          className="inline-block font-sans rounded-full px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          style={{
            background: goldGradient,
            color: '#2D1A00',
            border: '1.5px solid #2D1A00',
            boxShadow: '0 8px 32px rgba(139,105,20,0.35)',
          }}
        >
          Calculate My Runway
        </Link>
      </div>
    </section>
  );
}
