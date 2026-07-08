import { cache } from 'react';
import type { Metadata } from 'next';
import { sanityClient, urlFor } from '@/lib/sanity';
import type { SanityPost } from '@/lib/useSanityPosts';
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
  'Real stories from the road — quitting corporate life to build a location-independent life abroad.';
const FALLBACK_IMAGE = 'https://www.quityourlifeandtravel.com/images/rice-fields.jpg';
const FALLBACK_KEYWORDS = ['digital nomad', 'move abroad', 'location independence', 'quit corporate job'];

// Deduplicated within a single request — generateMetadata and the page share one fetch
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
    heroFit: raw.heroFit === 'contain' ? 'contain' : 'cover',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery.map((img: any) => ({
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

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = await fetchPost(slug);

  if (!raw) {
    return { title: 'Post Not Found | QYLAT' };
  }

  const title = `${raw.title} | QYLAT`;
  const description = raw.excerpt || FALLBACK_DESC;
  const ogImage = raw.heroImage
    ? urlFor(raw.heroImage).width(1200).height(630).url()
    : FALLBACK_IMAGE;

  return {
    title,
    description,
    keywords: raw.tags?.length ? raw.tags : FALLBACK_KEYWORDS,
    authors: [{ name: 'Liz' }],
    alternates: {
      canonical: `https://www.quityourlifeandtravel.com/leap/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: 'article',
      publishedTime: raw.publishedAt,
      authors: ['Liz'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LeapPostPage({ params }: Props) {
  const { slug } = await params;
  const raw = await fetchPost(slug);
  const initialPost = raw ? toSanityPost(raw) : null;
  return <LeapPostClient slug={slug} initialPost={initialPost} />;
}
