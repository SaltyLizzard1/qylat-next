import type { MetadataRoute } from 'next';
import { sanityClient } from '@/lib/sanity';

const BASE_URL = 'https://www.quityourlifeandtravel.com';

const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  publishedAt,
  _updatedAt
}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts: { slug: string; publishedAt: string; _updatedAt: string }[] =
    await sanityClient.fetch(SLUGS_QUERY, {}, { next: { revalidate: 3600 } });

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/leap/${post.slug}`,
    lastModified: new Date(post._updatedAt ?? post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/welcome`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...postEntries,
  ];
}
