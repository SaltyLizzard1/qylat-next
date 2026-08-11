export default function DiscoverYourIdea() {
  const goldGradient =
    'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

  const chips = [
    '5-minute assessment',
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
          className="inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] pl-4 pr-[calc(1rem-0.2em)] py-1.5 rounded-full mb-6"
          style={{
            background: '#3A281A',
            color: '#FBF6E3',
            border: '1px solid rgba(58,40,26,0.9)',
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
            color: '#2D1A00',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          What Are You Built to Do?
        </h2>

        {/* Body copy */}
        <div className="text-gray-600 text-lg leading-relaxed mb-4 max-w-xl mx-auto space-y-3">
          <p>Maybe you&apos;ve outgrown your career. Maybe you&apos;re dreaming about something different. Maybe you just know there&apos;s more.</p>
          <p>Let&apos;s figure out what that &ldquo;more&rdquo; looks like.</p>
          <p>Answer five simple questions and discover the paths that best match your skills, values, and goals.</p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {chips.map((chip) => (
            <span
              key={chip}
              className="font-sans text-sm px-3 py-1 rounded-full"
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

        {/* CTA */}
        <a
          href="/assessment"
          className="inline-block font-sans rounded-full px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          style={{
            background: goldGradient,
            color: '#2D1A00',
            border: '1.5px solid #7A5C0A',
            boxShadow: '0 8px 32px rgba(139,105,20,0.35)',
          }}
        >
          Start My Assessment →
        </a>

        {/* Reassurance */}
        <p className="mt-4 text-sm text-gray-500">
          Free to start. Instant result for your top match. No email required
          to see where you rank.
        </p>
      </div>
    </section>
  );
}
