import type { Post } from '../data/posts';
import { images } from '../config/images';

/**
 * Inline `object-position` when `heroPosition` is set. Otherwise rely on Tailwind classes from
 * `postHeroObjectPositionClass`.
 */
export function postHeroObjectPositionStyle(post: Post): { objectPosition: string } | undefined {
  if (post.heroPosition) {
    return { objectPosition: post.heroPosition };
  }
  return undefined;
}

/** Tailwind `object-*` classes when `heroPosition` is not set; empty when using inline style. */
export function postHeroObjectPositionClass(post: Post, variant: 'card' | 'modal'): string {
  if (post.heroPosition) {
    return '';
  }
  if (post.slug === 'the-more-i-sort-the-more-appears') {
    return 'object-[center_30%]';
  }
  if (post.image === images.bini) {
    return 'object-[55%_30%]';
  }
  if (post.image === images.baliAtm) {
    return variant === 'modal' ? 'object-[center_18%]' : 'object-[center_22%]';
  }
  return 'object-center';
}

export function postHeroObjectFitClass(post: Post): string {
  return post.heroFit === 'contain' ? 'object-contain' : 'object-cover';
}
