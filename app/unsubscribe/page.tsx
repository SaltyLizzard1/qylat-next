import { pageMetadata } from '../../lib/siteMetadata';
import UnsubscribeConfirm from '../../components/UnsubscribeConfirm';

export const metadata = pageMetadata({
  title: 'Unsubscribe | QYLAT',
  description: 'Stop receiving the Leap Log from Quit Your Life and Travel.',
  path: '/unsubscribe',
  robots: { index: false, follow: true },
});

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-16" style={{ background: '#EBF0E6' }}>
      <div className="max-w-md w-full text-center">
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
            color: '#2D1A00',
            marginBottom: '0.75rem',
          }}
        >
          Unsubscribe
        </h1>
        <UnsubscribeConfirm token={typeof token === 'string' ? token : ''} />
      </div>
    </main>
  );
}
