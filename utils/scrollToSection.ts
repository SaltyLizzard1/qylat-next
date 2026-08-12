/** Sticky header id — must match Header.tsx */
export const SITE_HEADER_ID = 'site-header';

function headerBufferPx(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth < 768 ? 4 : 0;
}

/**
 * Document-space top of an element from the offsetParent chain.
 * Unlike getBoundingClientRect, this ignores CSS transforms, so sections
 * held in a Framer Motion entrance state (translateY before whileInView
 * fires) still report their true layout position.
 */
function layoutTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
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
    const top = layoutTop(el) - headerH - buffer;
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