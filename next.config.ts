import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // plain Node code that opens sockets: loaded at run time, not bundled
  serverExternalPackages: ["tinkerforge"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
