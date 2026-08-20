import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  // Ticket attachments allow up to 10 MB per file via Server Actions.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "cdn.shadcnstudio.com" ,
    //     port: "",
    //     // pathname: '/my-bucket/**',
    //     search: "",
    //   },
    // ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
