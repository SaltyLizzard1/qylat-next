import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome | Quit Your Life and Travel',
  description: 'You\'re in. Check your inbox for your first step toward the leap.',
  alternates: {
    canonical: 'https://www.quityourlifeandtravel.com/welcome',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
