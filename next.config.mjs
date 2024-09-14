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
      async headers() {
        return [
            {
                // matching all API routes
                source: "/*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    }
};

export default nextConfig;