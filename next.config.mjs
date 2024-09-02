/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
        {
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '/**',
        },
        {
            protocol: 'http',
            hostname: '**',
            port: '',
            pathname: '/**',
        },
        ],
    },
    experimental: {
        scrollRestoration: false,
      },
    async rewrites() {
        return [
          {
            source: '/rss',
            destination: '/feed.xml',
          },
          {
            source: '/rss.xml',
            destination: '/feed.xml',
          },
          {
            source: '/feed',
            destination: '/feed.xml',
          },
          {
            source: '/atom',
            destination: '/feed.xml',
          },
          {
            source: '/atom.xml',
            destination: '/feed.xml',
          },
          {
            source: '/wp-admin',
            destination: '/admin',
          },
          {
            source: '/wp-admin.php',
            destination: '/admin',
          },
          {
            source: '/admin.php',
            destination: '/admin',
          },
        ]
      },
};

export default nextConfig;