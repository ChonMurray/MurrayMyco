import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable API routes and server features for e-commerce
  // Re-enable when deploying to static hosting if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
