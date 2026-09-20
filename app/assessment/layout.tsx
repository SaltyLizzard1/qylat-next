import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Find Your Location-Independent Career Path | QYLAT',
  description:
    'Answer 5 questions and get 7 real online income paths matched to your skills, values, and lifestyle. Free. Takes 2 minutes.',
  path: '/assessment',
  robots: { index: true, follow: true },
});

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
