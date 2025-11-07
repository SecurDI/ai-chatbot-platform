/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  // Point to frontend directory for Next.js app structure
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Custom webpack config to handle the new structure
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/backend': path.resolve(__dirname, 'backend'),
      '@/lib': path.resolve(__dirname, 'backend/lib'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/stores': path.resolve(__dirname, 'stores'),
      '@/types': path.resolve(__dirname, 'types'),
      '@': path.resolve(__dirname, '.'),
    };

    // Follow symlinks/junctions for file resolution
    config.resolve.symlinks = true;

    return config;
  },
};

module.exports = nextConfig;
