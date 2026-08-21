'use client';

import { useState } from 'react';
import ShareButtons from './ShareButtons';

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

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

const GOLD_BUTTON_STYLE = {
  background: GOLD_GRADIENT,
  color: '#2D1A00',
  border: '1.5px solid #2D1A00',
} as const;

const SATURATION_COLORS: Record<string, string> = {
  Low: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
};

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
          {match.saturation && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 shrink-0 ${SATURATION_COLORS[match.saturation] ?? 'bg-gray-100 text-gray-700'}`}>
              {match.saturation} saturation
            </span>
          )}
        </div>

        <p className="text-gray-700 mb-3 leading-relaxed">{match.description}</p>

        {match.whyYou && (
          <p className="text-sm italic border-l-2 border-[#C9A030] pl-4 mb-4" style={{ color: '#3A281A' }}>
            {match.whyYou}
          </p>
        )}

        {match.incomeRange && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Income range:</span>
            <span className="text-sm font-bold text-gray-800">{match.incomeRange}</span>
          </div>
        )}

        {match.uniqueAngle && (
          <div className="bg-[#FBF6E4] border border-[#EBD9A0] rounded-lg px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-[#8B6914] uppercase tracking-wide mb-1">Your unique angle</p>
            <p className="text-sm text-[#5C4206]">{match.uniqueAngle}</p>
          </div>
        )}

        {Array.isArray(match.firstSteps) && match.firstSteps.length > 0 && (
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
        )}

        {match.saturationNote && (
          <p className="text-xs text-gray-400 mt-3">{match.saturationNote}</p>
        )}
      </div>
    </div>
  );
}

export default function ResultsGate({ matches, canonicalUrl }: { matches: Match[]; canonicalUrl: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

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
      setUnlocked(true);
    } catch (err) {
      console.error('Email error:', err);
      setEmailError('Something went wrong. Try again.');
    } finally {
      setEmailLoading(false);
    }
  }

  const top3 = matches.slice(0, 3).map((m, i) => `${i + 1}. ${m.title}`).join('\n');
  const more = matches.length > 3 ? `…and ${matches.length - 3} more.` : '';
  const shareText = `${'✨'} I took the 5-minute Discover Your Idea assessment. My top matches:\n${top3}\n${more}\n${'\u{1F4AB}'} Find yours:`;

  return (
    <>
      <div className="mb-4">
        <MatchCard match={matches[0]} index={0} />
      </div>

      <div className="relative">
        <div className={unlocked ? '' : 'blur-sm select-none pointer-events-none'}>
          <div className="space-y-4">
            {matches.slice(1).map((match, i) => (
              <MatchCard key={i} match={match} index={i + 1} />
            ))}
          </div>
        </div>

        {!unlocked && (
          <div className="absolute inset-0 flex items-start justify-center pt-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 w-full max-w-md text-center border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Someone shared their matches with you
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                Their #1 match is above. Curious what you&apos;re built to do?
              </p>
              <a
                href="/assessment"
                className="block w-full py-3 font-semibold rounded-lg transition-all hover:brightness-105 mb-4"
                style={GOLD_BUTTON_STYLE}
              >
                Take the Free Assessment →
              </a>
              <p className="text-xs text-gray-500 mb-3">
                Or enter your email to see the rest of their matches:
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
                  {emailLoading ? 'Revealing...' : 'Reveal their matches'}
                </button>
              </form>
              {emailError && (
                <p className="mt-3 text-sm text-red-600">{emailError}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {unlocked && (
        <div className="mt-8 flex justify-center">
          <ShareButtons url={canonicalUrl} title="My Business Matches" text={shareText} />
        </div>
      )}
    </>
  );
}
