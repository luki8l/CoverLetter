/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Next.js 14: keep heavy server-only packages out of the webpack bundle
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

export default nextConfig;
