import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
