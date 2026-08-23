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
