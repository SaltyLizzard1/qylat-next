import type { Metadata } from 'next';

export const SITE_URL = 'https://www.quityourlifeandtravel.com';
export const SITE_NAME = 'Quit Your Life and Travel';
export const SITE_TITLE = 'How to Move Abroad and Build a Location-Independent Life | QYLAT';
export const SITE_DESCRIPTION =
  "Your mind tells you too old, too broke, too scared. It's lying. The life you've always wanted is there, waiting for you. Here's how to build it.";

export type OgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export const DEFAULT_OG_IMAGE: OgImage = {
  url: `${SITE_URL}/images/og-default.jpg`,
  width: 1200,
  height: 630,
  alt: 'Rice terraces at sunset in northern Thailand',
};

type PageMetadataInput = {
  title: string;
  description: string;
  /** Route path starting with a slash. Use '/' for the homepage. */
  path: string;
  image?: OgImage;
  type?: 'website' | 'article';
  robots?: Metadata['robots'];
};

/**
 * Builds a complete Metadata object for one route: title, description,
 * canonical, openGraph with its own images array, and twitter.
 *
 * Next.js merges metadata shallowly. A route that sets openGraph or twitter
 * replaces the root block entirely and silently drops the inherited image,
 * and a route that sets nothing inherits whatever the root declares. Going
 * through this helper keeps every route whole and self-contained.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  robots,
}: PageMetadataInput): Metadata {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(robots ? { robots } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
