import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow requests from specific origins in development
  allowedDevOrigins: [
    "localhost",
    "*.local", // optional wildcard for other local origins
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
