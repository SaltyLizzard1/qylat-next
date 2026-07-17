import Image from 'next/image';
import type { Post } from '../data/posts';

type PostCardProps = {
  post: Post;
  onOpenPost: (slug: string) => void;
  priority?: boolean;
};

export default function PostCard({ post, onOpenPost, priority = false }: PostCardProps) {
  return (
    <div className="h-auto">
      <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-auto flex flex-col">
        {post.image && (
          <button
            type="button"
            onClick={() => post.content && onOpenPost(post.slug)}
            className="block w-full overflow-hidden text-left disabled:cursor-default"
            style={{ background: '#EBF0E6' }}
            disabled={!post.content}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
              />
            </div>
          </button>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <time>{post.date}</time>
            {post.readTime ? <span> · {post.readTime}</span> : null}
            {post.postType === 'discussion' && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#E8C84A]/20 px-2.5 py-0.5 text-xs font-semibold text-[#8B6914]">
                💬 Discussion
              </span>
            )}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-[#8B6914] transition-colors">
            {post.title}
          </h3>
          <p className="mt-3 text-gray-600 line-clamp-3 flex-1">{post.excerpt}</p>
          {post.content ? (
            <button
              type="button"
              onClick={() => onOpenPost(post.slug)}
              className="mt-4 self-start font-sans font-semibold text-sm rounded-full px-5 py-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
                color: '#2D1A00',
                border: '1.5px solid #2D1A00',
                boxShadow: '0 2px 10px rgba(139,105,20,0.25)',
              }}
            >
              {post.postType === 'discussion' ? 'Join the discussion →' : 'Read the full leap →'}
            </button>
          ) : (
            <span className="mt-4 inline-block text-gray-400 font-medium">Coming soon</span>
          )}
        </div>
      </article>
    </div>
  );
}
