'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from './PostCard';
import SectionDivider from './SectionDivider';
import { posts, type Post } from '../data/posts';
import { useSanityPosts, type SanityPost } from '../lib/useSanityPosts';
import { SanityPostContent } from '../lib/SanityPostContent';

/** Convert a Sanity post into the shape PostCard expects */
function sanityToPost(sp: SanityPost): Post {
  return {
    id: 9000 + Math.abs(hashCode(sp._id)),
    slug: sp.slug,
    title: sp.title,
    date: sp.publishedAt
      ? new Date(sp.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
    excerpt: sp.excerpt || '',
    image: sp.heroImageUrl || '',
    heroFit: 'cover',
    postType: sp.postType,
    // Keep the Portable Text body so the post can be matched/rendered even if
    // `content` is ever absent.
    body: sp.body,
    content: ({ onTakeLeapClick } = {}) => <SanityPostContent post={sp} onTakeLeapClick={onTakeLeapClick} />,
  };
}

/**
 * A post is renderable if it has a hardcoded `content` render function OR a
 * non-empty Sanity Portable Text `body`.
 */
function isRenderablePost(p: Post): boolean {
  return Boolean(p.content) || (Array.isArray(p.body) && p.body.length > 0);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

export default function LeapLog() {
  const router = useRouter();

  const { posts: sanityPosts } = useSanityPosts();

  const allPosts = useMemo(() => {
    const converted = sanityPosts.map(sanityToPost);
    const hardcoded = [...posts];
    const slugSet = new Set(converted.map((p) => p.slug));
    const filtered = hardcoded.filter((p) => !slugSet.has(p.slug));
    const PINNED = 'how-to-move-to-thailand-in-60-days';
    return [...converted, ...filtered].sort((a, b) => {
      if (a.slug === PINNED) return -1;
      if (b.slug === PINNED) return 1;
      const tb = new Date(b.date).getTime();
      const ta = new Date(a.date).getTime();
      const byDate = tb - ta;
      if (byDate !== 0) return byDate;
      return b.id - a.id;
    });
  }, [sanityPosts]);

  const openPost = useCallback(
    (slug: string) => {
      router.push(`/leap/${slug}`);
    },
    [router]
  );

  return (
    <section
      id="the-leap-log"
      className="pt-2 pb-10 md:pt-3 md:pb-14 bg-gradient-to-b from-white to-gray-50/80 scroll-mt-28"
    >
      <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
        <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-gray-900 mb-4">The Leap Log</h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Raw dispatches from the edge. Fear, breakthroughs, Thailand realities.
          Not polished postcards; real reinvention in progress.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpenPost={openPost} />
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-10 text-center px-4">
        <a
          href="#work-with-me"
          className="font-sans inline-block px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
            color: '#2D1A00',
            border: '1.5px solid #7A5C0A',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
        >
          Take the Leap
        </a>
      </div>

      <SectionDivider bottomFill="#ffffff" />
    </section>
  );
}
