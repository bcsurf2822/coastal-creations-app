import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "square-catalog-production.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "square-catalog-sandbox.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
