import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the Cormorant Garamond font file lives alongside the OG image
  // serverless function so fs.readFileSync can find it at request time.
  // Without this include, Next.js's file tracing may not bundle files
  // referenced via process.cwd() paths.
  outputFileTracingIncludes: {
    '/whats-stopping-you/result/[id]/opengraph-image': ['./public/fonts/*.ttf'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // :slug* and not :slug, so that EVERY /go path reaches the analytics
        // app, including ones carrying extra segments.
        //
        // With the single segment form, /go/a/b did not match this rewrite and
        // fell through to this site's own 404 page. That page renders the
        // normal layout, which loads GA4, so a mistyped or badly built /go link
        // produced a GA4 page view at the /go path, no click row in Neon, and
        // no error anywhere. That is what happened to /go/fb-page-quiz on
        // 23 Aug 2026, in the window before this rewrite existed at all.
        //
        // The analytics app answers with a plain text 404 that carries no GA4
        // tag, and records every unmatched or malformed hit in its
        // click_failures table, so a broken link now shows up as a broken link
        // instead of as a phantom page view.
        source: '/go/:slug*',
        destination: 'https://qylat-analytics.vercel.app/go/:slug*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/quiz',
        destination: '/whats-stopping-you',
        permanent: true,
      },
      {
        source: '/work-with-me',
        destination: '/#work-with-me',
        permanent: false,
      },
      {
        source: '/leap',
        destination: '/#the-leap-log',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
