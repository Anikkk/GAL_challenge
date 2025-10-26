import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://gal-challenge-backend.vercel.app/',
  },
};

export default nextConfig;
