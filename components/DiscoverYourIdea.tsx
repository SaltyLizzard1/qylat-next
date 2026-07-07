export default function DiscoverYourIdea() {
  const goldGradient =
    'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

  const chips = [
    '5 quick questions',
    '7 personalised matches',
    'Location-independent paths',
    'No experience required',
  ];

  return (
    <section
      id="discover-your-idea"
      className="relative overflow-hidden py-20 px-6"
      style={{ background: '#EBF0E6' }}
    >
      {/* Decorative background circles */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
        style={{ background: goldGradient }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10"
        style={{ background: goldGradient }}
      />

      <div className="relative max-w-2xl mx-auto text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* Eyebrow badge */}
        <span
          className="inline-block font-sans text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6"
          style={{
            background: 'rgba(200,160,48,0.15)',
            color: '#8B6914',
            border: '1px solid rgba(200,160,48,0.35)',
          }}
        >
          Free Skills Assessment
        </span>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#2D5016',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          What Are You Actually<br className="hidden sm:block" /> Built to Do?
        </h2>

        {/* Body copy */}
        <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-xl mx-auto">
          It has never been easier to build a business around your exact skills and lifestyle.
          Answer 5 questions and walk away with 7 real, matched paths — tailored to your
          strengths, values, and income goal.
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {chips.map((chip) => (
            <span
              key={chip}
              className="font-sans text-sm px-3 py-1 rounded-full"
              style={{
                background: 'rgba(45,80,22,0.08)',
                color: '#2D5016',
                border: '1px solid rgba(45,80,22,0.15)',
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/quiz"
          className="inline-block font-sans rounded-full px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          style={{
            background: goldGradient,
            color: '#2D1A00',
            border: '1.5px solid #7A5C0A',
            boxShadow: '0 8px 32px rgba(139,105,20,0.35)',
          }}
        >
          Find My Matches →
        </a>

        {/* Reassurance */}
        <p className="mt-4 text-sm text-gray-500">
          Free. Takes 2 minutes. No email required to start.
        </p>
      </div>
    </section>
  );
}
