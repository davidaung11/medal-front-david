import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Served under /app when using the root dev proxy or a path-based reverse proxy */
  basePath: "/app",
  devIndicators: false,
  typescript: {
    // !! WARN !!
    // อนุญาตให้ Build ผ่านแม้จะมี Type Error ก็ตาม
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/medalverse-logo.svg",
        destination: "/app/assets/logos/medalverse-logo.svg",
        permanent: true,
        basePath: false,
      },
      {
        source: "/assets/logos/medalverse-logo.svg",
        destination: "/app/assets/logos/medalverse-logo.svg",
        permanent: true,
        basePath: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.AUTH_API_BASE_URL ||
          "http://localhost:8080"
        }/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;