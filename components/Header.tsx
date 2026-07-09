'use client';

import QylatLogo from './QylatLogo';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { SITE_HEADER_ID, scrollToSectionById } from '../utils/scrollToSection';

type NavItem =
  | { label: string; type: 'scroll'; id: string }
  | { label: string; type: 'link'; href: string };

const NAV: NavItem[] = [
  { label: 'Home', type: 'scroll', id: 'hero' },
  { label: 'My Story', type: 'link', href: '/story' },
  { label: 'Leap Log', type: 'scroll', id: 'the-leap-log' },
  { label: 'Discover Your Idea', type: 'scroll', id: 'discover-your-idea' },
  { label: 'Idea To Plan', type: 'scroll', id: 'idea-to-plan' },
  { label: 'Work With Me', type: 'scroll', id: 'work-with-me' },
  { label: 'FAQ', type: 'scroll', id: 'faq' },
  { label: 'About', type: 'scroll', id: 'about' },
];

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const sync = () => {
      const h = el.getBoundingClientRect().height;
      const mobile = window.innerWidth < 768;
      const buffer = mobile ? 28 : 14;
      document.documentElement.style.setProperty(
        '--header-scroll-padding',
        `${Math.ceil(h) + buffer}px`
      );
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      mq.removeEventListener('change', sync);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const fromMenu = isMobileMenuOpen;
    setIsMobileMenuOpen(false);
    scrollToSectionById(id, { afterMobileMenuClose: fromMenu });
  };

  const handleNavClick = (item: NavItem) => {
    setIsMobileMenuOpen(false);

    if (item.type === 'link') {
      router.push(item.href);
      return;
    }

    if (window.location.pathname === '/') {
      scrollToSection(item.id);
      return;
    }

    const href = item.id === 'hero' ? '/' : `/#${item.id}`;
    router.push(href);
  };

  const headerBg = 'bg-[#92A882]';

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
      ref={headerRef}
      id={SITE_HEADER_ID}
      className={`sticky top-0 left-0 right-0 z-50 border-b border-[#7a8f6c]/60 transition-shadow duration-300 ${headerBg} ${scrolled ? 'shadow-md backdrop-blur-md' : 'shadow-sm'}`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center py-1">

          {/* LOGO */}
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="flex items-center flex-none text-left rounded-lg py-0 pr-2 ml-4 hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="QYLAT"
          >
            <QylatLogo className="h-14 w-[176px] lg:h-16 lg:w-[201px] block" />
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-4 ml-auto">
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

          {/* TABLET NAV */}
          <nav className="hidden md:flex lg:hidden items-center gap-3 ml-auto">
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
        <div className={`md:hidden border-t border-[#7a8f6c]/60 animate-fade-in ${headerBg} shadow-inner`}>
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
