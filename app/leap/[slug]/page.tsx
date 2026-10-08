import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityClient, urlFor } from '@/lib/sanity';
import type { SanityPost } from '@/lib/useSanityPosts';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, type OgImage } from '@/lib/siteMetadata';
import { blogPosting, breadcrumbList, HOME_CRUMB, LEAP_LOG_CRUMB, type BlogPostingInput } from '@/lib/jsonLd';
import { findStaticPost } from '@/data/staticPosts';
import JsonLd from '../../../components/JsonLd';
import LeapPostClient from './LeapPostClient';

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
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

/**
 * One description of a post for both generateMetadata and the JSON-LD block,
 * resolved from Sanity first and the static registry second.
 */
type PostFacts = BlogPostingInput & { image: OgImage };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanityPostFacts(slug: string, raw: any): PostFacts {
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

  return {
    slug,
    title: raw.title,
    description: raw.excerpt || FALLBACK_DESC,
    imageUrl: image.url,
    image,
    datePublished: raw.publishedAt,
    dateModified: raw._updatedAt || raw.publishedAt,
    keywords: raw.tags?.length ? raw.tags : FALLBACK_KEYWORDS,
  };
}

function postFacts(slug: string, raw: unknown): PostFacts | null {
  if (raw) return sanityPostFacts(slug, raw);

  const staticPost = findStaticPost(slug);
  if (!staticPost) return null;

  return {
    slug,
    title: staticPost.title,
    description: staticPost.excerpt,
    imageUrl: DEFAULT_OG_IMAGE.url,
    image: DEFAULT_OG_IMAGE,
    datePublished: staticPost.publishedAt,
    dateModified: staticPost.publishedAt,
    keywords: FALLBACK_KEYWORDS,
  };
}

function postMetadata(post: PostFacts): Metadata {
  const canonical = `${SITE_URL}/leap/${post.slug}`;
  const fullTitle = `${post.title} | QYLAT`;

  return {
    title: fullTitle,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: 'Liz' }],
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: post.description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: ['Liz'],
      images: [post.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: post.description,
      images: [post.image],
    },
  };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = postFacts(slug, await fetchPost(slug));

  if (!post) {
    return {
      title: 'Post Not Found | QYLAT',
      robots: { index: false, follow: false },
    };
  }

  return postMetadata(post);
}

export default async function LeapPostPage({ params }: Props) {
  const { slug } = await params;
  const raw = await fetchPost(slug);
  const post = postFacts(slug, raw);

  // Unknown slug: a real 404, not a loading shell that redirects client-side.
  if (!post) notFound();

  const initialPost = raw ? toSanityPost(raw) : null;

  return (
    <>
      <JsonLd
        data={[
          blogPosting(post),
          breadcrumbList([HOME_CRUMB, LEAP_LOG_CRUMB, { name: post.title, path: `/leap/${slug}` }]),
        ]}
      />
      <LeapPostClient slug={slug} initialPost={initialPost} />
    </>
  );
}
