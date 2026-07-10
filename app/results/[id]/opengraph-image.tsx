import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'My Business Matches';

interface Match {
  title?: string;
  incomeRange?: string;
}

type Props = { params: Promise<{ id: string }> };

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

  const topTitle = matches[0]?.title ?? 'Discover Your Business Match';
  const incomeRange = matches[0]?.incomeRange ?? '';
  const match2 = matches[1]?.title;
  const match3 = matches[2]?.title;
  const moreCount = Math.max(0, matches.length - 3);
  const titleFontSize = topTitle.length > 50 ? '48px' : topTitle.length > 35 ? '58px' : '68px';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0d0d0f 0%, #17140c 100%)',
          padding: '52px 72px 60px',
          position: 'relative',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            color: '#C9A030',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'flex',
            marginBottom: '44px',
          }}
        >
          MY BUSINESS MATCHES · 5-MINUTE ASSESSMENT
        </div>

        {/* Framing line */}
        <div
          style={{
            color: '#cfc9b8',
            fontSize: '28px',
            display: 'flex',
            marginBottom: '8px',
          }}
        >
          My #1 match:
        </div>

        {/* Top match title */}
        <div
          style={{
            color: '#FBF6E3',
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.1,
            display: 'flex',
            flexWrap: 'wrap',
            maxWidth: '1056px',
            marginBottom: '16px',
          }}
        >
          {topTitle}
        </div>

        {/* Income range */}
        {incomeRange && (
          <div
            style={{
              color: '#cfc9b8',
              fontSize: '24px',
              display: 'flex',
              marginBottom: '28px',
            }}
          >
            Income range: {incomeRange}
          </div>
        )}

        {/* Also matched + more count */}
        {(match2 || match3 || moreCount > 0) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: incomeRange ? '0' : '24px',
            }}
          >
            {match2 && (
              <div
                style={{
                  color: '#a89f8a',
                  fontSize: '22px',
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
            {match3 && (
              <div
                style={{
                  color: '#a89f8a',
                  fontSize: '22px',
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
                  fontSize: '24px',
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

        {/* Bottom-left site URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '72px',
            color: '#a89f8a',
            fontSize: '13px',
            display: 'flex',
          }}
        >
          quityourlifeandtravel.com
        </div>

        {/* Gold bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, transparent 0%, #C9A030 25%, #F5E070 50%, #C9A030 75%, transparent 100%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
