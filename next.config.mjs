/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow larger request bodies for job description + CV paste
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
