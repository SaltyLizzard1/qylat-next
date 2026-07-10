import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

export default function ResultNotFound() {
  return (
    <>
      <Header />
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          minHeight: 'calc(100vh - 7rem)',
          background: 'linear-gradient(180deg, #0d0d0f 0%, #17140c 100%)',
          padding: '4rem 1.5rem',
        }}
      >
        {/* Radial gold glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '640px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(232,200,74,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="relative text-center max-w-sm">
          <p
            className="mb-6 font-bold uppercase"
            style={{ color: '#C9A030', fontSize: '0.78rem', letterSpacing: '0.15em' }}
          >
            5-MINUTE ASSESSMENT
          </p>
          <h1
            className="mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#FBF6E3',
            }}
          >
            Link not found
          </h1>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: '#cfc9b8' }}>
            This result link doesn&apos;t exist or has expired.
          </p>
          <a
            href="/assessment"
            className="inline-block px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
            style={{
              background: GOLD_GRADIENT,
              color: '#2D1A00',
              border: '1.5px solid #7A5C0A',
            }}
          >
            Start My Assessment →
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
