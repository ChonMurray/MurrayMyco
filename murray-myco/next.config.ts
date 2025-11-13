import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If using a subdirectory on GitHub Pages (e.g., username.github.io/repo-name),
  // uncomment and set basePath:
  // basePath: '/murray-myco',
  // assetPrefix: '/murray-myco',
};

export default nextConfig;
