import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from './siteMetadata';
import { faqAnswerText, type Faq } from '../data/faqs';

/**
 * JSON-LD builders. Every fact here comes from copy already on the site, plus
 * two things Liz confirmed for structured data on 2026-09-22: the surname
 * Alfond, and that the legal entity stays out. Render with components/JsonLd.tsx.
 *
 * The site graph (Organization, Person, IdeaToPlan, WebSite) ships in the root
 * layout on every page. Page-level blocks reference those nodes by @id, and
 * repeat the fields validators want inline (name, url, logo) so each block
 * also stands on its own.
 */
export type JsonLdObject = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#liz-alfond`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const IDEATOPLAN_ID = 'https://ideatoplan.to/#organization';

const PERSON_NAME = 'Liz Alfond';
const ABOUT_URL = `${SITE_URL}/about`;

const LOGO = {
  '@type': 'ImageObject',
  url: `${SITE_URL}/qylat-logo-base.png`,
  width: 1250,
  height: 449,
};

/** Subjects the site covers first-hand: the Leap Log posts, the story page and the tools. */
const KNOWS_ABOUT = [
  'Leaving a corporate career',
  'Moving abroad to Thailand',
  'Living in Chiang Mai',
  'Thailand DTV visa',
  'International banking for digital nomads and expats',
  'Location-independent work',
  'Business planning for a location-independent life',
];

function personRef(): JsonLdObject {
  return { '@type': 'Person', '@id': PERSON_ID, name: PERSON_NAME, url: ABOUT_URL };
}

function organizationRef(): JsonLdObject {
  return { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL, logo: LOGO };
}

export function personNode(): JsonLdObject {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    givenName: 'Liz',
    familyName: 'Alfond',
    url: ABOUT_URL,
    image: { '@type': 'ImageObject', url: `${SITE_URL}/FB_Pic.jpg`, width: 912, height: 912 },
    jobTitle: 'Founder',
    description:
      'Founder of Quit Your Life and Travel and IdeaToPlan. A degree in Clinical Psychology, nearly two decades in corporate tech, then a one-way ticket to Thailand. Writes from Chiang Mai about what it actually looks like to quit your life and build a new one.',
    homeLocation: { '@type': 'Place', name: 'Chiang Mai, Thailand' },
    worksFor: { '@id': ORGANIZATION_ID },
    affiliation: [{ '@id': ORGANIZATION_ID }, { '@id': IDEATOPLAN_ID }],
    knowsAbout: KNOWS_ABOUT,
    sameAs: ['https://www.instagram.com/liz_alfond/', 'https://www.facebook.com/liz.alfond'],
  };
}

export function organizationNode(): JsonLdObject {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: 'QYLAT',
    url: SITE_URL,
    logo: LOGO,
    image: {
      '@type': 'ImageObject',
      url: DEFAULT_OG_IMAGE.url,
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
    },
    description:
      'A lifestyle brand and coaching service for people leaving corporate life to build a location-independent life abroad. Free content and tools, a skills and business idea assessment, Leap Session coaching calls, and business planning through IdeaToPlan.',
    founder: { '@id': PERSON_ID },
    email: 'liz@quityourlifeandtravel.com',
    knowsAbout: KNOWS_ABOUT,
    sameAs: ['https://www.tiktok.com/@quityourlifeandtravel'],
  };
}

export function ideaToPlanNode(): JsonLdObject {
  return {
    '@type': 'Organization',
    '@id': IDEATOPLAN_ID,
    name: 'IdeaToPlan',
    url: 'https://ideatoplan.to',
    description:
      'Skill-matching and business planning service that turns a direction into a clear, professional business plan. Part of the same ecosystem as Quit Your Life and Travel.',
    founder: { '@id': PERSON_ID },
  };
}

export function websiteNode(): JsonLdObject {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: 'QYLAT',
    description: SITE_DESCRIPTION,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
  };
}

/** Root layout block: the entities and how they relate. */
export function siteGraph(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), personNode(), ideaToPlanNode(), websiteNode()],
  };
}

export type Crumb = { name: string; path: string };

export const HOME_CRUMB: Crumb = { name: 'Home', path: '/' };
export const LEAP_LOG_CRUMB: Crumb = { name: 'The Leap Log', path: '/#the-leap-log' };

export function breadcrumbList(crumbs: Crumb[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.path === '/' ? SITE_URL : `${SITE_URL}${crumb.path}`,
    })),
  };
}

export type BlogPostingInput = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
};

export function blogPosting(post: BlogPostingInput): JsonLdObject {
  const url = `${SITE_URL}/leap/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: post.title,
    description: post.description,
    image: [post.imageUrl],
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: 'en',
    keywords: post.keywords,
    author: personRef(),
    publisher: organizationRef(),
    isPartOf: { '@id': WEBSITE_ID },
  };
}

/** The Leap Session as sold in components/WorkWithMe.tsx. */
export function leapSessionService(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/#leap-session`,
    name: 'The Leap Session',
    serviceType: 'Private coaching call',
    description:
      'A 45-minute private coaching call designed to cut through the fog and get you moving: identify the blocks keeping you stuck, clarify what you actually want, and build your first real action plan.',
    provider: organizationRef(),
    url: `${SITE_URL}/#work-with-me`,
    offers: {
      '@type': 'Offer',
      name: 'Special introductory offer',
      price: '40',
      priceCurrency: 'USD',
      url: 'https://cal.com/qylat/leap-session',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function faqPage(faqs: Faq[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faqpage`,
    url: `${SITE_URL}/faq`,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(faq.answer) },
    })),
  };
}

export function aboutProfilePage(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${ABOUT_URL}#profilepage`,
    url: ABOUT_URL,
    name: 'About Liz',
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: personNode(),
  };
}

export function storyWebPage(): JsonLdObject {
  const url = `${SITE_URL}/story`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: 'My Story',
    about: personRef(),
    isPartOf: { '@id': WEBSITE_ID },
  };
}
