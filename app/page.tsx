'use client';

import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import LeadMagnet from '../components/LeadMagnet';
import WorkWithMe from '../components/WorkWithMe';
import DiscoverYourIdea from '../components/DiscoverYourIdea';
import IdeaToPlan from '../components/IdeaToPlan';
import LeapLog from '../components/LeapLog';
import About from '../components/About';
import Footer from '../components/Footer';
import { scrollToSectionById } from '../utils/scrollToSection';

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
      <LeadMagnet />
      <WorkWithMe />
      <DiscoverYourIdea />
      <IdeaToPlan />
      <LeapLog />
      <About />
      <Footer />
    </div>
  );
}
