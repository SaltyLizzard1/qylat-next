// Every email capture surface on the site, in one place. Safe to import from
// client and server code: it holds no secrets.
//
// A form and a purpose are different things. Two forms can ask for the same
// resource (the homepage strip and the calculator both ask for the Leap Kit),
// and what gets sent is decided by purpose, so asking twice from two places
// still sends one email.
//
// Asking for a resource or unlocking results is never newsletter consent. The
// Leap Log is a separate, unchecked choice on those forms. Only the footer
// form is itself a newsletter signup.

export const NEWSLETTER_LABEL = 'Also send me the Leap Log, my occasional email. Unsubscribe any time.';

export type EmailSource =
  | 'footer'
  | 'lead-magnet'
  | 'calculator'
  | 'assessment'
  | 'results-gate'
  | 'post-60-day';

export type EmailPurpose =
  | 'newsletter'
  | 'leap_kit'
  | 'assessment_report'
  | 'shared_results_view';

type SourceConfig = {
  purpose: EmailPurpose;
  /** What the form says the email address is for. Stored with each capture. */
  notice: string;
  /** Template of the email this purpose delivers. null: the form promises no email. */
  resourceTemplate: string | null;
  /**
   * A repeat request inside this many days sends nothing new. null means once
   * ever for the scope (an assessment report is scoped to its result id).
   */
  windowDays: number | null;
  /** 'implicit': the form is the newsletter signup. 'optional': unchecked checkbox. */
  newsletter: 'implicit' | 'optional';
};

export const EMAIL_SOURCES: Record<EmailSource, SourceConfig> = {
  footer: {
    purpose: 'newsletter',
    notice: 'Footer newsletter signup: I will send you the Leap Log now and then. Unsubscribe any time.',
    resourceTemplate: null,
    windowDays: 7,
    newsletter: 'implicit',
  },
  'lead-magnet': {
    purpose: 'leap_kit',
    notice: 'Homepage: send me the free 60-Day Leap Kit.',
    resourceTemplate: 'leap_kit',
    windowDays: 7,
    newsletter: 'optional',
  },
  calculator: {
    purpose: 'leap_kit',
    notice: 'Leap Runway Calculator: send me the free 60-Day Leap Kit.',
    resourceTemplate: 'leap_kit',
    windowDays: 7,
    newsletter: 'optional',
  },
  // Kit delivered the same Leap Kit PDF from this form as from the other two,
  // so it shares their purpose: asking here after asking there sends nothing new.
  'post-60-day': {
    purpose: 'leap_kit',
    notice: 'How to Move to Thailand in 60 Days post: send me the 60-day plan.',
    resourceTemplate: 'leap_kit',
    windowDays: 7,
    newsletter: 'optional',
  },
  assessment: {
    purpose: 'assessment_report',
    notice: 'Discover Your Idea assessment: unlock my results and email me the full report.',
    resourceTemplate: 'assessment_report',
    windowDays: null,
    newsletter: 'optional',
  },
  'results-gate': {
    purpose: 'shared_results_view',
    notice: 'Shared results page: show me the rest of these matches. No email was promised.',
    resourceTemplate: null,
    windowDays: 7,
    newsletter: 'optional',
  },
};

export function isEmailSource(value: unknown): value is EmailSource {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(EMAIL_SOURCES, value);
}

type SubscribeInput = {
  source: EmailSource;
  email: string;
  /** The visitor's actual checkbox state. Ignored for the footer, which is the signup itself. */
  newsletterOptIn?: boolean;
  fields?: Record<string, string | number>;
  /** quiz_results id. The assessment report is built from that saved row. */
  resultId?: string;
  /** Issued by /api/quiz with the result. Required for the report to be sent. */
  reportToken?: string;
};

/** Browser helper. Resolves true when the capture was recorded. */
export async function subscribe(input: SubscribeInput): Promise<boolean> {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return res.ok;
}
