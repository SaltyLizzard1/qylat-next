'use client';

import { Mail } from 'lucide-react';
import Header from '../../components/Header';
import { images } from '../../config/images';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-900 tracking-tight mb-6">
            You&apos;re in. Welcome to the community!
          </h1>

          <div className="text-lg text-gray-600 leading-relaxed space-y-4 mb-10">
            <p>
              You just joined a group of people who are done waiting for the right
              moment and ready to build a life that actually fits. That&apos;s worth
              celebrating.
            </p>
            <p>
              The Leap Log is open for your experiences, questions and stories.
              Jump in, share where you are in your journey and connect with people
              who get it.
            </p>
            <p className="font-semibold text-emerald-800">We are so glad you&apos;re here.</p>
          </div>

          <a
            href="/#the-leap-log"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg mb-10"
          >
            👉 To The Leap Log
          </a>

          <div className="flex items-center justify-center gap-4 mt-2">
            <a
              href="https://www.instagram.com/liz_alfond/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-md"
              style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>

            <a
              href="https://www.facebook.com/liz.alfond"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-md"
              style={{ backgroundColor: '#1877F2' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>

            <a
              href="https://www.tiktok.com/@quityourlifeandtravel"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-md"
              style={{ backgroundColor: '#010101' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.83 4.83 0 01-1-.15z"/></svg>
            </a>

            <a
              href="mailto:liz@quityourlifeandtravel.com"
              aria-label="Email"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-md bg-orange-500 hover:bg-orange-600"
            >
              <Mail className="w-5 h-5" />
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
