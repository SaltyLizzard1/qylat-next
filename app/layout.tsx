import type { Metadata } from 'next';
import { Cormorant_Garamond, Cinzel } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from '@/lib/siteMetadata';
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

// Root metadata is the fallback for routes that declare nothing of their own.
// It deliberately carries no alternates.canonical and no openGraph.url. Both
// keys inherit into every child route that does not override them, which is
// how /story, /about, /faq and the result pages all shipped the homepage as
// their canonical. Each indexable route sets its own via lib/siteMetadata.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: 'digital nomad, quit your job, online business, remote work, location independence',
  authors: [{ name: 'Liz' }],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${cinzel.variable}`}>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <GoogleAnalytics gaId="G-XKZ53T022C" />
      </body>
    </html>
  );
}
