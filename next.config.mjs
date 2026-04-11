/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: ['pdf-parse'],
  },

  // Security + SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevents clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stops MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Forces HTTPS (2 years)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Referrer policy — passes full URL to same-origin, origin only to cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy — disable unused browser APIs
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Long cache for static assets
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = config.externals || [];
      config.externals = Array.isArray(existing)
        ? [...existing, 'pdf-parse']
        : [existing, 'pdf-parse'];
    }
    return config;
  },
};

export default nextConfig;
