export type Dimension = 'runway' | 'logistics' | 'untethering' | 'momentum';

export type Archetype =
  | 'runway-builder'
  | 'paper-problem'
  | 'tethered'
  | 'almost'
  | 'standing-start'
  | 'ready';

export interface Scores {
  runway: number;
  logistics: number;
  untethering: number;
  momentum: number;
}

export interface Option {
  label: string;
  score: number;
}

export interface Question {
  prompt: string;
  dimension: Dimension;
  options: Option[];
}

// Question 15 options are deliberately not in ascending score order.
// Long contemplation with no movement scores 0, not 3. Do not reorder.
export const QUESTIONS: readonly Question[] = [
  {
    prompt:
      'If your income stopped tomorrow, how long could you cover your current expenses from savings?',
    dimension: 'runway',
    options: [
      { label: 'Less than one month', score: 0 },
      { label: 'One to three months', score: 1 },
      { label: 'Four to nine months', score: 2 },
      { label: 'Ten months or more', score: 3 },
    ],
  },
  {
    prompt: 'How much of your income would survive you moving abroad?',
    dimension: 'runway',
    options: [
      { label: 'None of it. My income is tied to where I live', score: 0 },
      { label: 'A small piece. Most of it would stop', score: 1 },
      { label: 'Most of it, with some disruption', score: 2 },
      { label: 'All of it. Location makes no difference', score: 3 },
    ],
  },
  {
    prompt: 'Do you know what your life would actually cost in the place you have in mind?',
    dimension: 'runway',
    options: [
      { label: 'I have not looked', score: 0 },
      { label: 'I have a rough sense from what I have read', score: 1 },
      { label: 'I have built a real number for rent, food, visa, insurance', score: 2 },
      { label: 'I have that number and I have pressure tested it against a bad month', score: 3 },
    ],
  },
  {
    prompt: 'What is your debt situation?',
    dimension: 'runway',
    options: [
      { label: 'Significant debt with payments I could not maintain on less income', score: 0 },
      { label: 'Manageable debt, but it would follow me and it would hurt', score: 1 },
      { label: 'Small debt, or debt I could clear before going', score: 2 },
      { label: 'No debt that would constrain the decision', score: 3 },
    ],
  },

  {
    prompt: 'Your passport.',
    dimension: 'logistics',
    options: [
      { label: 'I do not have one', score: 0 },
      { label: 'I have one, expiring within a year, or nearly out of pages', score: 1 },
      { label: 'Valid for more than a year', score: 2 },
      { label: 'Valid, and I have checked it against the entry rules where I am going', score: 3 },
    ],
  },
  {
    prompt: 'Do you know which visa you would actually be on?',
    dimension: 'logistics',
    options: [
      { label: 'I have not looked into it', score: 0 },
      { label: 'I know visas exist and I have skimmed a few', score: 1 },
      { label: 'I know which category fits me', score: 2 },
      { label: 'I know the category, the requirements, and whether I qualify', score: 3 },
    ],
  },
  {
    prompt: 'Your housing where you are now.',
    dimension: 'logistics',
    options: [
      { label: 'I own, and selling or letting would be a long process', score: 0 },
      { label: 'I am locked into a lease with real penalties', score: 1 },
      { label: 'Lease ending within a year, or flexible', score: 2 },
      { label: 'I could be out within weeks without a financial hit', score: 3 },
    ],
  },
  {
    prompt: 'Who or what comes with you?',
    dimension: 'logistics',
    options: [
      { label: "I haven't worked out their arrangements yet", score: 0 },
      { label: 'I know who is coming and have started looking into what they need', score: 1 },
      { label: 'I understand the requirements and have a rough idea of the costs', score: 2 },
      {
        label: "Everyone else's arrangements are sorted, or they don't affect my plans",
        score: 3,
      },
    ],
  },

  {
    prompt: 'Who else would this decision land on?',
    dimension: 'untethering',
    options: [
      { label: "I haven't let myself think it through properly", score: 0 },
      { label: 'I think about it constantly without resolving anything', score: 1 },
      { label: 'I have started working out what is possible', score: 2 },
      {
        label: 'We have talked about it honestly, or there is no one else affected',
        score: 3,
      },
    ],
  },
  {
    prompt: 'Have you told anyone who would be affected?',
    dimension: 'untethering',
    options: [
      { label: 'Nobody knows I am considering this', score: 0 },
      { label: 'One or two people know, framed as a daydream', score: 1 },
      { label: 'The people it would affect know I am serious', score: 2 },
      { label: 'We have talked specifically about what it would mean for them', score: 3 },
    ],
  },
  {
    prompt: 'Your stuff. The physical accumulation of your life so far.',
    dimension: 'untethering',
    options: [
      { label: 'I have not thought about what happens to it', score: 0 },
      { label: 'I know it is a problem and I have not started', score: 1 },
      { label: 'I have started sorting, selling, or storing', score: 2 },
      { label: 'It is handled, or it was never much', score: 3 },
    ],
  },
  {
    prompt:
      'If you imagine being gone for two years, what is the first thing that makes your stomach drop?',
    dimension: 'untethering',
    options: [
      { label: 'Something I have never been willing to look at directly', score: 0 },
      { label: 'Something I know exactly, and I avoid it', score: 1 },
      { label: 'Something I know exactly, and I am working on it', score: 2 },
      { label: 'Nothing does. I have already sat with the worst version of this', score: 3 },
    ],
  },

  {
    prompt: 'In the last three months, what have you actually done?',
    dimension: 'momentum',
    options: [
      { label: 'Read, watched, followed accounts', score: 0 },
      { label: 'Made lists, built spreadsheets, researched properly', score: 1 },
      {
        label:
          'Taken one real world step: a document, an appointment, a sale, a conversation',
        score: 2,
      },
      { label: 'Several real world steps that cost me money or were hard to undo', score: 3 },
    ],
  },
  {
    prompt: 'Do you have a date?',
    dimension: 'momentum',
    options: [
      { label: 'No. Someday', score: 0 },
      { label: 'A vague window, like next year', score: 1 },
      { label: 'A target month', score: 2 },
      { label: 'A date, and other people know it', score: 3 },
    ],
  },
  {
    // Options here are intentionally not monotone by duration. See note above.
    prompt: 'How long has this been on your mind?',
    dimension: 'momentum',
    options: [
      { label: 'More than two years, and nothing has materially changed', score: 0 },
      { label: 'It is new. Weeks or a few months', score: 1 },
      { label: 'Under two years', score: 2 },
      { label: 'Two to five years, and I have moved on it', score: 3 },
    ],
  },
  {
    prompt: 'What is your relationship with the idea right now?',
    dimension: 'momentum',
    options: [
      { label: 'I mostly enjoy thinking about it', score: 0 },
      { label: 'I feel stuck. I want it and something is in the way', score: 1 },
      { label: 'I am actively working toward it', score: 2 },
      { label: 'It is happening. I am handling the sequence', score: 3 },
    ],
  },
];

export const DIMENSION_DISPLAY_ORDER: readonly Dimension[] = [
  'untethering',
  'runway',
  'logistics',
  'momentum',
];

export const DIMENSION_LABEL: Record<Dimension, string> = {
  untethering: 'Untethering',
  runway: 'Runway',
  logistics: 'Logistics',
  momentum: 'Momentum',
};

export const MAX_DIMENSION_SCORE = 12;

// Tie break priority per spec: momentum, untethering, runway, logistics.
const TIEBREAK_PRIORITY: readonly Dimension[] = [
  'momentum',
  'untethering',
  'runway',
  'logistics',
];

const BOTTLENECK_TO_ARCHETYPE: Record<Dimension, Archetype> = {
  runway: 'runway-builder',
  logistics: 'paper-problem',
  untethering: 'tethered',
  momentum: 'almost',
};

export function isValidAnswerArray(answers: unknown): answers is number[] {
  if (!Array.isArray(answers)) return false;
  if (answers.length !== QUESTIONS.length) return false;
  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    if (typeof a !== 'number' || !Number.isInteger(a) || a < 0 || a > 3) return false;
  }
  return true;
}

export function scoreAnswers(
  answers: readonly number[]
): { scores: Scores; archetype: Archetype } {
  const scores: Scores = { runway: 0, logistics: 0, untethering: 0, momentum: 0 };
  for (let i = 0; i < QUESTIONS.length; i++) {
    scores[QUESTIONS[i].dimension] += answers[i];
  }

  const dims: Dimension[] = ['runway', 'logistics', 'untethering', 'momentum'];

  if (dims.every((d) => scores[d] >= 10)) {
    return { scores, archetype: 'ready' };
  }
  if (dims.every((d) => scores[d] <= 4)) {
    return { scores, archetype: 'standing-start' };
  }

  let bottleneck: Dimension = TIEBREAK_PRIORITY[0];
  let min = scores[bottleneck];
  for (let i = 1; i < TIEBREAK_PRIORITY.length; i++) {
    const d = TIEBREAK_PRIORITY[i];
    if (scores[d] < min) {
      min = scores[d];
      bottleneck = d;
    }
  }

  return { scores, archetype: BOTTLENECK_TO_ARCHETYPE[bottleneck] };
}

export interface Cta {
  label: string;
  href: string;
}

export interface ArchetypeCopy {
  name: string;
  heading: string;
  body: string[];
  bottleneckLine: string;
  // First-person phrase for share text. Second-person "Your bottleneck: ..."
  // lives on bottleneckLine and is used for on-page display only. The share
  // text is voiced as the sharer's own words, so this drops the prefix and
  // switches "you" / "your" to "I" / "my" where the phrase includes them.
  bottleneckShort: string;
  nextMoveLine: string;
  bottleneckDimension: Dimension | null;
  primaryCta: Cta;
  secondaryCta?: Cta;
}

// Body copy for the four bottleneck archetypes asserts only the bottleneck,
// never the reader's strengths. The scores prove the bottleneck exists;
// they do not prove any of the other three dimensions is high, so copy
// that narrated strengths would misfire for readers whose bottleneck simply
// dominates a low total. standing-start and ready are the two archetypes
// whose thresholds guarantee the copy is true, so their copy stands.
export const ARCHETYPE_COPY: Record<Archetype, ArchetypeCopy> = {
  'runway-builder': {
    name: 'The Runway Builder',
    heading: "You're a Runway Builder.",
    body: [
      "The wanting is rarely the hard part. Most people who think about leaving get stuck long before they get to the arithmetic, and you're already past that. What you don't have yet is money that keeps arriving once you're gone.",
      "That's a better problem than it looks. Some of the things on this list move slowly and cost you something you can't get back. Income isn't one of them. It's a build, and builds respond to effort in a way that most of this doesn't.",
    ],
    bottleneckLine: 'Your bottleneck: money that survives the move.',
    bottleneckShort: 'money that survives the move',
    nextMoveLine:
      "Your next move: work out how you'd support yourself living the life you want, then turn it into a plan you can actually follow.",
    bottleneckDimension: 'runway',
    primaryCta: { label: 'Discover Your Idea', href: '/assessment' },
    secondaryCta: { label: 'Open the Leap Calculator', href: '/calculator' },
  },
  'paper-problem': {
    name: 'The Paper Problem',
    heading: "You've got a Paper Problem.",
    body: [
      'Of all the things that can stand between someone and a different life, this is the one with an actual solution. Not a mindset shift, not three more years of saving. Forms, dates, and a bit of sequencing.',
      "A visa you haven't looked into yet. A passport with eight months left on it. A lease, a pet, someone who needs paperwork of their own before they can come with you.",
      'The only real risk here is how quiet it is. Paperwork never announces itself, so it waits politely at the bottom of the list, and a year goes by.',
    ],
    bottleneckLine: 'Your bottleneck: documents and dates.',
    bottleneckShort: 'documents and dates',
    nextMoveLine:
      'Your next move: pick the single document that everything else waits on, and start it this week.',
    bottleneckDimension: 'logistics',
    // TODO Liz: this route has no dedicated asset yet. Interim CTA is the
    // Leap Session. Build the visa and logistics sequence before this gets
    // real traffic, then swap primaryCta.
    primaryCta: { label: 'Book a Leap Session', href: 'https://cal.com/qylat/leap-session' },
  },
  tethered: {
    name: 'The Tethered',
    heading: "You're Tethered.",
    body: [
      "Being tethered isn't the same as being trapped. Some things hold us because we're afraid of what happens if we let go, and some hold us because we love what's on the other end of the rope. Those look identical from the outside and feel nothing alike from the inside.",
      "So the question was never whether you have ties. The question is whether you've let yourself work out what you're actually willing to do about them, and that's the part still waiting.",
    ],
    bottleneckLine:
      "Your bottleneck: decisions you haven't made yet about people and things you love.",
    bottleneckShort: "decisions I haven't made yet about people and things I love",
    nextMoveLine:
      'Your next move: stop treating this as one impossible decision and break it into the sixty days it actually takes.',
    bottleneckDimension: 'untethering',
    primaryCta: { label: 'Book a Leap Session', href: 'https://cal.com/qylat/leap-session' },
  },
  almost: {
    name: 'The Almost',
    heading: 'You\'re the "Almost."',
    body: [
      "Almost is not a criticism. It's a description of where you're standing, and most people never get near enough to stand here at all.",
      "But there's a difference between preparing to change your life and changing it, and preparation has a way of feeling like progress right up until you notice how long it's been.",
      "You're not missing information. You're missing movement.",
    ],
    bottleneckLine: 'Your bottleneck: one real step, taken.',
    bottleneckShort: 'one real step, taken',
    nextMoveLine:
      'Your next move: do one thing this week that costs money or is hard to undo. Not another list.',
    bottleneckDimension: 'momentum',
    primaryCta: { label: 'Book a Leap Session', href: 'https://cal.com/qylat/leap-session' },
  },
  'standing-start': {
    name: 'The Standing Start',
    heading: "You're at a Standing Start.",
    body: [
      "None of it is in place yet. That isn't a failure, it's a starting position, and it's where almost everyone begins.",
      "You don't need a plan yet. You need a number that makes this feel real and a story that makes it feel possible.",
    ],
    bottleneckLine: 'Your bottleneck: everything, which means you can start anywhere.',
    bottleneckShort: 'everything, which means I can start anywhere',
    nextMoveLine:
      'Your next move: see what this actually costs, then decide if you want it.',
    bottleneckDimension: null,
    primaryCta: { label: 'Open the Leap Calculator', href: '/calculator' },
    secondaryCta: { label: 'Read the Story', href: '/story' },
  },
  ready: {
    name: 'The Ready',
    heading: "You're Ready.",
    body: [
      "There's no bottleneck in your results. The money, the documents, the ties and the movement are all in place. That's rare.",
      "Which means the question you've been asking has changed. You're not working out whether you can go. You're working out when.",
    ],
    bottleneckLine: 'Your bottleneck: none. The only thing left is a date.',
    bottleneckShort: 'nothing. The only thing left is a date',
    nextMoveLine: 'Your next move: pick the date and tell someone.',
    bottleneckDimension: null,
    primaryCta: { label: 'Book a Leap Session', href: 'https://cal.com/qylat/leap-session' },
  },
};
