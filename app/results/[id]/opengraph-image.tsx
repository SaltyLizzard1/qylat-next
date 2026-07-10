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

  let topTitle = 'Discover Your Business Match';
  let incomeRange = '';

  try {
    const { supabase } = await import('../../../lib/supabase');
    const { data } = await supabase
      .from('quiz_results')
      .select('matches')
      .eq('id', id)
      .single();

    if (data?.matches) {
      const matches = data.matches as Match[];
      if (matches[0]?.title) topTitle = matches[0].title;
      if (matches[0]?.incomeRange) incomeRange = matches[0].incomeRange;
    }
  } catch {
    // fall through to generic branding
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0d0d0f 0%, #17140c 100%)',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Top label */}
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: '60px',
            color: '#C9A030',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'flex',
          }}
        >
          DISCOVER YOUR IDEA
        </div>

        {/* Site name top right */}
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '60px',
            color: '#a89f8a',
            fontSize: '13px',
            display: 'flex',
          }}
        >
          quityourlifeandtravel.com
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
            maxWidth: '1000px',
          }}
        >
          <div
            style={{
              color: '#FBF6E3',
              fontSize: topTitle.length > 40 ? '52px' : '64px',
              fontWeight: 700,
              lineHeight: 1.1,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {topTitle}
          </div>
          {incomeRange && (
            <div
              style={{
                color: '#cfc9b8',
                fontSize: '26px',
                display: 'flex',
              }}
            >
              Income range: {incomeRange}
            </div>
          )}
        </div>

        {/* Bottom gold bar */}
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
