import type { NextConfig } from "next";
import {
  buildContentSecurityPolicy,
  securityHeaders,
} from "./lib/security/csp";

const nextConfig: NextConfig = {

  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const csp = buildContentSecurityPolicy(isDev);

    return [
      {
        source: "/(.*)",
        headers: [
          // Report-Only first: observe + reconcile real browser violations,
          // THEN flip the key to "Content-Security-Policy" to enforce.
          { key: "Content-Security-Policy-Report-Only", value: csp },
          ...securityHeaders(),
        ],
      },
    ];
  },

  images: {
    qualities: [75, 100],
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
      {
        protocol: "https",
        hostname: "items-images-production.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "items-images-sandbox.s3.us-west-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
