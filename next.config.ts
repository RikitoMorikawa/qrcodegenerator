import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "default",
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
