import type { Post } from '../data/posts';
import {
  postHeroObjectFitClass,
  postHeroObjectPositionClass,
  postHeroObjectPositionStyle,
} from '../utils/postHeroImage';

type PostCardProps = {
  post: Post;
  onOpenPost: (slug: string) => void;
};

export default function PostCard({ post, onOpenPost }: PostCardProps) {
  const heroPositionStyle = postHeroObjectPositionStyle(post);
  const cardImageObjectPosition = postHeroObjectPositionClass(post, 'card');

  return (
    <div className="h-auto">
      <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group h-auto flex flex-col">
        {post.image && (
          <button
            type="button"
            onClick={() => post.content && onOpenPost(post.slug)}
            className="block w-full overflow-hidden bg-gray-100 text-left disabled:cursor-default"
            disabled={!post.content}
          >
            <img
              src={post.image}
              alt={post.title}
              className={`w-full h-80 ${postHeroObjectFitClass(post)} group-hover:scale-105 transition-transform duration-300 ${cardImageObjectPosition}`.trimEnd()}
              style={heroPositionStyle}
              loading="lazy"
            />
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
              className="mt-4 inline-block font-medium transition-colors" style={{ color: '#8B6914' }}
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
