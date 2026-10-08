import type { Metadata } from 'next';
import JsonLd from '../../components/JsonLd';
import { breadcrumbList, HOME_CRUMB } from '@/lib/jsonLd';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Find Your Location-Independent Career Path | QYLAT',
  description:
    'Answer 5 questions and get 7 real online income paths matched to your skills, values, and lifestyle. Free. Takes 2 minutes.',
  path: '/assessment',
  robots: { index: true, follow: true },
});

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbList([HOME_CRUMB, { name: 'Discover Your Idea', path: '/assessment' }])} />
      {children}
    </>
  );
}
