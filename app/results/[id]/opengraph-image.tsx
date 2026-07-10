import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'My Business Matches — Quit Your Life and Travel';

interface Match {
  title?: string;
  incomeRange?: string;
}

type Props = { params: Promise<{ id: string }> };

const GOLD =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

export default async function Image({ params }: Props) {
  const { id } = await params;

  let matches: Match[] = [];

  try {
    const { supabase } = await import('../../../lib/supabase');
    const { data } = await supabase
      .from('quiz_results')
      .select('matches')
      .eq('id', id)
      .single();

    if (data?.matches) {
      matches = data.matches as Match[];
    }
  } catch {
    // fall through to generic branding
  }

  const topTitle    = matches[0]?.title      ?? 'Discover Your Business Match';
  const incomeRange = matches[0]?.incomeRange ?? '';
  const match2      = matches[1]?.title;
  const match3      = matches[2]?.title;
  // If we show match2 + match3 → remaining is length-3; if we drop match3 → length-2.
  // Always show match2, always show match3 when present; "+N more" reflects the remainder.
  const moreCount   = Math.max(0, matches.length - 3);

  const titleFontSize =
    topTitle.length > 50 ? '46px' : topTitle.length > 35 ? '56px' : '64px';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0d0d0f 0%, #17140c 100%)',
          // 60px safe margin on every side
          padding: '60px 72px',
          position: 'relative',
        }}
      >
        {/* ── 1. BRAND HEADER ROW ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '30px',
          }}
        >
          {/* Left: brand name */}
          <div
            style={{
              color: '#FBF6E3',
              fontSize: '26px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              display: 'flex',
            }}
          >
            QUIT YOUR LIFE AND TRAVEL
          </div>

          {/* Right: product name */}
          <div
            style={{
              color: '#C9A030',
              fontSize: '18px',
              letterSpacing: '0.1em',
              display: 'flex',
              paddingTop: '4px',
            }}
          >
            THE DISCOVER YOUR IDEA ASSESSMENT
          </div>
        </div>

        {/* ── 2. FRAMING LINE ── */}
        <div
          style={{
            color: '#cfc9b8',
            fontSize: '26px',
            display: 'flex',
            marginBottom: '8px',
          }}
        >
          My #1 match:
        </div>

        {/* ── 3. TOP MATCH TITLE ── */}
        <div
          style={{
            color: '#FBF6E3',
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.1,
            display: 'flex',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          {topTitle}
        </div>

        {/* ── 4. INCOME RANGE ── */}
        {incomeRange && (
          <div
            style={{
              color: '#cfc9b8',
              fontSize: '22px',
              display: 'flex',
              marginBottom: '18px',
            }}
          >
            Income range: {incomeRange}
          </div>
        )}

        {/* ── 5. ALSO MATCHED + MORE COUNT ── */}
        {(match2 || moreCount > 0) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {match2 && (
              <div
                style={{
                  color: '#a89f8a',
                  fontSize: '20px',
                  display: 'flex',
                  width: '1056px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                Also matched: {match2}
              </div>
            )}
            {/* match3: shown when present — drop here first if space ever gets tight */}
            {match3 && (
              <div
                style={{
                  color: '#a89f8a',
                  fontSize: '20px',
                  display: 'flex',
                  width: '1056px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                Also matched: {match3}
              </div>
            )}
            {moreCount > 0 && (
              <div
                style={{
                  color: '#E8C84A',
                  fontSize: '21px',
                  fontWeight: 700,
                  display: 'flex',
                  marginTop: '4px',
                }}
              >
                + {moreCount} more paths matched to my skills and values
              </div>
            )}
          </div>
        )}

        {/* Spacer — pushes CTA to bottom */}
        <div style={{ flex: 1 }} />

        {/* ── 6. CTA FOOTER ROW ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Gold-gradient pill — visual CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: GOLD,
              color: '#2D1A00',
              fontSize: '22px',
              fontWeight: 600,
              padding: '14px 38px',
              borderRadius: '100px',
            }}
          >
            Take the free 5-minute assessment
          </div>

          {/* Site URL */}
          <div
            style={{
              color: '#a89f8a',
              fontSize: '20px',
              display: 'flex',
            }}
          >
            quityourlifeandtravel.com
          </div>
        </div>

        {/* ── GOLD BAR at very bottom ── */}
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
    { ...size }
  );
}
