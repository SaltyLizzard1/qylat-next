import { PortableText } from '@portabletext/react';
import { urlFor } from './sanity';
import type { SanityPost } from './useSanityPosts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortableTextBlock = Record<string, any>;

function groupConsecutiveImages(blocks: PortableTextBlock[]): (PortableTextBlock | PortableTextBlock[])[] {
  const result: (PortableTextBlock | PortableTextBlock[])[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i]._type === 'image') {
      const group: PortableTextBlock[] = [];
      while (i < blocks.length && blocks[i]._type === 'image') {
        group.push(blocks[i]);
        i++;
      }
      result.push(group.length === 1 ? group[0] : group);
    } else {
      result.push(blocks[i]);
      i++;
    }
  }
  return result;
}

function InlineImage({ value }: { value: PortableTextBlock }) {
  if (!value?.asset) return null;
  return (
    <figure className="flex flex-col items-center">
      <img
        src={urlFor(value).width(1200).url()}
        alt={value.alt || value.caption || ''}
        className="rounded-lg max-w-full h-auto"
        style={{ maxHeight: '70vh', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
        loading="lazy"
      />
      {value.caption && (
        <figcaption className="text-sm text-gray-400 italic text-center mt-2">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

function InlineImageGroup({ images }: { images: PortableTextBlock[] }) {
  const cols =
    images.length === 2 ? 'grid-cols-2' :
    images.length >= 3 ? 'grid-cols-3' :
    'grid-cols-1';

  return (
    <figure className="not-prose my-8">
      <div className={`grid ${cols} gap-3`}>
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-lg" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
            <img
              src={urlFor(img).width(800).url()}
              alt={img.alt || img.caption || ''}
              className="w-full h-56 object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {images.some((img) => img.caption) && (
        <figcaption className="text-sm text-gray-400 italic text-center mt-2">
          {images.find((img) => img.caption)?.caption}
        </figcaption>
      )}
    </figure>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PostBody({ body }: { body: any[] }) {
  const grouped = groupConsecutiveImages(body);

  return (
    <>
      {grouped.map((item, i) => {
        if (Array.isArray(item)) {
          return <InlineImageGroup key={i} images={item} />;
        }
        if (item._type === 'image') {
          return (
            <div key={i} className="not-prose my-8">
              <InlineImage value={item} />
            </div>
          );
        }
        return (
          <PortableText
            key={i}
            value={[item]}
            components={components}
          />
        );
      })}
    </>
  );
}

const components = {
  types: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: ({ value }: { value: any }) => (
      <div className="not-prose my-8">
        <InlineImage value={value} />
      </div>
    ),
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
        className="inline-block text-lg font-semibold px-8 py-4 rounded-full transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #8B6914 0%, #E8C84A 35%, #F5E070 55%, #C9A030 75%, #8B6914 100%)',
          color: '#2D1A00',
          border: '1.5px solid #7A5C0A',
        }}
      >
        Work With Me
      </a>
    </div>
  );
}

export function SanityPostContent({ post, onTakeLeapClick }: { post: SanityPost; onTakeLeapClick?: () => void }) {
  return (
    <article className="prose prose-lg max-w-none px-4 sm:px-6 md:px-8 py-6 text-[18px] sm:text-base leading-relaxed text-gray-700">
      {post.body && <PostBody body={post.body} />}
      <WorkWithMeCTA onTakeLeapClick={onTakeLeapClick} />
    </article>
  );
}
