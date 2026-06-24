import type { Metadata } from 'next';
import { sanityClient, urlFor } from '@/lib/sanity';
import LeapPostClient from './LeapPostClient';

const META_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  title,
  excerpt,
  heroImage,
  publishedAt,
  tags
}`;

const FALLBACK_DESC =
  'Real stories from the road — quitting corporate life to build a location-independent life abroad.';
const FALLBACK_IMAGE = 'https://www.quityourlifeandtravel.com/images/rice-fields.jpg';
const FALLBACK_KEYWORDS = ['digital nomad', 'move abroad', 'location independence', 'quit corporate job'];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityClient.fetch(META_QUERY, { slug });

  if (!post) {
    return { title: 'Post Not Found | QYLAT' };
  }

  const title = `${post.title} | QYLAT`;
  const description = post.excerpt || FALLBACK_DESC;
  const ogImage = post.heroImage
    ? urlFor(post.heroImage).width(1200).height(630).url()
    : FALLBACK_IMAGE;

  return {
    title,
    description,
    keywords: post.tags?.length ? post.tags : FALLBACK_KEYWORDS,
    authors: [{ name: 'Liz' }],
    alternates: {
      canonical: `https://www.quityourlifeandtravel.com/leap/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: 'article',
      publishedTime: post.publishedAt,
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
  return <LeapPostClient slug={slug} />;
}
