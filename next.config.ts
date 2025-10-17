import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  images: {
    loader: "default",
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
