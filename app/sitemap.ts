import type { MetadataRoute } from 'next';
import { getLeapLogPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/siteMetadata';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

type StaticPage = {
  path: string;
  /**
   * Date of the last change to the page's visible copy, kept by hand. Vercel
   * builds from a shallow clone without the .git directory, so git dates
   * cannot be read at build time. When the copy on one of these pages
   * changes, update its date here in the same commit. Metadata and styling
   * changes do not count.
   */
  copyDate: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

// noindex routes (welcome, thank-you, the per-user result pages) stay out.
const STATIC_PAGES: StaticPage[] = [
  { path: '/', copyDate: '2026-09-01', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/story', copyDate: '2026-09-01', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', copyDate: '2026-08-12', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', copyDate: '2026-08-12', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/assessment', copyDate: '2026-08-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/whats-stopping-you', copyDate: '2026-08-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/calculator', copyDate: '2026-08-21', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/privacy', copyDate: '2026-09-01', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', copyDate: '2026-08-11', changeFrequency: 'yearly', priority: 0.3 },
];

function pageUrl(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Same source as the homepage Leap Log, so the two never disagree.
  const posts = (await getLeapLogPosts()).filter((post) => post.hasContent);

  const latestPostEdit = posts.reduce((latest, post) => {
    const t = new Date(post.updatedAt).getTime();
    return t > latest ? t : latest;
  }, 0);

  const pageEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => {
    const copyTime = new Date(page.copyDate).getTime();
    // The Leap Log is part of the homepage, so a post edit changes it too.
    const lastModified =
      page.path === '/' ? new Date(Math.max(copyTime, latestPostEdit)) : new Date(copyTime);

    return {
      url: pageUrl(page.path),
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    };
  });

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/leap/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...pageEntries, ...postEntries];
}
