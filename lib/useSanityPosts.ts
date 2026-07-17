import { useState, useEffect } from 'react';

export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  postType: 'blog' | 'discussion' | 'photo-essay';
  excerpt: string;
  heroImageUrl: string | null;
  heroCardUrl: string | null;
  heroFit?: 'cover' | 'contain';
  gallery: { url: string; caption?: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any[];
  publishedAt: string;
  featured: boolean;
  tags: string[];
  category: { title: string; slug: string } | null;
}

export function useSanityPosts() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data: SanityPost[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (process.env.NODE_ENV === 'development') console.error('Posts fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { posts, loading, error };
}