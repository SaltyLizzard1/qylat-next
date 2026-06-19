import { PortableText } from '@portabletext/react';
import { urlFor } from './sanity';
import type { SanityPost } from './useSanityPosts';

const components = {
  types: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: ({ value }: { value: any }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-6">
          <img
            src={urlFor(value).width(800).url()}
            alt={value.caption || ''}
            className="rounded-xl w-full"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="text-sm text-gray-500 text-center mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value?: { href: string };
    }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-700 underline hover:text-emerald-900"
      >
        {children}
      </a>
    ),
  },
  block: {
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-emerald-300 pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-bold text-emerald-900 mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-bold text-emerald-900 mt-6 mb-2">{children}</h3>
    ),
  },
};

function ImageGallery({ images }: { images: SanityPost['gallery'] }) {
  if (!images || images.length === 0) return null;

  return (
    <div
      className={`grid gap-3 my-6 ${
        images.length === 1
          ? 'grid-cols-1'
          : images.length === 2
          ? 'grid-cols-2'
          : 'grid-cols-2 md:grid-cols-3'
      }`}
    >
      {images.map((img, i) => (
        <figure key={i}>
          <img
            src={img.url}
            alt={img.caption || ''}
            className="rounded-xl w-full h-64 object-cover"
            loading="lazy"
          />
          {img.caption && (
            <figcaption className="text-sm text-gray-500 text-center mt-1">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function WorkWithMeCTA({ onTakeLeapClick }: { onTakeLeapClick?: () => void }) {
  return (
    <div className="mt-12 text-center not-prose">
      <p className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tight mb-6">Ready to take the leap?</p>
      <a
        href="#work-with-me"
        onClick={(e) => {
          e.preventDefault();
          onTakeLeapClick?.();
          requestAnimationFrame(() => {
            document.getElementById('work-with-me')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }}
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
      >
        Work With Me
      </a>
    </div>
  );
}

export function SanityPostContent({ post, onTakeLeapClick }: { post: SanityPost; onTakeLeapClick?: () => void }) {
  return (
    <article className="prose prose-lg max-w-none px-4 sm:px-6 md:px-8 py-6 text-[18px] sm:text-base leading-relaxed text-gray-700">      {post.gallery && post.gallery.length > 0 && (
        <ImageGallery images={post.gallery} />
      )}
      {post.body && <PortableText value={post.body} components={components} />}
      <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
    </article>
  );
}
