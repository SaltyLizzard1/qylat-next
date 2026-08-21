import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '../../../../lib/supabase';
import { ARCHETYPE_COPY, type Archetype, type Scores } from '../../../../lib/leapTest';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import LeapTestResult from '../../../../components/LeapTestResult';

const BASE_URL = 'https://www.quityourlifeandtravel.com';

type Props = { params: Promise<{ id: string }> };

async function loadResult(
  id: string
): Promise<{ scores: Scores; archetype: Archetype } | null> {
  const { data, error } = await supabase
    .from('leap_test_results')
    .select('scores, archetype')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const scores = data.scores as Scores | null;
  const archetype = data.archetype as Archetype | null;
  if (!scores || !archetype || !(archetype in ARCHETYPE_COPY)) return null;

  return { scores, archetype };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const canonicalUrl = `${BASE_URL}/whats-stopping-you/result/${id}`;

  const result = await loadResult(id);
  const archetypeName = result ? ARCHETYPE_COPY[result.archetype].name : "What's Stopping You";

  const title = `${archetypeName} | What's Stopping You`;
  const description = result
    ? `${ARCHETYPE_COPY[result.archetype].bottleneckLine} Find out what's stopping you.`
    : 'Sixteen honest questions. Find the one thing standing between you and the leap.';

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Quit Your Life and Travel',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LeapTestResultPage({ params }: Props) {
  const { id } = await params;

  const result = await loadResult(id);
  if (!result) notFound();

  return (
    <>
      <Header />
      <LeapTestResult
        scores={result.scores}
        archetype={result.archetype}
        id={id}
        shareOrigin={BASE_URL}
      />
      <Footer />
    </>
  );
}
