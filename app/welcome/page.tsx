'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import { images } from '../../config/images';

const GOLD_BTN = {
  background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
  color: '#2D1A00',
  border: '1.5px solid #2D1A00',
} as const;

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FBF6E3' }}>
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-6xl mb-6">🌿</div>

          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              color: '#2D1A00',
            }}
          >
            You&apos;re in. Welcome!
          </h1>

          <p className="text-xl leading-relaxed mb-4" style={{ color: '#3A281A' }}>
            I&apos;m so glad you&apos;re here. Truly.
          </p>

          <p className="leading-relaxed mb-6" style={{ color: 'rgba(58,40,26,0.75)' }}>
            You just joined a community of people who are done waiting for the right time,
            the right amount of money, or the fear to go away. We know it doesn&apos;t work
            like that. We go anyway.
          </p>

          <p className="leading-relaxed mb-10" style={{ color: 'rgba(58,40,26,0.75)' }}>
            Expect honest dispatches from Thailand — what&apos;s working, what surprised me, what
            I wish I knew. Plus practical tips you can actually use. No fluff. No polished
            postcards. Just real life, in progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-block font-sans text-lg font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              style={GOLD_BTN}
            >
              Start Reading
            </Link>
            <a
              href="https://www.instagram.com/liz_alfond/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-sans text-lg font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:opacity-70"
              style={{ border: '2px solid #2D1A00', color: '#2D1A00' }}
            >
              Follow on Instagram
            </a>
          </div>

          <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(58,40,26,0.12)' }}>
            <Image
              src={images.logo}
              alt="Quit Your Life and Travel"
              width={160}
              height={64}
              className="h-16 mx-auto object-contain opacity-60"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
