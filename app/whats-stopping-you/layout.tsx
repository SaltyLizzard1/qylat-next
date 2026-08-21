import type { Metadata } from 'next';

const TITLE = "What's Stopping You | Quit Your Life and Travel";
const DESCRIPTION =
  'Sixteen questions across four dimensions. Find the one thing standing between you and the leap, and see the next move that fits it. Free. Takes about five minutes.';
const CANONICAL = 'https://www.quityourlifeandtravel.com/whats-stopping-you';
const OG_IMAGE = 'https://www.quityourlifeandtravel.com/images/og-default.jpg';
const OG_ALT = "What's Stopping You, a free readiness test";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: 'Quit Your Life and Travel',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: OG_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function LeapTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
