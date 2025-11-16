import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for GitHub Pages builds
  // Vercel doesn't need this and it breaks API routes
  ...(process.env.BUILD_TARGET === 'static' ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
