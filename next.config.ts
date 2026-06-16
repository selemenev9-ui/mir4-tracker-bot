import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/join",
        destination: "https://dreamscapemir.com/#/signup?d=33",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
