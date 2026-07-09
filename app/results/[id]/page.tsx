import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
        <p className="text-sm italic text-emerald-700 mb-4 bg-emerald-50 rounded-lg px-4 py-2">
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
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'My Business Matches | Quit Your Life and Travel',
    description: 'See the business ideas this quiz matched — then discover yours in 5 minutes.',
  };
}

type Props = { params: Promise<{ id: string }> };

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

  const GOLD_GRADIENT =
    'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)';

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
        <div className="relative max-w-2xl mx-auto px-4 py-10">
          <h1
            className="mb-1"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: '#2D5016',
              lineHeight: 1.15,
            }}
          >
            My Business Matches
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Results from the Discover Your Idea quiz
          </p>

          <div className="space-y-4">
            {matches.map((match, i) => (
              <MatchCard key={i} match={match} index={i} />
            ))}
          </div>

          <div className="mt-10 bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-100">
            <p className="text-lg font-bold text-emerald-900 mb-2">
              Want your own matches?
            </p>
            <p className="text-sm text-gray-600 mb-5">
              Answer 5 quick questions and get 7 online work paths matched to your skills and lifestyle.
            </p>
            <a
              href="/quiz"
              className="inline-block px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
              style={{
                background: GOLD_GRADIENT,
                color: '#2D1A00',
                border: '1.5px solid #7A5C0A',
              }}
            >
              Take the free quiz
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
