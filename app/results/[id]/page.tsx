import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ResultsGate from '../../../components/ResultsGate';

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

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const canonicalUrl = `${BASE_URL}/results/${id}`;
  const title = 'My Business Matches | Quit Your Life and Travel';
  const description = 'See the business ideas this assessment matched — then discover yours in 5 minutes.';

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

  return (
    <>
      <Header />

      {/* ── Dark hero band ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d0d0f 0%, #17140c 65%, #17140c 100%)',
          padding: '4rem 1.5rem 2.5rem',
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
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ background: '#FAF7F0', paddingBottom: '4rem' }}>
        <div className="max-w-2xl mx-auto px-4" style={{ marginTop: '-2.75rem' }}>

          <ResultsGate matches={matches} canonicalUrl={canonicalUrl} />

          <div className="mt-10 rounded-2xl p-8 text-center border border-[#EBD9A0]" style={{ background: '#FBF6E4' }}>
            <p className="text-lg font-bold mb-2" style={{ color: '#3A281A' }}>
              Want your own matches?
            </p>
            <p className="text-sm text-gray-600 mb-5">
              Answer five simple questions and discover the paths that best match your skills, values, and goals.
            </p>
            <a
              href="/assessment"
              className="inline-block px-8 py-3 font-semibold rounded-lg transition-all hover:brightness-105"
              style={{
                background: GOLD_GRADIENT,
                color: '#2D1A00',
                border: '1.5px solid #2D1A00',
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
