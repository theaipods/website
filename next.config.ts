import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js badge shown in the corner during development.
  devIndicators: false,
  // Preserve PDF.js's worker resolution relative to its installed package.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "playwright"],
};

export default nextConfig;
