/** Sticky header id — must match Header.tsx */
export const SITE_HEADER_ID = 'site-header';

function headerBufferPx(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth < 768 ? 4 : 0;
}

/**
 * Scroll so section top clears the sticky header (fixes mobile menu + iOS).
 */
export function scrollToSectionById(
  sectionId: string,
  opts?: { afterMobileMenuClose?: boolean }
): void {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const run = () => {
    const header = document.getElementById(SITE_HEADER_ID);
    const headerH = header?.getBoundingClientRect().height ?? 0;
    const buffer = headerBufferPx();
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - buffer;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    const hash = sectionId === 'hero' ? '/' : `/#${sectionId}`;
    window.history.replaceState(null, '', hash);
  };

  if (opts?.afterMobileMenuClose) {
    window.setTimeout(run, 160);
  } else {
    requestAnimationFrame(run);
  }
}