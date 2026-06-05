import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // PWA: Enable static export for Capacitor compatibility
  // When building for Capacitor, change output to "export" and run: next build
  // Then use: npx cap sync android
};

export default nextConfig;
