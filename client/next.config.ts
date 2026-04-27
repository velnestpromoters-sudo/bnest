import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    if (backendUrl && !backendUrl.startsWith('http')) {
        backendUrl = `https://${backendUrl}`;
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
