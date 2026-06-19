'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import { images } from '../../config/images';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-6xl mb-6">🌿</div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-900 tracking-tight mb-4">
            You&apos;re in. Welcome!
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-4">
            I&apos;m so glad you&apos;re here. Truly.
          </p>

          <p className="text-gray-500 leading-relaxed mb-6">
            You just joined a community of people who are done waiting for the right time,
            the right amount of money, or the fear to go away. We know it doesn&apos;t work
            like that. We go anyway.
          </p>

          <p className="text-gray-500 leading-relaxed mb-10">
            Expect honest dispatches from Thailand — what&apos;s working, what surprised me, what
            I wish I knew. Plus practical tips you can actually use. No fluff. No polished
            postcards. Just real life, in progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Start Reading
            </Link>
            <a
              href="https://www.instagram.com/liz_alfond/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white text-lg font-semibold px-8 py-4 rounded-full transition-all"
            >
              Follow on Instagram
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100">
            <img
              src={images.logo}
              alt="Quit Your Life and Travel"
              className="h-16 mx-auto object-contain opacity-60"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
