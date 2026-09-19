import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Type checking runs as its own release gate. Keeping it separate also avoids
  // build and type generation writing to .next at the same time.
  typescript: { ignoreBuildErrors: true },
  experimental: { useTypeScriptCli: false }
};

export default nextConfig;
