import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ShareButtons from '../../../components/ShareButtons';

const BASE_URL = 'https://www.quityourlifeandtravel.com';

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

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
      {/* Gold accent strip */}
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

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const canonicalUrl = `${BASE_URL}/results/${id}`;
  const title = 'My Business Matches | Quit Your Life and Travel';
  const description = 'See the business ideas this quiz matched — then discover yours in 5 minutes.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Quit Your Life and Travel',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('quiz_results')
    .select('matches')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const matches = (data.matches ?? []) as Match[];
  const canonicalUrl = `${BASE_URL}/results/${id}`;
  const shareText = `My top business match: ${matches[0]?.title ?? 'a new business idea'}. Find yours:`;

  return (
    <>
      <Header />

      {/* ── Dark hero band ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d0d0f 0%, #17140c 65%, #17140c 100%)',
          padding: '4rem 1.5rem 5rem',
        }}
      >
        {/* Radial gold glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '640px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(232,200,74,0.16) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Eyebrow */}
          <p
            className="mb-5 font-bold uppercase"
            style={{ color: '#C9A030', fontSize: '0.78rem', letterSpacing: '0.15em' }}
          >
            5-MINUTE ASSESSMENT · RESULTS
          </p>

          {/* H1 + Sparkles */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: '#E8C84A' }} />
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700,
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                color: '#FBF6E3',
                lineHeight: 1.15,
              }}
            >
              My Business Matches
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mb-8 text-sm" style={{ color: '#cfc9b8' }}>
            Results from the Discover Your Idea assessment
          </p>

          {/* Share buttons */}
          <ShareButtons url={canonicalUrl} title="My Business Matches" text={shareText} />
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ background: '#FAF7F0', paddingBottom: '4rem' }}>
        <div className="max-w-2xl mx-auto px-4" style={{ marginTop: '-2.75rem' }}>

          <div className="space-y-4">
            {matches.map((match, i) => (
              <MatchCard key={i} match={match} index={i} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl p-8 text-center border border-[#EBD9A0]" style={{ background: '#FBF6E4' }}>
            <p className="text-lg font-bold mb-2" style={{ color: '#3A281A' }}>
              Want your own matches?
            </p>
            <p className="text-sm text-gray-600 mb-5">
              Answer 5 quick questions and get 7 online work paths matched to your skills and lifestyle.
            </p>
            <a
              href="/assessment"
              className="inline-block px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
              style={{
                background: GOLD_GRADIENT,
                color: '#2D1A00',
                border: '1.5px solid #7A5C0A',
              }}
            >
              Start My Assessment →
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
