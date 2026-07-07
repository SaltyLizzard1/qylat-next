'use client';

import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import LeadMagnet from '../components/LeadMagnet';
import StoryTeaser from '../components/StoryTeaser';
import WorkWithMe from '../components/WorkWithMe';
import DiscoverYourIdea from '../components/DiscoverYourIdea';
import IdeaToPlan from '../components/IdeaToPlan';
import LeapLog from '../components/LeapLog';
import About from '../components/About';
import Footer from '../components/Footer';
import { scrollToSectionById } from '../utils/scrollToSection';

const Divider = () => (
  <div className="w-full" style={{ height: '3px', background: 'linear-gradient(90deg, transparent 0%, #C9A030 25%, #F5E070 50%, #C9A030 75%, transparent 100%)' }} />
);

export default function HomePage() {
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
      <LeadMagnet />
      <Divider />
      <LeapLog />
      <Divider />
      <WorkWithMe />
      <Divider />
      <DiscoverYourIdea />
      <Divider />
      <IdeaToPlan />
      <Divider />
      <About />
      <Footer />
    </div>
  );
}
