import { images } from '../config/images';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] min-h-screen overflow-hidden"
      style={{ backgroundColor: '#1a3320' }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${images.hero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] min-h-screen w-full max-w-[100vw] flex-col items-center justify-center px-6 pb-12 sm:px-10 sm:pb-14 md:px-14 lg:px-20">
        <div className="w-full max-w-5xl text-center">

          <h1 className="font-cormorant font-bold text-[2rem] leading-[1.08] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] text-white mb-6 sm:mb-8 md:mb-10 drop-shadow-2xl">
            <span className="block mb-2 sm:mb-3">Quit Your Life.</span>
            <span className="block">Design One That Actually Fits.</span>
          </h1>

          <p className="font-cormorant font-normal mx-auto mb-10 max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed text-white/90 drop-shadow-md">
            Stop waiting for the perfect moment and start building the life you actually want.
          </p>

          <div className="flex justify-center">
            <a
              href="/quiz"
              className="font-sans rounded-full px-10 py-4 text-lg font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98] sm:min-w-[14rem]"
              style={{
                background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
                color: '#2D1A00',
                border: '1.5px solid #7A5C0A',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              Design Your Leap
            </a>
          </div>

        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 sm:bottom-7">
        <div className="animate-bounce">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/70 p-2 shadow-lg">
            <div className="h-3 w-1 rounded-full bg-white/90" />
          </div>
        </div>
      </div>
    </section>
  );
}
