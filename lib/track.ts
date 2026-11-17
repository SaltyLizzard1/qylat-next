// Google Analytics events for the things a visitor completes on the site.
//
// The tag itself is loaded by <GoogleAnalytics /> in app/layout.tsx, which
// defines window.gtag. This file adds no dependency and holds no secrets, so
// it is safe to import from code that is shared with the server: on the server
// track() does nothing.
//
// Never put an email address, a name or any free text a visitor typed into an
// event. Parameters are fixed labels only.
//
// The first four are the conversions and are meant to be marked as key events
// in GA4 Admin. The two clicks are intent, not conversions.

export type TrackEvent =
  | 'generate_lead'
  | 'quiz_complete'
  | 'assessment_complete'
  | 'plan_request_submit'
  | 'book_session_click'
  | 'ideatoplan_click';

type Params = Record<string, string | number>;

/**
 * Sends one event to GA4. A failure here is reported in the console and never
 * thrown, because analytics must not stand between a visitor and a result.
 */
export function track(name: TrackEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== 'function') {
      console.warn(`Analytics event "${name}" not sent: the Google tag has not loaded.`);
      return;
    }
    gtag('event', name, params);
  } catch (err) {
    console.error(`Analytics event "${name}" failed:`, err);
  }
}

/** For an outbound link: reports the click by where the link goes. */
export function trackOutbound(href: string, placement: string): void {
  if (href.includes('cal.com')) track('book_session_click', { placement });
  else if (href.includes('ideatoplan.to')) track('ideatoplan_click', { placement });
}
