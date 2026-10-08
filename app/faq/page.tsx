import type { Metadata } from 'next';
import FAQ from '../../components/FAQ';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import JsonLd from '../../components/JsonLd';
import { VISIBLE_FAQS } from '../../data/faqs';
import { faqPage, breadcrumbList, HOME_CRUMB } from '@/lib/jsonLd';
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
      {/* FAQPage schema is built from the same list the component renders. */}
      <JsonLd data={[faqPage(VISIBLE_FAQS), breadcrumbList([HOME_CRUMB, { name: 'FAQ', path: '/faq' }])]} />
      <Header />
      <FAQ />
      <Footer />
    </div>
  );
}
