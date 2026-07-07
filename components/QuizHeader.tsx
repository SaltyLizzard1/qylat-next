'use client';

import QylatLogo from './QylatLogo';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function QuizHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 border-b border-[#7a8f6c]/60 bg-[#92A882] transition-shadow duration-300 ${
        scrolled ? 'shadow-md backdrop-blur-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center py-2">
          <Link
            href="/"
            className="flex items-center flex-none rounded-lg py-0 pr-2 ml-4 hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Back to QYLAT home"
          >
            <QylatLogo className="h-20 w-[251px] lg:h-24 lg:w-[301px] block" />
          </Link>
        </div>
      </div>
    </header>
  );
}