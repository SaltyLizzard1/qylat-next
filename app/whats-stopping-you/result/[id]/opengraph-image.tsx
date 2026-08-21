import { ImageResponse } from 'next/og';
import {
  ARCHETYPE_COPY,
  DIMENSION_DISPLAY_ORDER,
  DIMENSION_LABEL,
  MAX_DIMENSION_SCORE,
  type Archetype,
  type Scores,
} from '../../../../lib/leapTest';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = "What's stopping me, Quit Your Life and Travel";

type Props = { params: Promise<{ id: string }> };

const GOLD =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';
// Root background for the OG image. Matches the DARK_GRADIENT on the
// live result page so the shared image and the visited page read as one.
// Per the site-wide rule, results surfaces are near black and gold.
const DARK_GRADIENT = 'linear-gradient(180deg, #0d0d0f 0%, #17140c 50%, #0d0d0f 100%)';
// Non-bottleneck bar fill, from the DATA slot of the palette.
const DATA = '#8C906B';
// Bar track uses a neutral espresso tint rather than DARK at low alpha.
// The DARK-tinted track was olive-on-olive with the DATA fill and the
// two blurred together; a warm espresso tint gives the fill somewhere
// to sit against. Slightly stronger than the live page (0.14) because
// the OG image is viewed small and needs the extra contrast.
const BAR_TRACK = 'rgba(58,40,26,0.18)';
// Gold text label for near-black surfaces. Standard label gold.
const LABEL_GOLD = '#C9A030';

// next/og does not inherit web fonts. Fetch Cormorant Garamond 700 from
// Google Fonts at request time. On any failure return null and the caller
// falls back to a generic serif rather than failing the image render.
async function loadCormorantGaramond700(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        },
      }
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();

    // Google Fonts returns multiple @font-face blocks, one per unicode range
    // (latin, latin-ext, and so on). The last URL in the CSS is the latin
    // basic block for CSS2 output, which is what the archetype names need.
    const urls = Array.from(css.matchAll(/url\((https:\/\/[^)]+)\)/g)).map((m) => m[1]);
    if (urls.length === 0) return null;

    const fontRes = await fetch(urls[urls.length - 1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({ params }: Props) {
  const { id } = await params;

  let scores: Scores | null = null;
  let archetype: Archetype | null = null;

  try {
    const { supabase } = await import('../../../../lib/supabase');
    const { data } = await supabase
      .from('leap_test_results')
      .select('scores, archetype')
      .eq('id', id)
      .single();

    if (data) {
      const dbArchetype = data.archetype as Archetype;
      if (dbArchetype in ARCHETYPE_COPY) {
        archetype = dbArchetype;
        scores = data.scores as Scores;
      }
    }
  } catch {
    // fall through to generic branding
  }

  const copy = archetype ? ARCHETYPE_COPY[archetype] : null;
  const displayName = copy?.name ?? "What's Stopping You";
  const bottleneckLine =
    copy?.bottleneckLine ?? 'Find the one thing standing between you and the leap.';
  const bottleneckDim = copy?.bottleneckDimension ?? null;

  const nameFontSize =
    displayName.length > 20 ? '68px' : displayName.length > 14 ? '84px' : '96px';

  const fontData = await loadCormorantGaramond700();
  const headingFontFamily = fontData ? 'Cormorant Garamond' : 'serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: DARK_GRADIENT,
          padding: '60px 72px',
          position: 'relative',
        }}
      >
        {/* Brand header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              color: '#FBF6E3',
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              display: 'flex',
            }}
          >
            QUIT YOUR LIFE AND TRAVEL
          </div>
          <div
            style={{
              color: LABEL_GOLD,
              fontSize: '18px',
              letterSpacing: '0.14em',
              display: 'flex',
              paddingTop: '4px',
            }}
          >
            WHAT'S STOPPING YOU
          </div>
        </div>

        {/* Framing line */}
        <div
          style={{
            color: '#cfc9b8',
            fontSize: '24px',
            display: 'flex',
            marginBottom: '6px',
          }}
        >
          My archetype:
        </div>

        {/* Archetype name */}
        <div
          style={{
            color: '#FBF6E3',
            fontSize: nameFontSize,
            fontWeight: 700,
            fontFamily: headingFontFamily,
            lineHeight: 1.05,
            display: 'flex',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          {displayName}
        </div>

        {/* Dimension bars (only when we loaded real scores) */}
        {scores && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DIMENSION_DISPLAY_ORDER.map((dim) => {
              const score = scores![dim];
              const pct = Math.max(0, Math.min(1, score / MAX_DIMENSION_SCORE));
              // Floor the rendered width so a 0 score still shows a sliver
              // of the gold highlight when it's the bottleneck. Satori's
              // minWidth support is unreliable, so compute it in JS.
              const widthPct = Math.max(pct * 100, 3);
              const isBottleneck = bottleneckDim === dim;
              return (
                <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      color: '#cfc9b8',
                      fontSize: '20px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      width: '156px',
                      display: 'flex',
                      textTransform: 'uppercase',
                    }}
                  >
                    {DIMENSION_LABEL[dim]}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: '18px',
                      borderRadius: '9px',
                      background: BAR_TRACK,
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPct}%`,
                        height: '100%',
                        borderRadius: '9px',
                        background: isBottleneck ? GOLD : DATA,
                        display: 'flex',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      color: '#FBF6E3',
                      fontSize: '20px',
                      fontWeight: 700,
                      width: '68px',
                      textAlign: 'right',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {score} / {MAX_DIMENSION_SCORE}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottleneck line */}
        <div
          style={{
            color: LABEL_GOLD,
            fontSize: '22px',
            fontWeight: 600,
            display: 'flex',
            marginTop: scores ? '20px' : '10px',
            lineHeight: 1.3,
          }}
        >
          {bottleneckLine}
        </div>

        {/* Spacer to push footer to the bottom */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* Footer CTA row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: GOLD,
              color: '#2D1A00',
              fontSize: '22px',
              fontWeight: 600,
              padding: '14px 36px',
              borderRadius: '100px',
            }}
          >
            Find out what&apos;s stopping you
          </div>
          <div
            style={{
              color: '#a89f8a',
              fontSize: '20px',
              display: 'flex',
            }}
          >
            quityourlifeandtravel.com/whats-stopping-you
          </div>
        </div>

        {/* Gold bar at the very bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background:
              'linear-gradient(90deg, transparent 0%, #C9A030 25%, #F5E070 50%, #C9A030 75%, transparent 100%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: 'Cormorant Garamond',
                data: fontData,
                weight: 700,
                style: 'normal',
              },
            ],
          }
        : {}),
    }
  );
}
