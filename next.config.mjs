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
        ],
    },
    experimental: {
        scrollRestoration: false,
      },
};

export default nextConfig;
