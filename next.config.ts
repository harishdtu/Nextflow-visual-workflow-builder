import type { NextConfig } from "next";

const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;