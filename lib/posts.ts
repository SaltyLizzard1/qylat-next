import { sanityClient, urlFor } from './sanity';
import { STATIC_POSTS } from '../data/staticPosts';

/**
 * Server-side Leap Log list. app/page.tsx calls this so the homepage HTML
 * carries a real link to every post. The previous client-side fetch went
 * through /api/posts, which robots.txt disallows, so crawlers saw an empty
 * Leap Log and posts were discoverable only through the sitemap.
 *
 * Plain data only: this shape crosses the server/client boundary as a prop.
 */
export type LeapLogPost = {
  slug: string;
  title: string;
  /** Display date, e.g. "March 15, 2026". Formatted here so server and client agree. */
  date: string;
  /** ISO date from Sanity, or the static registry. */
  publishedAt: string;
  excerpt: string;
  image: string | null;
  postType: 'blog' | 'discussion' | 'photo-essay';
  /** False when a Sanity post has no body yet; the card shows "Coming soon" and no link. */
  hasContent: boolean;
};

const LIST_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  postType,
  excerpt,
  heroImage,
  publishedAt,
  "hasBody": count(coalesce(body, [])) > 0
}`;

const PINNED_SLUG = 'how-to-move-to-thailand-in-60-days';

type RawListPost = {
  title: string;
  slug: string;
  postType?: string;
  excerpt?: string;
  heroImage?: unknown;
  publishedAt?: string;
  hasBody?: boolean;
};

export function formatPostDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function toPostType(value: string | undefined): LeapLogPost['postType'] {
  return value === 'discussion' || value === 'photo-essay' ? value : 'blog';
}

/**
 * Sanity posts first, then any static post whose slug Sanity does not own.
 * Pinned post leads, the rest sort newest first. Revalidates hourly, matching
 * the sitemap, so a new post shows up within the hour without a deploy.
 * A Sanity failure throws: at build time that fails the build loudly, and on
 * an ISR revalidation Next keeps serving the last good page.
 */
export async function getLeapLogPosts(): Promise<LeapLogPost[]> {
  const raw: RawListPost[] = await sanityClient.fetch(
    LIST_QUERY,
    {},
    { next: { revalidate: 3600 } }
  );

  const sanityPosts: LeapLogPost[] = raw.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: formatPostDate(post.publishedAt ?? ''),
    publishedAt: post.publishedAt ?? '',
    excerpt: post.excerpt ?? '',
    image: post.heroImage ? urlFor(post.heroImage).width(800).height(600).fit('crop').url() : null,
    postType: toPostType(post.postType),
    hasContent: Boolean(post.hasBody),
  }));

  const sanitySlugs = new Set(sanityPosts.map((post) => post.slug));

  const staticPosts: LeapLogPost[] = STATIC_POSTS.filter((post) => !sanitySlugs.has(post.slug)).map(
    (post) => ({
      slug: post.slug,
      title: post.title,
      date: formatPostDate(post.publishedAt),
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
      image: post.image,
      postType: 'blog',
      hasContent: true,
    })
  );

  return [...sanityPosts, ...staticPosts].sort((a, b) => {
    if (a.slug === PINNED_SLUG) return -1;
    if (b.slug === PINNED_SLUG) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
