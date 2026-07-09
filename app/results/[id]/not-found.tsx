import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function ResultNotFound() {
  return (
    <>
      <Header />
      <div className="relative overflow-hidden min-h-[calc(100vh-7rem)] flex items-center justify-center px-4" style={{ background: '#EBF0E6' }}>
        <div className="text-center max-w-sm">
          <h1
            className="mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#2D5016',
            }}
          >
            Link not found
          </h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            This result link doesn&apos;t exist or has expired.
          </p>
          <a
            href="/quiz"
            className="inline-block px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
            style={{
              background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
              color: '#2D1A00',
              border: '1.5px solid #7A5C0A',
            }}
          >
            Take the free quiz
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
