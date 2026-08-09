import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
