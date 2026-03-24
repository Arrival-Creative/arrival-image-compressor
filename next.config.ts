import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow embedding as an iframe on arrivalcreative.com
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://arrivalcreative.com",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://arrivalcreative.com https://*.arrivalcreative.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
