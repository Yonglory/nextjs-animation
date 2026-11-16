import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  sassOptions: {
    // Lets every SCSS module do `@use "abstracts" as *;`
    loadPaths: [path.join(process.cwd(), "src/styles")],
  },
};

export default nextConfig;
