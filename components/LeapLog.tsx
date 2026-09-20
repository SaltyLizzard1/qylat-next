'use client';

import { motion, MotionConfig } from 'framer-motion';
import PostCard from './PostCard';
import SectionDivider from './SectionDivider';
import type { LeapLogPost } from '../lib/posts';

// Posts arrive as a prop from app/page.tsx, fetched on the server by
// lib/posts.ts, already merged with the static registry and sorted. Nothing
// here fetches, so the full list is in the server-rendered HTML.
export default function LeapLog({ posts }: { posts: LeapLogPost[] }) {
  return (
    <MotionConfig reducedMotion="user">
    <motion.section
      id="the-leap-log"
      className="pt-2 pb-10 md:pt-3 md:pb-14 bg-gradient-to-b from-white to-gray-50/80"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      viewport={{ once: true, margin: '-80px' }}
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
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} priority={index === 0} />
          ))}
        </div>
      </div>

      <div className="mt-8 md:mt-10 text-center px-4">
        <a
          href="/work-with-me"
          className="font-sans inline-block px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
            color: '#2D1A00',
            border: '1.5px solid #2D1A00',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
        >
          Take the Leap
        </a>
      </div>

      <SectionDivider bottomFill="#ffffff" />
    </motion.section>
    </MotionConfig>
  );
}
