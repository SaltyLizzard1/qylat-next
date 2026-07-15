'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ShareButtons from '@/components/ShareButtons';
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
  'Autonomy — no boss',
  'Recognition & status',
  'Community & belonging',
];

const WORK_STYLE_PAIRS = [
  { a: 'People-facing', b: 'Behind the scenes' },
  { a: 'Structured schedule', b: 'Flexible hours' },
  { a: 'Solo deep work', b: 'Collaborative & team-based' },
  { a: 'Creating new things', b: 'Improving existing things' },
];

const HOURS_OPTIONS = ['<5', '5–10', '10–20', '20–30', '30+'];
const INCOME_OPTIONS = ['$500–$1,000', '$1,000–$2,500', '$2,500–$5,000', '$5,000–$10,000', '$10,000+'];

const LOADING_MESSAGES = [
  'Reading your skills and strengths...',
  'Mapping them to online work that fits your life...',
  'Checking which markets are crowded and which are open...',
  'Finding your unique angle in each one...',
  'Writing your personalised first steps...',
  'Almost there — putting it all together...',
];

const LOADING_DURATION_MS = 75000;

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

const GOLD_BUTTON_STYLE = {
  background: GOLD_GRADIENT,
  color: '#2D1A00',
  border: '1.5px solid #7A5C0A',
} as const;

const SATURATION_COLORS: Record<Match['saturation'], string> = {
  Low: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={[
        'px-4 py-2 rounded-full border text-sm font-medium transition-all',
        selected
          ? 'border-[#7A5C0A] shadow-sm bg-[#E8C84A] text-[#2D1A00]'
          : disabled
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white border-gray-300 text-gray-700 hover:border-[#C9A030] hover:text-[#8B6914]',
      ].join(' ')}
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
    return (
      <button
        type="button"
        onClick={() => onChange(label)}
        className={[
          'flex-1 py-5 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-center',
          active
            ? 'border-[#C9A030] bg-[#FBF6E4] text-[#5C4206] shadow'
            : 'border-gray-200 bg-white text-gray-600 hover:border-[#E8C84A]',
        ].join(' ')}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex gap-3 items-center">
      {card(optionA)}
      <span className="text-gray-400 text-xs font-bold shrink-0">OR</span>
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
        border: '1px solid #F0E6D2',
        boxShadow: '0 14px 34px rgba(30,20,5,0.09)',
      }}
    >
      <div style={{ height: '4px', background: GOLD_GRADIENT }} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1 block">
              {match.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900">
              {index + 1}. {match.title}
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 shrink-0 ${SATURATION_COLORS[match.saturation]}`}
          >
            {match.saturation} saturation
          </span>
        </div>

        <p className="text-gray-700 mb-3 leading-relaxed">{match.description}</p>

        <p className="text-sm italic border-l-2 border-[#C9A030] pl-4 mb-4" style={{ color: '#3A281A' }}>
          {match.whyYou}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Income range:</span>
          <span className="text-sm font-bold text-gray-800">{match.incomeRange}</span>
        </div>

        {match.uniqueAngle && (
          <div className="bg-[#FBF6E4] border border-[#EBD9A0] rounded-lg px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-[#8B6914] uppercase tracking-wide mb-1">Your unique angle</p>
            <p className="text-sm text-[#5C4206]">{match.uniqueAngle}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">First steps</p>
          <ol className="space-y-1">
            {match.firstSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="font-bold shrink-0" style={{ color: '#8B6914' }}>{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs text-gray-400 mt-3">{match.saturationNote}</p>
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%`, backgroundImage: GOLD_GRADIENT }}
      />
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

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [resultId, setResultId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stage !== 'loading') {
      setLoadingMsgIndex(0);
      setProgress(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, (elapsed / LOADING_DURATION_MS) * 95);
      setProgress(pct);
      const msgStep = LOADING_MESSAGES.length - 1;
      const idx = Math.min(
        msgStep,
        Math.floor((elapsed / LOADING_DURATION_MS) * msgStep)
      );
      setLoadingMsgIndex(idx);
    }, 200);
    return () => clearInterval(id);
  }, [stage]);

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
      setStage('results');
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
      await fetch('https://app.kit.com/forms/260ddc6f2c/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email.trim() }),
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Your hard skills</h2>
          <p className="text-gray-500 mb-6 text-sm">Select everything that applies — be generous.</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Your soft skills</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Pick your top 5.{' '}
            <span className="font-semibold" style={{ color: '#8B6914' }}>{form.softSkills.length}/5 selected</span>
          </p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">How you like to work</h2>
          <p className="text-gray-500 mb-6 text-sm">Pick one from each pair.</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">What matters most</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Pick your top 3.{' '}
            <span className="font-semibold" style={{ color: '#8B6914' }}>{form.values.length}/3 selected</span>
          </p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">The practical part</h2>
          <p className="text-gray-500 mb-6 text-sm">Realistic expectations make better matches.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
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
        <div className="relative overflow-hidden min-h-[calc(100vh-7rem)] flex items-center justify-center px-4" style={{ background: '#EBF0E6' }}>
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
            style={{ background: GOLD_GRADIENT }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: GOLD_GRADIENT }}
          />
          <div className="relative text-center max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 transition-all duration-500 min-h-[3.5rem] flex items-center justify-center">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%`, backgroundImage: GOLD_GRADIENT }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              This takes about 60–90 seconds — we&apos;re building something tailored to you
            </p>
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
    const shareText = `${'\u2728'} I took the 5-minute Discover Your Idea assessment. My top matches:\n${top3}\n${more}\n${'\u{1F4AB}'} Find yours:`;

    return (
      <>
        <Header />
        <div className="relative overflow-hidden min-h-screen" style={{ background: '#EBF0E6' }}>
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
            style={{ background: GOLD_GRADIENT }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: GOLD_GRADIENT }}
          />
          <div ref={topRef} className="relative max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: '#E8C84A' }} />
              <h1
                className="text-center"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 700,
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  color: '#3A281A',
                  lineHeight: 1.15,
                }}
              >
                My Business Matches
              </h1>
            </div>
            <p className="text-gray-500 mb-4 text-sm text-center">
              Based on your skills, values, and lifestyle goals — here are your top 7 paths.
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
                  <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 w-full max-w-md text-center border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Your #1 Match is {matches[0]?.title ?? 'ready'}. You are naturally wired for this.
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A030]"
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
                      <p className="mt-3 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!locked && (
              <div className="mt-10 rounded-2xl p-8 text-center border" style={{ background: '#FBF6E4', borderColor: '#EBD9A0' }}>
                <p className="text-lg font-bold mb-2" style={{ color: '#2D1A00' }}>
                  Ready to turn your top match into a real plan?
                </p>
                <p className="text-sm text-gray-600 mb-5">
                  This assessment is your entry point. IdeaToPlan — part of the same ecosystem —
                  turns your match into a clear, professional business plan.
                </p>
                <a
                  href="/#idea-to-plan"
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
      <div className="relative overflow-hidden min-h-screen" style={{ background: '#EBF0E6' }}>
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: GOLD_GRADIENT }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: GOLD_GRADIENT }}
        />
        <div ref={topRef} className="max-w-xl mx-auto px-4 py-10">
          <h1
            className="mb-2 text-center"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: '#3A281A',
              lineHeight: 1.15,
            }}
          >
            Find the Work That Funds the Life You Want
          </h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Five simple questions. Be honest — there are no wrong answers. You&apos;ll get 7 real
            paths matched to your skills, your values, and the life you&apos;re building.
          </p>

          <ProgressBar step={step} total={TOTAL_STEPS} />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            {renderStep()}
          </div>

          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
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
                <p className="text-xs text-gray-400 mt-2">
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