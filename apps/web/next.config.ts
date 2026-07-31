import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  outputFileTracingRoot: process.env.VERCEL
    ? process.cwd()
    : path.join(process.cwd(), "../.."),
};

export default nextConfig;
