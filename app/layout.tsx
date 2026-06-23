import type { Metadata } from 'next';
import { Cormorant_Garamond, Cinzel } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';
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
  metadataBase: new URL('https://quityourlifeandtravel.com'),
  title: 'QYLAT — Quit Your Life and Travel',
  description: 'Real stories, tools, and coaching for women ready to quit corporate life, move abroad, and build location-independent income. From Florida to Thailand — in 60 days.',
  keywords: 'digital nomad, quit your job, online business, remote work, location independence',
  authors: [{ name: 'Liz' }],
  openGraph: {
    title: 'QYLAT — Quit Your Life and Travel',
    description: 'Real stories, tools, and coaching for women ready to quit corporate life, move abroad, and build location-independent income. From Florida to Thailand — in 60 days.',
    images: [process.env.NEXT_PUBLIC_IMG_HERO ?? '/images/rice-fields.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QYLAT — Quit Your Life and Travel',
    description: 'Real stories, tools, and coaching for women ready to quit corporate life, move abroad, and build location-independent income. From Florida to Thailand — in 60 days.',
    images: [process.env.NEXT_PUBLIC_IMG_HERO ?? '/images/rice-fields.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${cinzel.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <Script src="https://emrldtp.cc/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
