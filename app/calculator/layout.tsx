import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leap Runway Calculator | Quit Your Life and Travel',
  description:
    'Plug in your real numbers and find out exactly how many months of runway you have. Free. No email required.',
  alternates: {
    canonical: 'https://www.quityourlifeandtravel.com/calculator',
  },
  openGraph: {
    title: 'Leap Runway Calculator | Quit Your Life and Travel',
    description:
      'Plug in your real numbers and find out exactly how many months of runway you have. Free. No email required.',
    url: 'https://www.quityourlifeandtravel.com/calculator',
    siteName: 'Quit Your Life and Travel',
    type: 'website',
    images: [
      {
        url: 'https://www.quityourlifeandtravel.com/images/rice-fields.jpg',
        width: 640,
        height: 640,
        alt: 'Rice fields in Thailand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leap Runway Calculator | Quit Your Life and Travel',
    description:
      'Plug in your real numbers and find out exactly how many months of runway you have. Free. No email required.',
    images: ['https://www.quityourlifeandtravel.com/images/rice-fields.jpg'],
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
