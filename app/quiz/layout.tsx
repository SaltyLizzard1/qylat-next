import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Your Location-Independent Career Path | QYLAT',
  description:
    'Answer 5 questions and get 7 real online income paths matched to your skills, values, and lifestyle. Free. Takes 2 minutes.',
  alternates: {
    canonical: 'https://www.quityourlifeandtravel.com/quiz',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
