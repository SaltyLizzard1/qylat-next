import { NextResponse } from 'next/server';
import { sanityClient, urlFor } from '@/lib/sanity';

export const revalidate = 60

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  postType,
  excerpt,
  heroImage,
  gallery[] {
    asset->,
    caption
  },
  body,
  publishedAt,
  featured,
  tags,
  category-> {
    title,
    "slug": slug.current
  }
}`;

export async function GET() {
  try {
    const data: Record<string, unknown>[] = await sanityClient.fetch(
      POSTS_QUERY,
      {},
      { next: { revalidate: 3600 } }
    );

    const posts = data.map((post) => ({
      _id: post._id as string,
      title: post.title as string,
      slug: post.slug as string,
      postType: (post.postType as string) || 'blog',
      excerpt: (post.excerpt as string) || '',
      heroImageUrl: post.heroImage
        ? urlFor(post.heroImage).width(800).url()
        : null,
      gallery: Array.isArray(post.gallery)
        ? post.gallery.map((img: Record<string, unknown>) => ({
            url: urlFor(img).width(800).url(),
            caption: (img.caption as string) || undefined,
          }))
        : [],
      body: post.body || [],
      publishedAt: post.publishedAt as string,
      featured: (post.featured as boolean) || false,
      tags: (post.tags as string[]) || [],
      category: post.category as { title: string; slug: string } | null,
    }));

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Sanity fetch error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
