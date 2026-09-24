import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/studio", destination: "/works?panel=studio", permanent: false }];
  },
};

export default nextConfig;
