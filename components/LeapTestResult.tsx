'use client';

import ShareButtons from './ShareButtons';
import {
  ARCHETYPE_COPY,
  DIMENSION_DISPLAY_ORDER,
  DIMENSION_LABEL,
  MAX_DIMENSION_SCORE,
  type Archetype,
  type Scores,
} from '../lib/leapTest';

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';
const ESPRESSO = '#3A281A';
const ESPRESSO_DEEP = '#2D1A00';
const CREAM = '#FBF6E3';
const SLATE = '#2C3340';

// Palette surface tokens. Text always comes from outside the palette:
// ESPRESSO on light surfaces, CREAM on dark. DATA survives only as the
// dimension bar fill, not as a surface. Results surfaces are near black
// per the site-wide rule: results surfaces are near black and gold.
const PALE_SAGE = '#EBF0E6'; // lower section surface
const DATA = '#8C906B';      // non-bottleneck bar fills
const DARK_GRADIENT = 'linear-gradient(180deg, #0d0d0f 0%, #17140c 50%, #0d0d0f 100%)';

// Gold text label for near-black surfaces. Standard label gold.
const LABEL_GOLD = '#C9A030';

// The standard QYLAT section separator, matching the Divider component
// in app/page.tsx. Placed between the dark hero band and the cream lower
// section so the transition is a rule rather than a hard cut.
const GOLD_SEPARATOR =
  'linear-gradient(90deg, transparent 0%, #C9A030 25%, #F5E070 50%, #C9A030 75%, transparent 100%)';

// White card border. Structural rather than decorative on the cream lower
// section, since white on cream barely separates by fill alone.
const CARD_BORDER = '1.5px solid rgba(146,116,92,0.55)';

const headingFont: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 700,
};

interface Props {
  scores: Scores;
  archetype: Archetype;
  id?: string;
  shareOrigin?: string;
}

export default function LeapTestResult({ scores, archetype, id, shareOrigin }: Props) {
  const copy = ARCHETYPE_COPY[archetype];

  const shareUrl = id
    ? `${shareOrigin ?? 'https://www.quityourlifeandtravel.com'}/whats-stopping-you/result/${id}`
    : undefined;

  const shareText = `I found out what's stopping me. ${copy.name}. My bottleneck: ${copy.bottleneckShort}. Find yours:`;

  return (
    <>
      {/* Dark hero band: eyebrow, share-target card, then the share block. */}
      <div
        className="relative overflow-hidden"
        style={{
          background: DARK_GRADIENT,
          padding: '3.5rem 1.25rem 4rem',
        }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '640px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(232,200,74,0.16) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-xl mx-auto">
          <p
            className="mb-4 font-bold uppercase text-center"
            style={{ color: LABEL_GOLD, fontSize: '0.75rem', letterSpacing: '0.15em' }}
          >
            WHAT&apos;S STOPPING YOU
          </p>

          {/* The share-target card. Cream, kept for brand warmth in shares. */}
          <div
            className="rounded-2xl"
            style={{
              background: CREAM,
              border: '1.5px solid rgba(245,224,112,0.45)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              padding: '1.75rem 1.5rem 1.5rem',
            }}
          >
            <h1
              className="text-center"
              style={{
                ...headingFont,
                color: ESPRESSO_DEEP,
                fontSize: 'clamp(1.9rem, 6vw, 2.6rem)',
                lineHeight: 1.1,
                marginBottom: '1rem',
              }}
            >
              {copy.heading}
            </h1>

            {/* Constrain the bars to a narrower centered column so the middle
                of the card follows the same optical width as the heading and
                bottleneck line above and below it. */}
            <div style={{ maxWidth: '22rem', margin: '0 auto' }}>
              <DimensionBars scores={scores} archetype={archetype} />
            </div>

            <p
              className="mt-4 text-center"
              style={{
                color: ESPRESSO_DEEP,
                fontSize: '0.98rem',
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {copy.bottleneckLine}
            </p>
          </div>

          {shareUrl && (
            <div className="mt-8">
              <p
                className="mb-3 text-center font-bold uppercase"
                style={{
                  color: LABEL_GOLD,
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                }}
              >
                SHARE YOUR RESULT
              </p>
              <ShareButtons url={shareUrl} title={copy.name} text={shareText} />
            </div>
          )}
        </div>
      </div>

      {/* Standard QYLAT gold separator between sections. */}
      <div
        className="w-full"
        style={{
          height: '3px',
          background: GOLD_SEPARATOR,
        }}
      />

      {/* Lighter section: explanation card, next move card, retake link. */}
      <div className="relative overflow-hidden" style={{ background: PALE_SAGE, paddingBottom: '4rem' }}>
        {/* Decorative background circles */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 md:w-96 md:h-96 rounded-full opacity-20"
          style={{ background: GOLD_GRADIENT }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-10"
          style={{ background: GOLD_GRADIENT }}
        />

        <div className="relative max-w-xl mx-auto px-5" style={{ paddingTop: '2.5rem' }}>
          <p
            className="mb-3 font-bold uppercase text-left"
            style={{
              color: ESPRESSO,
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
            }}
          >
            WHAT THIS MEANS
          </p>

          {/* Body paragraphs wrapped in a white card, matching the visual
              treatment of the next move card below. */}
          <div
            className="rounded-2xl"
            style={{
              background: '#FFFFFF',
              border: CARD_BORDER,
              padding: '1.25rem 1.25rem',
            }}
          >
            {copy.body.map((paragraph, i) => (
              <p
                key={i}
                className="mb-4"
                style={{ color: SLATE, fontSize: '1.02rem', lineHeight: 1.6 }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div
            className="mt-6 rounded-2xl"
            style={{
              background: '#FFFFFF',
              border: CARD_BORDER,
              padding: '1.25rem 1.25rem',
            }}
          >
            <p
              style={{ color: ESPRESSO_DEEP, fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 }}
            >
              {copy.nextMoveLine}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href={copy.primaryCta.href}
                className="inline-block px-6 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
                style={{
                  background: GOLD_GRADIENT,
                  color: ESPRESSO_DEEP,
                  border: '1.5px solid #2D1A00',
                }}
                target={copy.primaryCta.href.startsWith('http') ? '_blank' : undefined}
                rel={copy.primaryCta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {copy.primaryCta.label}
              </a>
              {copy.secondaryCta && (
                <a
                  href={copy.secondaryCta.href}
                  className="inline-flex items-center px-5 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
                  style={{
                    background: PALE_SAGE,
                    color: ESPRESSO_DEEP,
                    border: `1.5px solid ${ESPRESSO}`,
                  }}
                  target={
                    copy.secondaryCta.href.startsWith('http') ? '_blank' : undefined
                  }
                  rel={
                    copy.secondaryCta.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {copy.secondaryCta.label}
                </a>
              )}
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="/whats-stopping-you"
              className="text-sm underline hover:opacity-70"
              style={{ color: ESPRESSO }}
            >
              Take it again
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function DimensionBars({
  scores,
  archetype,
}: {
  scores: Scores;
  archetype: Archetype;
}) {
  const bottleneckDim = ARCHETYPE_COPY[archetype].bottleneckDimension;

  return (
    <div className="flex flex-col gap-2.5">
      {DIMENSION_DISPLAY_ORDER.map((dim) => {
        const score = scores[dim];
        const pct = Math.max(0, Math.min(1, score / MAX_DIMENSION_SCORE));
        // Floor the rendered width so a 0 score still shows a sliver of the
        // gold highlight when it's the bottleneck. Satori's minWidth is
        // unreliable, so compute the width in JS instead.
        const widthPct = Math.max(pct * 100, 3);
        const isBottleneck = bottleneckDim === dim;

        return (
          <div key={dim}>
            <div className="flex items-baseline justify-between mb-1">
              <span
                style={{
                  color: ESPRESSO_DEEP,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {DIMENSION_LABEL[dim]}
              </span>
              <span
                style={{
                  color: ESPRESSO,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {score} / {MAX_DIMENSION_SCORE}
              </span>
            </div>
            <div
              style={{
                height: '10px',
                borderRadius: '5px',
                background: 'rgba(58,40,26,0.14)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${widthPct}%`,
                  borderRadius: '5px',
                  background: isBottleneck ? GOLD_GRADIENT : DATA,
                  transition: 'width 0.6s ease-out',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
