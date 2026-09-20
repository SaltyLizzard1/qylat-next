import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient, urlFor } from '@/lib/sanity';
import type { SanityPost } from '@/lib/useSanityPosts';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, type OgImage } from '@/lib/siteMetadata';
import { findStaticPost } from '@/data/staticPosts';
import LeapPostClient from './LeapPostClient';

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  postType,
  excerpt,
  heroImage,
  heroFit,
  body,
  publishedAt,
  featured,
  tags,
  gallery[] { asset->, caption },
  category-> { title, "slug": slug.current }
}`;

const FALLBACK_DESC =
  'Real stories from the road: quitting corporate life to build a location-independent life abroad.';
const FALLBACK_KEYWORDS = ['digital nomad', 'move abroad', 'location independence', 'quit corporate job'];

// Deduplicated within a single request: generateMetadata and the page share one fetch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchPost = cache((slug: string) => sanityClient.fetch<any>(POST_QUERY, { slug }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSanityPost(raw: any): SanityPost {
  return {
    _id: raw._id,
    title: raw.title,
    slug: raw.slug,
    postType: (raw.postType as SanityPost['postType']) || 'blog',
    excerpt: raw.excerpt || '',
    heroImageUrl: raw.heroImage ? urlFor(raw.heroImage).width(800).url() : null,
    heroCardUrl: null,
    heroFit: raw.heroFit === 'contain' ? 'contain' : 'cover',
    gallery: Array.isArray(raw.gallery)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.gallery.map((img: any) => ({
          url: urlFor(img).width(800).url(),
          caption: (img.caption as string) || undefined,
        }))
      : [],
    body: raw.body || [],
    publishedAt: raw.publishedAt,
    featured: raw.featured || false,
    tags: raw.tags || [],
    category: raw.category || null,
  };
}

type PostMetadataInput = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  keywords: string[];
  image: OgImage;
};

function postMetadata({ slug, title, description, publishedAt, keywords, image }: PostMetadataInput): Metadata {
  const canonical = `${SITE_URL}/leap/${slug}`;
  const fullTitle = `${title} | QYLAT`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: 'Liz' }],
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: publishedAt,
      authors: ['Liz'],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await fetchPost(slug);

  if (raw) {
    // fit('crop') forces the exact 1200x630 frame so the declared dimensions
    // are true. Without it Sanity clips to the bounding box and a 4:3 hero
    // would come back 840x630.
    const image: OgImage = raw.heroImage
      ? {
          url: urlFor(raw.heroImage).width(1200).height(630).fit('crop').url(),
          width: 1200,
          height: 630,
          alt: raw.title as string,
        }
      : DEFAULT_OG_IMAGE;

    return postMetadata({
      slug,
      title: raw.title,
      description: raw.excerpt || FALLBACK_DESC,
      publishedAt: raw.publishedAt,
      keywords: raw.tags?.length ? raw.tags : FALLBACK_KEYWORDS,
      image,
    });
  }

  const staticPost = findStaticPost(slug);
  if (staticPost) {
    return postMetadata({
      slug,
      title: staticPost.title,
      description: staticPost.excerpt,
      publishedAt: staticPost.publishedAt,
      keywords: FALLBACK_KEYWORDS,
      image: DEFAULT_OG_IMAGE,
    });
  }

  return {
    title: 'Post Not Found | QYLAT',
    robots: { index: false, follow: false },
  };
}

export default async function LeapPostPage({ params }: Props) {
  const { slug } = await params;
  const raw = await fetchPost(slug);

  // Unknown slug: a real 404, not a loading shell that redirects client-side.
  if (!raw && !findStaticPost(slug)) notFound();

  const initialPost = raw ? toSanityPost(raw) : null;
  return <LeapPostClient slug={slug} initialPost={initialPost} />;
}
