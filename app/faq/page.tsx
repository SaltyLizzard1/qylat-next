import type { Metadata } from 'next';
import FAQ from '../../components/FAQ';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { pageMetadata } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'FAQ | Quit Your Life and Travel',
  description:
    'How QYLAT and IdeaToPlan fit together, what the free Discover Your Idea assessment does, what a Leap Session is, and what a business plan costs.',
  path: '/faq',
});

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <FAQ />
      <Footer />
    </div>
  );
}
