import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/studio", destination: "/studio.html", permanent: false },
      {
        source: "/works",
        has: [{ type: "query", key: "panel", value: "studio" }],
        destination: "/studio.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
