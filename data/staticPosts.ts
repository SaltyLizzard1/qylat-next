import { images } from '../config/images';

/**
 * Server-safe metadata for posts that live in data/posts.tsx rather than in
 * Sanity. data/posts.tsx imports React hooks, so a server component cannot
 * import it without failing the build. app/leap/[slug]/page.tsx reads this
 * registry instead, to decide between rendering and a 404 and to build the
 * post's metadata. The render function stays in data/posts.tsx and spreads
 * these fields, so there is one source for slug, title, date and excerpt.
 */
export type StaticPostMeta = {
  id: number;
  slug: string;
  title: string;
  /** Display date shown on the card and the post header. */
  date: string;
  /** ISO date for metadata and structured data. */
  publishedAt: string;
  excerpt: string;
  image: string;
};

export const SIXTY_DAY_POST: StaticPostMeta = {
  id: 3,
  slug: 'how-to-move-to-thailand-in-60-days',
  title: 'How to Move to Thailand in 60 Days',
  date: 'March 15, 2026',
  publishedAt: '2026-03-15',
  excerpt:
    "The second leap is harder than the first. Here's the exact 60-day plan I'm following - packing, visa, banking, and every task from first sort to final keys.",
  image: images.sixtyDay,
};

export const STATIC_POSTS: StaticPostMeta[] = [SIXTY_DAY_POST];

export function findStaticPost(slug: string): StaticPostMeta | undefined {
  return STATIC_POSTS.find((post) => post.slug === slug);
}
