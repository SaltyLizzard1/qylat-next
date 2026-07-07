import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | Quit Your Life and Travel',
  description: 'Thanks for reaching out. You\'ll hear back soon.',
  alternates: {
    canonical: 'https://www.quityourlifeandtravel.com/thank-you',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
