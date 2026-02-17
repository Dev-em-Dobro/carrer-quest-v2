import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth", "pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
