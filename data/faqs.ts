/**
 * FAQ content, shared by components/FAQ.tsx (renders it) and lib/jsonLd.ts
 * (emits the FAQPage schema from it), so the structured data can never drift
 * from what the page shows. Answers are segments so an inline link can be
 * rendered as an anchor on the page and flattened to text for the schema.
 */
export type FaqLink = { label: string; href: string; external?: boolean };
export type FaqSegment = string | FaqLink;
export type Faq = { question: string; answer: FaqSegment[] };

export const FAQS: Faq[] = [
  {
    question: 'How are QYLAT and IdeaToPlan related?',
    answer: [
      "They are two entry points into the same ecosystem. QYLAT helps you figure out the work and life you're built for; IdeaToPlan turns that direction into a clear, professional business plan. You can start with either one. They're designed to work together, not as separate businesses.",
    ],
  },
  {
    question: 'What is the free Discover Your Idea assessment?',
    answer: [
      "It's a short assessment, five questions, about two minutes, that matches your skills, values, and lifestyle goals to seven real online income paths. It's free and no email is required to start.",
    ],
  },
  {
    question: 'How long does a business plan take?',
    answer: ['Delivered within 72 hours. Expedited 48-hour delivery is available.'],
  },
  {
    question: 'How much does a business plan cost?',
    answer: [
      'Plans start at $25. You can see the full range of options and details at ',
      { label: 'ideatoplan.to', href: 'https://ideatoplan.to', external: true },
      '.',
    ],
  },
  {
    question: 'What is a Leap Session?',
    answer: [
      "A 45-minute private coaching call built to help you identify what's keeping you stuck, clarify what you actually want, and leave with a first action plan. It's currently offered at a $40 introductory rate.",
    ],
  },
  {
    question: 'Is any of this professional advice?',
    answer: [
      'No. Everything here, including the assessment, plans, and coaching, is informational and educational. It is not legal, financial, tax, immigration, or medical advice. You remain responsible for your own decisions, and we recommend consulting licensed professionals before acting on anything significant. See our ',
      { label: 'Terms of Service', href: '/terms' },
      ' for details.',
    ],
  },
];

/**
 * The page has always rendered the first five only; the sixth stays in the
 * file but is not shown. The FAQPage schema must match what is visible, so
 * both the component and the schema read this list, never FAQS directly.
 */
export const VISIBLE_FAQS: Faq[] = FAQS.slice(0, 5);

export function faqAnswerText(answer: FaqSegment[]): string {
  return answer.map((segment) => (typeof segment === 'string' ? segment : segment.label)).join('');
}
