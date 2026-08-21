'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { QUESTIONS } from '../../lib/leapTest';

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';
const ESPRESSO = '#3A281A';
const ESPRESSO_DEEP = '#2D1A00';
const PALE_SAGE = '#EBF0E6';
const CREAM = '#FBF6E3';
const SLATE = '#2C3340';

const headingFont: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 700,
};

const TOTAL_QUESTIONS = QUESTIONS.length;
// Hold the selected state briefly so the user sees which option registered
// before the flow advances. Short enough to feel snappy, long enough that
// the confirmation is legible.
const ADVANCE_DELAY_MS = 250;

export default function LeapTestPage() {
  const router = useRouter();
  // topRef targets the outer container top, so scrollIntoView keeps the
  // eyebrow and progress bar visible above the card. Once the intro
  // collapses after question 1, the container top is the eyebrow itself,
  // which is the correct landing point for questions 2 through 16.
  const topRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const advanceTimerRef = useRef<number | null>(null);
  const isAdvancingRef = useRef(false);

  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => null)
  );
  // Parallel to answers, but holds the picked option index. Selection state
  // must track the index rather than the score, because two options for the
  // same question can share a score (a deliberate design choice for some
  // questions) and comparing by score would highlight both at once.
  const [selectedIndices, setSelectedIndices] = useState<(number | null)[]>(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => null)
  );
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Clear any pending advance on unmount to avoid a setState after navigation.
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Skip the scroll on step 0: the page is already at the top on arrival
    // and there is nothing above to scroll into view.
    if (step === 0) return;
    topRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [step, reduceMotion]);

  const isLastPosition = step === TOTAL_QUESTIONS - 1;
  const isFirstPosition = step === 0;

  // Progress reads from step, not answered count, because Back diverges the two.
  const progressPct = Math.round(((step + 1) / TOTAL_QUESTIONS) * 100);

  const submit = useCallback(
    async (finalAnswers: (number | null)[]) => {
      setSubmitting(true);
      setError('');
      try {
        const res = await fetch('/api/leap-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: finalAnswers }),
        });

        if (!res.ok) {
          setError('Something went wrong scoring your result. Please try again.');
          setSubmitting(false);
          isAdvancingRef.current = false;
          return;
        }

        const data = (await res.json()) as { id?: string };
        if (!data.id) {
          setError('Something went wrong saving your result. Please try again.');
          setSubmitting(false);
          isAdvancingRef.current = false;
          return;
        }

        router.push(`/whats-stopping-you/result/${data.id}`);
      } catch {
        setError('Something went wrong. Please try again.');
        setSubmitting(false);
        isAdvancingRef.current = false;
      }
    },
    [router]
  );

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (isAdvancingRef.current || submitting) return;
      isAdvancingRef.current = true;
      setError('');

      const score = QUESTIONS[step].options[optionIndex].score;

      const newAnswers = [...answers];
      newAnswers[step] = score;
      setAnswers(newAnswers);

      const newIndices = [...selectedIndices];
      newIndices[step] = optionIndex;
      setSelectedIndices(newIndices);

      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;
        if (isLastPosition) {
          // Leave isAdvancingRef true; submit clears it on error and the
          // successful path unmounts the page, so clearing there is moot.
          void submit(newAnswers);
        } else {
          setStep((s) => s + 1);
          isAdvancingRef.current = false;
        }
      }, ADVANCE_DELAY_MS);
    },
    [answers, selectedIndices, step, isLastPosition, submitting, submit]
  );

  const handleBack = useCallback(() => {
    if (submitting) return;
    // Cancel any queued advance so a rapid Back during the hold does not fire.
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    isAdvancingRef.current = false;
    setError('');
    setStep((s) => Math.max(0, s - 1));
  }, [submitting]);

  const cardTransition = {
    duration: reduceMotion ? 0 : 0.22,
    ease: 'easeOut' as const,
  };

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

        <div
          ref={topRef}
          className="relative max-w-xl md:max-w-2xl mx-auto px-4 pt-6 pb-12 scroll-mt-28"
        >
          <p
            className="text-center mb-2 font-bold uppercase"
            style={{ color: '#8B6914', fontSize: '0.72rem', letterSpacing: '0.18em' }}
          >
            WHAT&apos;S STOPPING YOU
          </p>

          {/* Headline and subline collapse after question 1. They set
              expectations on the opening screen and become dead weight for
              the fifteen questions after it. */}
          <AnimatePresence initial={false}>
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={cardTransition}
                style={{ overflow: 'hidden' }}
              >
                <h1
                  className="mb-3 text-center"
                  style={{
                    ...headingFont,
                    color: ESPRESSO_DEEP,
                    fontSize: 'clamp(1.35rem, 5vw, 2.4rem)',
                    lineHeight: 1.15,
                  }}
                >
                  Find the one thing standing between you and the leap
                </h1>
                <p
                  className="text-center mb-6"
                  style={{ color: SLATE, fontSize: '0.95rem', lineHeight: 1.5 }}
                >
                  Sixteen honest questions. Free result, no email needed. About five minutes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="mb-2 flex items-center justify-between text-xs"
            style={{ color: ESPRESSO }}
          >
            <span>
              Question {step + 1} of {TOTAL_QUESTIONS}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div
            className="w-full rounded-full h-1.5 mb-6"
            style={{ background: 'rgba(58,40,26,0.12)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: GOLD_GRADIENT }}
            />
          </div>

          <div
            className="rounded-2xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(58,40,26,0.12)',
              padding: '1.5rem 1.25rem',
              minHeight: '240px',
              overflow: 'hidden',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {submitting ? (
                <motion.div
                  key="scoring"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -20 }}
                  transition={cardTransition}
                >
                  <ScoringState reduceMotion={reduceMotion} />
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -20 }}
                  transition={cardTransition}
                >
                  <QuestionBlock
                    index={step}
                    selectedIndex={selectedIndices[step]}
                    onSelect={handleSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <p
              className="mt-4 text-sm text-center rounded-lg px-4 py-2"
              style={{
                color: '#7a2f2f',
                background: 'rgba(200, 80, 80, 0.08)',
                border: '1px solid rgba(200, 80, 80, 0.2)',
              }}
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            {!isFirstPosition && !submitting ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80"
                style={{ color: SLATE }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <span />
            )}
            <span />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function QuestionBlock({
  index,
  selectedIndex,
  onSelect,
}: {
  index: number;
  selectedIndex: number | null;
  onSelect: (optionIndex: number) => void;
}) {
  const q = QUESTIONS[index];
  return (
    <div>
      <p
        className="mb-4"
        style={{
          color: ESPRESSO_DEEP,
          fontSize: '1.05rem',
          fontWeight: 600,
          lineHeight: 1.35,
        }}
      >
        <span
          style={{
            color: '#8B6914',
            fontWeight: 700,
            marginRight: '0.4rem',
          }}
        >
          {index + 1}.
        </span>
        {q.prompt}
      </p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, optIndex) => {
          const isSelected = selectedIndex === optIndex;
          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => onSelect(optIndex)}
              className="text-left px-4 py-3 rounded-lg transition-all"
              style={{
                background: isSelected ? CREAM : '#FFFFFF',
                border: isSelected
                  ? '1.5px solid #C9A030'
                  : '1px solid rgba(58,40,26,0.18)',
                color: isSelected ? ESPRESSO_DEEP : SLATE,
                fontSize: '0.94rem',
                lineHeight: 1.4,
                fontWeight: isSelected ? 600 : 500,
                boxShadow: isSelected ? '0 2px 10px rgba(201,160,48,0.18)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoringState({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: '320px', padding: '2rem 1rem' }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid rgba(201,160,48,0.25)',
          borderTopColor: '#C9A030',
          animation: reduceMotion ? 'none' : 'qyl-spin 0.9s linear infinite',
          marginBottom: '1.25rem',
        }}
      />
      <p
        style={{
          ...headingFont,
          color: ESPRESSO_DEEP,
          fontSize: '1.6rem',
          marginBottom: '0.35rem',
        }}
      >
        Scoring your result
      </p>
      <p style={{ color: SLATE, fontSize: '0.95rem' }}>This takes a second.</p>
      <style>{`
        @keyframes qyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
