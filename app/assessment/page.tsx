'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ShareButtons from '@/components/ShareButtons';
import AssessmentLoader from '@/components/AssessmentLoader';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  hardSkills: string[];
  softSkills: string[];
  workStyle: string[];
  values: string[];
  hoursPerWeek: string;
  incomeTarget: string;
}

interface Match {
  title: string;
  category: string;
  description: string;
  whyYou: string;
  saturation: 'Low' | 'Medium' | 'High';
  saturationNote: string;
  uniqueAngle: string;
  incomeRange: string;
  firstSteps: string[];
}

type Stage = 'form' | 'loading' | 'results' | 'unlocked';

// ── Brand tokens (inline per component, matching repo convention) ──────────

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';
const ESPRESSO_DEEP = '#2D1A00';
const ESPRESSO = '#3A281A';
const SLATE = '#2C3340';
const CREAM = '#FBF6E3';
const PALE_SAGE = '#EBF0E6';

const SLATE_SECONDARY = 'rgba(44,51,64,0.72)';
const SLATE_TERTIARY = 'rgba(44,51,64,0.55)';
const SLATE_MUTED = 'rgba(44,51,64,0.4)';

const CARD_BORDER = '1px solid rgba(58,40,26,0.12)';
const PILL_BORDER = 'rgba(58,40,26,0.18)';
const INPUT_BORDER = 'rgba(58,40,26,0.2)';

const headingFont: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 700,
};

const GOLD_BUTTON_STYLE = {
  background: GOLD_GRADIENT,
  color: ESPRESSO_DEEP,
  border: '1.5px solid #2D1A00',
} as const;

// ── Constants ──────────────────────────────────────────────────────────────

const HARD_SKILLS = [
  'Writing & copywriting',
  'Graphic design',
  'Web / UI design',
  'Video editing & production',
  'Photography',
  'Audio & podcast production',
  'Animation & motion graphics',
  'Software development',
  'AI & automation tools',
  'Technical support & IT',
  'Data analysis & spreadsheets',
  'SEO & content strategy',
  'Email marketing',
  'Paid advertising (Google / Meta)',
  'Social media management',
  'Community management',
  'Sales & business development',
  'Customer success',
  'Teaching & course creation',
  'Public speaking & presenting',
  'Project management',
  'Virtual assistance & admin',
  'Bookkeeping & accounting',
  'Legal & compliance',
  'HR & recruiting',
  'Research & fact-checking',
  'Translation & localization',
  'Other',
];

const SOFT_SKILLS = [
  'Communicating clearly',
  'Organizing & systemizing',
  'Problem-solving',
  'Empathy & listening',
  'Persuading & influencing',
  'Attention to detail',
  'Leading & mentoring',
  'Researching & synthesizing',
  'Adapting to change',
  'Creative thinking',
  'Teaching & explaining',
  'Negotiating',
  'Strategic thinking',
  'Networking & relationship-building',
];

const VALUES = [
  'Freedom & location independence',
  'Helping people directly',
  'Creative expression',
  'Building something of my own',
  'Financial stability',
  'Learning & growing constantly',
  'Making a big impact',
  'Autonomy, no boss',
  'Recognition & status',
  'Community & belonging',
];

const WORK_STYLE_PAIRS = [
  { a: 'People-facing', b: 'Behind the scenes' },
  { a: 'Structured schedule', b: 'Flexible hours' },
  { a: 'Solo deep work', b: 'Collaborative & team-based' },
  { a: 'Creating new things', b: 'Improving existing things' },
];

// En dashes below are numeric-range punctuation, not em dashes.
const HOURS_OPTIONS = ['<5', '5–10', '10–20', '20–30', '30+'];
const INCOME_OPTIONS = ['$500–$1,000', '$1,000–$2,500', '$2,500–$5,000', '$5,000–$10,000', '$10,000+'];

// Palette-tinted saturation badges: sage / gold / espresso tints. Same
// tonal family so they read as related; distinct by hue so the reader
// can differentiate at a glance. Espresso is a muted tint, not solid,
// so High does not feel heavier than the other two.
const SATURATION_STYLES: Record<Match['saturation'], React.CSSProperties> = {
  Low: { background: 'rgba(146,168,130,0.22)', color: ESPRESSO },
  Medium: { background: 'rgba(232,200,74,0.22)', color: ESPRESSO_DEEP },
  High: { background: 'rgba(58,40,26,0.14)', color: ESPRESSO_DEEP },
};

// Muted red reserved for error semantics only. Kept out of the palette
// tokens above so it cannot leak into decorative use.
const ERROR_STYLE: React.CSSProperties = {
  color: '#7a2f2f',
  background: 'rgba(200, 80, 80, 0.08)',
  border: '1px solid rgba(200, 80, 80, 0.2)',
};

// ── Pill component ─────────────────────────────────────────────────────────

function Pill({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const base = 'px-4 py-2 rounded-full border text-sm font-medium transition-all';

  if (selected) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} shadow-sm`}
        style={{
          background: '#E8C84A',
          color: ESPRESSO_DEEP,
          borderColor: ESPRESSO_DEEP,
        }}
      >
        {label}
      </button>
    );
  }

  if (disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled
        className={`${base} cursor-not-allowed`}
        style={{
          background: 'rgba(251,246,227,0.55)',
          color: SLATE_MUTED,
          borderColor: 'rgba(58,40,26,0.10)',
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} bg-white hover:border-[#C9A030] hover:text-[#8B6914]`}
      style={{
        color: SLATE,
        borderColor: PILL_BORDER,
      }}
    >
      {label}
    </button>
  );
}

// ── Either-or card pair ────────────────────────────────────────────────────

function EitherOrPair({
  optionA,
  optionB,
  value,
  onChange,
}: {
  optionA: string;
  optionB: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const card = (label: string) => {
    const active = value === label;
    const base =
      'flex-1 py-5 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-center';
    if (active) {
      return (
        <button
          type="button"
          onClick={() => onChange(label)}
          className={`${base} shadow`}
          style={{
            background: CREAM,
            color: ESPRESSO_DEEP,
            borderColor: '#C9A030',
          }}
        >
          {label}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onChange(label)}
        className={`${base} bg-white hover:border-[#E8C84A]`}
        style={{
          color: SLATE,
          borderColor: PILL_BORDER,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex gap-3 items-center">
      {card(optionA)}
      <span
        className="text-xs font-bold shrink-0"
        style={{ color: 'rgba(44,51,64,0.5)' }}
      >
        OR
      </span>
      {card(optionB)}
    </div>
  );
}

// ── Result card ────────────────────────────────────────────────────────────

function MatchCard({ match, index }: { match: Match; index: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFEFB',
        border: CARD_BORDER,
        boxShadow: '0 14px 34px rgba(30,20,5,0.09)',
      }}
    >
      <div style={{ height: '4px', background: GOLD_GRADIENT }} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-wide mb-1 block"
              style={{ color: SLATE_TERTIARY }}
            >
              {match.category}
            </span>
            <h3
              style={{
                ...headingFont,
                color: ESPRESSO_DEEP,
                fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)',
                lineHeight: 1.2,
              }}
            >
              {index + 1}. {match.title}
            </h3>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full mt-1 shrink-0"
            style={SATURATION_STYLES[match.saturation]}
          >
            {match.saturation} saturation
          </span>
        </div>

        <p className="mb-3 leading-relaxed" style={{ color: SLATE }}>
          {match.description}
        </p>

        <p
          className="text-sm italic border-l-2 pl-4 mb-4"
          style={{ color: ESPRESSO, borderColor: '#C9A030' }}
        >
          {match.whyYou}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: SLATE_TERTIARY }}
          >
            Income range:
          </span>
          <span className="text-sm font-bold" style={{ color: ESPRESSO_DEEP }}>
            {match.incomeRange}
          </span>
        </div>

        {match.uniqueAngle && (
          <div
            className="rounded-lg px-4 py-3 mb-4"
            style={{ background: CREAM, border: '1px solid #EBD9A0' }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-1"
              style={{ color: '#8B6914' }}
            >
              Your unique angle
            </p>
            <p className="text-sm" style={{ color: ESPRESSO_DEEP }}>
              {match.uniqueAngle}
            </p>
          </div>
        )}

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: SLATE_TERTIARY }}
          >
            First steps
          </p>
          <ol className="space-y-1">
            {match.firstSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: SLATE }}>
                <span className="font-bold shrink-0" style={{ color: '#8B6914' }}>
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs mt-3" style={{ color: SLATE_TERTIARY }}>
          {match.saturationNote}
        </p>
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div
      className="w-full rounded-full h-1.5 mb-8"
      style={{ background: 'rgba(58,40,26,0.12)' }}
    >
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%`, backgroundImage: GOLD_GRADIENT }}
      />
    </div>
  );
}

// ── Step heading ───────────────────────────────────────────────────────────

function StepHeading({ title, sub }: { title: string; sub: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2
        style={{
          ...headingFont,
          color: ESPRESSO_DEEP,
          fontSize: 'clamp(1.35rem, 3.5vw, 1.65rem)',
          lineHeight: 1.2,
          marginBottom: '0.35rem',
        }}
      >
        {title}
      </h2>
      <p className="text-sm" style={{ color: SLATE_SECONDARY, lineHeight: 1.5 }}>
        {sub}
      </p>
    </div>
  );
}

// ── Main Quiz component ────────────────────────────────────────────────────

export default function QuizPage() {
  const [stage, setStage] = useState<Stage>('form');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    hardSkills: [],
    softSkills: [],
    workStyle: WORK_STYLE_PAIRS.map(() => ''),
    values: [],
    hoursPerWeek: '',
    incomeTarget: '',
  });

  const [matches, setMatches] = useState<Match[]>([]);
  const [resultId, setResultId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [loaderComplete, setLoaderComplete] = useState(false);

  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stage, step]);

  function togglePill(
    field: 'hardSkills' | 'softSkills' | 'values',
    value: string,
    max?: number
  ) {
    setForm((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      if (max && current.length >= max) return prev;
      return { ...prev, [field]: [...current, value] };
    });
  }

  function canAdvance(): boolean {
    if (step === 1) return form.hardSkills.length > 0;
    if (step === 2) return form.softSkills.length > 0;
    if (step === 3) return form.workStyle.every((v) => v !== '');
    if (step === 4) return form.values.length > 0;
    if (step === 5) return form.hoursPerWeek !== '' && form.incomeTarget !== '';
    return false;
  }

  async function submitQuiz() {
    setStage('loading');
    setError('');
    setLoaderComplete(false);

    try {
      const webhookUrl = '/api/quiz';
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hardSkills: form.hardSkills,
          softSkills: form.softSkills,
          workStyle: WORK_STYLE_PAIRS.map((pair, i) => form.workStyle[i] || pair.a),
          values: form.values,
          hoursPerWeek: form.hoursPerWeek,
          incomeTarget: form.incomeTarget,
        }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      const parsed: Match[] = Array.isArray(data) ? data : data.matches ?? data.result ?? [];

      if (!parsed.length) throw new Error('No matches returned');

      setMatches(parsed);
      if (data.resultId) setResultId(data.resultId);
      setLoaderComplete(true);
      setTimeout(() => setStage('results'), 900);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Quiz error:', err);
      setError('Something went wrong fetching your results. Please try again.');
      setStage('form');
      setStep(5);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    setEmailError('');

    try {
      await fetch('https://app.kit.com/forms/9562904/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email_address: email.trim() }).toString(),
      });

      setStage('unlocked');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Email error:', err);
      setEmailError('Something went wrong. Try again.');
    } finally {
      setEmailLoading(false);
    }
  }

  function renderStep() {
    if (step === 1) {
      return (
        <div>
          <StepHeading
            title="Your hard skills"
            sub="Select everything that applies. Be generous."
          />
          <div className="flex flex-wrap gap-2">
            {HARD_SKILLS.map((s) => (
              <Pill
                key={s}
                label={s}
                selected={form.hardSkills.includes(s)}
                disabled={false}
                onClick={() => togglePill('hardSkills', s)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <StepHeading
            title="Your soft skills"
            sub={
              <>
                Pick your top 5.{' '}
                <span className="font-semibold" style={{ color: '#8B6914' }}>
                  {form.softSkills.length}/5 selected
                </span>
              </>
            }
          />
          <div className="flex flex-wrap gap-2">
            {SOFT_SKILLS.map((s) => (
              <Pill
                key={s}
                label={s}
                selected={form.softSkills.includes(s)}
                disabled={form.softSkills.length >= 5}
                onClick={() => togglePill('softSkills', s, 5)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div>
          <StepHeading title="How you like to work" sub="Pick one from each pair." />
          <div className="space-y-4">
            {WORK_STYLE_PAIRS.map((pair, i) => (
              <EitherOrPair
                key={i}
                optionA={pair.a}
                optionB={pair.b}
                value={form.workStyle[i]}
                onChange={(v) =>
                  setForm((prev) => {
                    const updated = [...prev.workStyle];
                    updated[i] = v;
                    return { ...prev, workStyle: updated };
                  })
                }
              />
            ))}
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div>
          <StepHeading
            title="What matters most"
            sub={
              <>
                Pick your top 3.{' '}
                <span className="font-semibold" style={{ color: '#8B6914' }}>
                  {form.values.length}/3 selected
                </span>
              </>
            }
          />
          <div className="flex flex-wrap gap-2">
            {VALUES.map((v) => (
              <Pill
                key={v}
                label={v}
                selected={form.values.includes(v)}
                disabled={form.values.length >= 3}
                onClick={() => togglePill('values', v, 3)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div>
          <StepHeading
            title="The practical part"
            sub="Realistic expectations make better matches."
          />

          <div className="space-y-5">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: SLATE }}
              >
                Hours available per week
              </label>
              <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    label={opt}
                    selected={form.hoursPerWeek === opt}
                    disabled={false}
                    onClick={() => setForm((prev) => ({ ...prev, hoursPerWeek: opt }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: SLATE }}
              >
                Monthly income target
              </label>
              <div className="flex flex-wrap gap-2">
                {INCOME_OPTIONS.map((opt) => (
                  <Pill
                    key={opt}
                    label={opt}
                    selected={form.incomeTarget === opt}
                    disabled={false}
                    onClick={() => setForm((prev) => ({ ...prev, incomeTarget: opt }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm px-4 py-2 rounded-lg" style={ERROR_STYLE}>
              {error}
            </p>
          )}
        </div>
      );
    }

    return null;
  }

  if (stage === 'loading') {
    return (
      <>
        <Header />
        <div
          className="relative overflow-hidden min-h-[calc(100vh-7rem)] flex items-center justify-center px-4"
          style={{ background: PALE_SAGE }}
        >
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 md:w-96 md:h-96 rounded-full opacity-20"
            style={{ background: GOLD_GRADIENT }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-10"
            style={{ background: GOLD_GRADIENT }}
          />
          <div className="relative w-full max-w-sm">
            <AssessmentLoader expectedMs={75000} isComplete={loaderComplete} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (stage === 'results' || stage === 'unlocked') {
    const locked = stage === 'results';
    const top3 = matches.slice(0, 3).map((m, i) => `${i + 1}. ${m.title}`).join('\n');
    const more = matches.length > 3 ? `…and ${matches.length - 3} more.` : '';
    const shareText = `${'✨'} I took the 5-minute Discover Your Idea assessment. My top matches:\n${top3}\n${more}\n${'\u{1F4AB}'} Find yours:`;

    return (
      <>
        <Header />
        <div
          className="relative overflow-hidden min-h-screen"
          style={{ background: PALE_SAGE }}
        >
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 md:w-96 md:h-96 rounded-full opacity-20"
            style={{ background: GOLD_GRADIENT }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-10"
            style={{ background: GOLD_GRADIENT }}
          />
          <div ref={topRef} className="relative max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: '#E8C84A' }} />
              <h1
                className="text-center"
                style={{
                  ...headingFont,
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  color: ESPRESSO,
                  lineHeight: 1.15,
                }}
              >
                My Business Matches
              </h1>
            </div>
            <p
              className="mb-4 text-sm text-center"
              style={{ color: SLATE_SECONDARY }}
            >
              Based on your skills, values, and lifestyle goals: here are your top 7 paths.
            </p>

            {!locked && resultId && (
              <div className="mb-8">
                <ShareButtons
                  url={`https://www.quityourlifeandtravel.com/results/${resultId}`}
                  title="My Business Matches"
                  text={shareText}
                />
              </div>
            )}

            <div className="mb-4">
              <MatchCard match={matches[0]} index={0} />
            </div>

            <div className="relative">
              <div className={locked ? 'blur-sm select-none pointer-events-none' : ''}>
                <div className="space-y-4">
                  {matches.slice(1).map((match, i) => (
                    <MatchCard key={i} match={match} index={i + 1} />
                  ))}
                </div>
              </div>

              {locked && (
                <div className="absolute inset-0 flex items-start justify-center pt-8">
                  <div
                    className="bg-white rounded-2xl shadow-xl p-8 mx-4 w-full max-w-md text-center"
                    style={{ border: CARD_BORDER }}
                  >
                    <h3
                      style={{
                        ...headingFont,
                        color: ESPRESSO_DEEP,
                        fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
                        lineHeight: 1.2,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Your #1 Match is {matches[0]?.title ?? 'ready'}. You are naturally wired for this.
                    </h3>
                    <p
                      className="text-sm mb-6"
                      style={{ color: SLATE_SECONDARY, lineHeight: 1.5 }}
                    >
                      I&apos;ve mapped 6 more paths that fit your profile, each with clear
                      first moves to make. Where should I send your full Career Identity
                      Dossier?
                    </p>
                    <form onSubmit={submitEmail} className="space-y-3">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full min-w-0 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A030]"
                        style={{
                          border: `1px solid ${INPUT_BORDER}`,
                          color: ESPRESSO_DEEP,
                        }}
                      />
                      <button
                        type="submit"
                        disabled={emailLoading}
                        className="w-full py-3 font-semibold rounded-lg transition-all hover:brightness-105 disabled:opacity-60"
                        style={GOLD_BUTTON_STYLE}
                      >
                        {emailLoading ? 'Unlocking...' : 'Enter Email to Unlock Your Full Report'}
                      </button>
                    </form>
                    {emailError && (
                      <p
                        className="mt-3 text-sm px-3 py-2 rounded-lg"
                        style={ERROR_STYLE}
                      >
                        {emailError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!locked && (
              <div
                className="mt-10 rounded-2xl p-8 text-center"
                style={{ background: CREAM, border: '1px solid #EBD9A0' }}
              >
                <p
                  className="text-lg font-bold mb-2"
                  style={{ color: ESPRESSO_DEEP }}
                >
                  Ready to turn your top match into a real plan?
                </p>
                <p className="text-sm mb-5" style={{ color: SLATE }}>
                  This assessment is your entry point. IdeaToPlan, part of the same ecosystem,
                  turns your match into a clear, professional business plan.
                </p>
                <a
                  href="https://ideatoplan.to/#pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
                  style={GOLD_BUTTON_STYLE}
                >
                  Continue with IdeaToPlan →
                </a>
              </div>
            )}

          </div>
        </div>
        <Footer />
      </>
    );
  }

  const TOTAL_STEPS = 5;

  return (
    <>
      <Header />
      <div
        className="relative overflow-hidden min-h-screen"
        style={{ background: PALE_SAGE }}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 md:w-96 md:h-96 rounded-full opacity-20"
          style={{ background: GOLD_GRADIENT }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-10"
          style={{ background: GOLD_GRADIENT }}
        />
        <div ref={topRef} className="max-w-xl mx-auto px-4 pt-6 pb-10">
          <h1
            className="mb-2 text-center"
            style={{
              ...headingFont,
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: ESPRESSO_DEEP,
              lineHeight: 1.15,
            }}
          >
            Find the Work That Funds the Life You Want
          </h1>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: SLATE_SECONDARY }}
          >
            Five simple questions. Be honest. There are no wrong answers. You&apos;ll get 7 real
            paths matched to your skills, your values, and the life you&apos;re building.
          </p>

          <ProgressBar step={step} total={TOTAL_STEPS} />

          <div
            className="rounded-2xl p-6 md:p-8 mb-6"
            style={{ background: '#FFFFFF', border: CARD_BORDER }}
          >
            {renderStep()}
          </div>

          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80"
                style={{ color: SLATE }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <span />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={GOLD_BUTTON_STYLE}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-right">
                <button
                  type="button"
                  disabled={!canAdvance()}
                  onClick={submitQuiz}
                  className="px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  style={GOLD_BUTTON_STYLE}
                >
                  Show me my matches
                </button>
                <p
                  className="text-xs mt-2"
                  style={{ color: SLATE_TERTIARY }}
                >
                  Then run any match through a full feasibility &amp; saturation check
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
