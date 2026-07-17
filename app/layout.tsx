import type { Metadata } from 'next';
import { Cormorant_Garamond, Cinzel } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const cormorant = Cormorant_Garamond({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const cinzel = Cinzel({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.quityourlifeandtravel.com'),
  alternates: {
    canonical: 'https://www.quityourlifeandtravel.com',
  },
  title: 'How to Move Abroad and Build a Location-Independent Life | QYLAT',
  description: 'Your mind tells you too old, too broke, too scared. It\'s lying. The life you\'ve always wanted is there, waiting for you. Here\'s how to build it.',
  keywords: 'digital nomad, quit your job, online business, remote work, location independence',
  authors: [{ name: 'Liz' }],
  openGraph: {
    title: 'How to Move Abroad and Build a Location-Independent Life | QYLAT',
    description: 'Your mind tells you too old, too broke, too scared. It\'s lying. The life you\'ve always wanted is there, waiting for you. Here\'s how to build it.',
    images: ['https://www.quityourlifeandtravel.com/images/rice-fields.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Move Abroad and Build a Location-Independent Life | QYLAT',
    description: 'Your mind tells you too old, too broke, too scared. It\'s lying. The life you\'ve always wanted is there, waiting for you. Here\'s how to build it.',
    images: ['https://www.quityourlifeandtravel.com/images/rice-fields.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${cinzel.variable}`}>
      <head>
        <link
          rel="preload"
          as="image"
          href={process.env.NEXT_PUBLIC_IMG_HERO ?? '/images/rice-fields.jpg'}
          fetchPriority="high"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
