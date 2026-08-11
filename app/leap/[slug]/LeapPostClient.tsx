'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { posts, type Post } from '../../../data/posts';
import { useSanityPosts, type SanityPost } from '../../../lib/useSanityPosts';
import { SanityPostContent } from '../../../lib/SanityPostContent';
import Comments from '../../../components/Comments';

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
    heroFit: sp.heroFit === 'contain' ? 'contain' : 'cover',
    postType: sp.postType,
    body: sp.body,
    content: ({ onTakeLeapClick } = {}) => <SanityPostContent post={sp} onTakeLeapClick={onTakeLeapClick} />,
  };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

function isRenderablePost(p: Post): boolean {
  return Boolean(p.content) || (Array.isArray(p.body) && p.body.length > 0);
}

export default function LeapPostClient({ slug, initialPost }: { slug: string; initialPost?: SanityPost | null }) {
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  const { posts: sanityPosts, loading: sanityLoading } = useSanityPosts();

  const initialConverted = useMemo(
    () => (initialPost ? sanityToPost(initialPost) : null),
    [initialPost],
  );

  const allPosts = useMemo(() => {
    const converted = sanityPosts.map(sanityToPost);
    const slugSet = new Set(converted.map((p) => p.slug));
    const filtered = posts.filter((p) => !slugSet.has(p.slug));
    return [...converted, ...filtered];
  }, [sanityPosts]);

  const post = allPosts.find((p) => p.slug === slug && isRenderablePost(p)) ?? initialConverted;

  useEffect(() => {
    if (sanityLoading) return;
    const ok = allPosts.some((p) => p.slug === slug && isRenderablePost(p));
    if (!ok && !initialConverted) router.replace('/');
  }, [slug, router, allPosts, sanityLoading, initialConverted]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBF6E3' }}>
        <div className="animate-pulse" style={{ color: 'rgba(58,40,26,0.6)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FBF6E3' }}>
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
        <a
          href="/#the-leap-log"
          className="inline-flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity mb-6"
          style={{ color: 'rgba(58,40,26,0.6)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to The Leap Log
        </a>

        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: '1px solid rgba(58,40,26,0.12)' }}
        >
          {post.image && (
            <div className="w-full" style={{ background: '#EBF0E6' }}>
              <Image
                src={post.image}
                alt={post.title}
                width={1200}
                height={400}
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          )}

          <header
            ref={headerRef}
            className="mb-8 px-6 pt-6 text-center sm:px-8 md:px-10"
          >
            <p className="text-sm font-medium" style={{ color: 'rgba(58,40,26,0.6)' }}>
              {post.date}
              {post.readTime ? ` · ${post.readTime}` : ''}
            </p>
            <h1
              className="mt-2 text-3xl md:text-4xl"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700,
                color: '#2D1A00',
              }}
            >
              {post.title}
            </h1>
          </header>

          <article
            className="px-6 py-6 sm:px-8 md:px-10 md:py-10"
            style={{ borderTop: '1px solid rgba(58,40,26,0.12)' }}
          >
            {post.content ? (
              post.content({ onTakeLeapClick: () => router.push('/') })
            ) : (
              <div className="prose prose-lg max-w-none">
                <PortableText value={post.body ?? []} />
              </div>
            )}
            <Comments pageTitle={post.title} />
          </article>
        </div>
      </div>
    </div>
  );
}
