import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Cualquier cosa que vaya a /api/...
        destination: `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/api/:path*`, // Redirige al backend en HTTP
      },
    ];
  },
};

export default nextConfig;
