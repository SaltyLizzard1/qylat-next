'use client';

import QylatLogo from './QylatLogo';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

type NavItem =
  | { label: string; type: 'scroll'; id: string }
  | { label: string; type: 'link'; href: string };

const NAV: NavItem[] = [
  { label: 'Home', type: 'scroll', id: 'hero' },
  { label: 'My Story', type: 'link', href: '/story' },
  { label: 'Leap Log', type: 'scroll', id: 'the-leap-log' },
  { label: 'Discover Your Idea', type: 'link', href: '/quiz' },
  { label: 'Idea To Plan', type: 'scroll', id: 'idea-to-plan' },
  { label: 'Work With Me', type: 'scroll', id: 'work-with-me' },
  { label: 'About', type: 'scroll', id: 'about' },
];

export default function QuizHeader() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (item: NavItem) => {
    setIsMobileMenuOpen(false);

    if (item.type === 'link') {
      router.push(item.href);
      return;
    }

    // We are never on the homepage here, so scroll items become homepage links
    const href = item.id === 'hero' ? '/' : `/#${item.id}`;
    router.push(href);
  };

  const navPill =
    'rounded-full px-4 py-1 text-sm font-semibold whitespace-nowrap ' +
    'bg-white text-[#2C3340] border border-white/80 ' +
    'shadow-sm hover:bg-[#DED18F] hover:text-[#2C3340] hover:border-[#DED18F] ' +
    'active:scale-[0.97] transition-all duration-200';

  const navPillMobile =
    'w-full text-center rounded-full px-5 py-2.5 font-semibold text-base ' +
    'bg-white text-[#2C3340] border border-white/80 ' +
    'shadow-sm hover:bg-[#DED18F] hover:text-[#2C3340] hover:border-[#DED18F] transition-all';

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 border-b border-[#7a8f6c]/60 bg-[#92A882] transition-shadow duration-300 ${
        scrolled ? 'shadow-md backdrop-blur-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center py-1">

          {/* LOGO — smaller than the main header */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center flex-none text-left rounded-lg py-0 pr-2 ml-2 hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="QYLAT"
          >
            <QylatLogo className="h-14 w-[176px] lg:h-16 lg:w-[201px] block" />
          </button>

          {/* DESKTOP / TABLET NAV */}
          <nav className="hidden md:flex items-center gap-3 ml-auto">
            {NAV.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item)}
                className={navPill}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className="md:hidden p-2 rounded-full bg-white text-[#2C3340] border border-white/80 shadow-sm ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#7a8f6c]/60 animate-fade-in bg-[#92A882] shadow-inner">
          <nav className="flex flex-col gap-2 px-4 py-4">
            {NAV.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item)}
                className={navPillMobile}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}