import type { Metadata } from 'next';
import HomePage from '../components/HomePage';
import { getLeapLogPosts } from '@/lib/posts';
import { pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/siteMetadata';

export const metadata: Metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: '/',
});

export default async function Page() {
  const posts = await getLeapLogPosts();

  return (
    <>
      {/* Hero is rendered as a CSS backgroundImage in components/Hero.tsx,
          so next/image priority does not apply. This preload lives on the
          homepage only, since no other route uses the image. React 19
          hoists the <link> into <head> during SSR. */}
      <link
        rel="preload"
        as="image"
        href={process.env.NEXT_PUBLIC_IMG_HERO ?? '/images/rice-fields.jpg'}
        fetchPriority="high"
      />
      <HomePage posts={posts} />
    </>
  );
}
