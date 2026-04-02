/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Keep heavy server-only packages out of the webpack bundle
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
