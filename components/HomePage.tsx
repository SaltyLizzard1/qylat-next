'use client';

import { useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import LeadMagnet from './LeadMagnet';
import StoryTeaser from './StoryTeaser';
import WorkWithMe from './WorkWithMe';
import DiscoverYourIdea from './DiscoverYourIdea';
import IdeaToPlan from './IdeaToPlan';
import LeapCalculatorTeaser from './LeapCalculatorTeaser';
import LeapLog from './LeapLog';
import Footer from './Footer';
import { scrollToSectionById } from '../utils/scrollToSection';
import type { LeapLogPost } from '../lib/posts';

const Divider = () => (
  <div className="w-full" style={{ height: '3px', background: 'linear-gradient(90deg, transparent 0%, #C9A030 25%, #F5E070 50%, #C9A030 75%, transparent 100%)' }} />
);

// The homepage body. app/page.tsx stays a server component so it can export
// metadata and fetch the Leap Log; everything interactive lives here.
export default function HomePage({ posts }: { posts: LeapLogPost[] }) {
  useEffect(() => {
    const hash = window.location.hash?.replace(/^#/, '');
    if (!hash) return;
    const id = decodeURIComponent(hash);
    const t = window.setTimeout(() => scrollToSectionById(id), 350);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Divider />
      <StoryTeaser />
      <Divider />
      <LeapCalculatorTeaser />
      <Divider />
      <DiscoverYourIdea />
      <Divider />
      <IdeaToPlan />
      <Divider />
      <LeadMagnet />
      <Divider />
      <WorkWithMe />
      <Divider />
      <LeapLog posts={posts} />
      <Footer />
    </div>
  );
}
