/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Hard-exclude pdf-parse from the webpack bundle entirely.
      // It will be loaded via Node.js require() at runtime instead.
      const existing = config.externals || [];
      config.externals = Array.isArray(existing)
        ? [...existing, 'pdf-parse']
        : [existing, 'pdf-parse'];
    }
    return config;
  },
};

export default nextConfig;
