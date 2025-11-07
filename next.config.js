/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  output: "standalone",
  distDir: ".next",
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  experimental: {
    outputFileTracingIncludes: {
      "*": ["./app/(dashboard)/**", "./app/(auth)/**"],
    },
    outputFileTracingExcludes: {
      "*": ["**/page_client-reference-manifest.js"],
    },
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/backend": path.resolve(__dirname, "backend"),
      "@/lib": path.resolve(__dirname, "backend/lib"),
      "@/components": path.resolve(__dirname, "components"),
      "@/hooks": path.resolve(__dirname, "hooks"),
      "@/stores": path.resolve(__dirname, "stores"),
      "@/types": path.resolve(__dirname, "types"),
      "@": path.resolve(__dirname, "."),
    };
    config.resolve.symlinks = true;
    return config;
  },
};

module.exports = nextConfig;
