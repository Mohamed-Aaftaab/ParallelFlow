import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Point Next.js to the frontend folder for app directory
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/frontend': path.resolve(__dirname, 'frontend'),
    };
    return config;
  },
};

export default nextConfig;
