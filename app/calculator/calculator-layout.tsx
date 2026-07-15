import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leap Runway Calculator: How Much Do You Need to Move Abroad? | QYLAT',
  description:
    'Plug in your real numbers and see exactly how many months of runway you have to quit your life and travel. Free, instant, no email required.',
  alternates: {
    canonical: 'https://www.quityourlifeandtravel.com/calculator',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Leap Runway Calculator: How Much Do You Need to Move Abroad?',
    description:
      'Plug in your real numbers and see exactly how many months of runway you have to make the leap. Free and instant.',
    url: 'https://www.quityourlifeandtravel.com/calculator',
    siteName: 'Quit Your Life and Travel',
    images: [
      {
        url: 'https://www.quityourlifeandtravel.com/images/rice-fields.jpg',
        width: 1200,
        height: 630,
        alt: 'Rice fields in Thailand',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leap Runway Calculator: How Much Do You Need to Move Abroad?',
    description:
      'Plug in your real numbers and see exactly how many months of runway you have to make the leap. Free and instant.',
    images: ['https://www.quityourlifeandtravel.com/images/rice-fields.jpg'],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
