import type { Metadata } from 'next';
import About from '../../components/About';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'About Liz | Quit Your Life and Travel',
  description:
    'I spent nearly two decades in corporate tech, then quit and bought a one-way ticket to Thailand. I write from Chiang Mai, where I run QYLAT and IdeaToPlan.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <About />
      <Footer />
    </div>
  );
}
