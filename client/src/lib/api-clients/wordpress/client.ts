import { createUnixseeClient } from "./server";

if (!process.env.UNIXSEE_WP_API_BASE_URL) {
  throw new Error(
    "UNIXSEE_WP_API_BASE_URL is not defined. Check your .env.local",
  );
}

export const wordpressClient = createUnixseeClient({
  wpApiBaseUrl: process.env.UNIXSEE_WP_API_BASE_URL,
  apiKey: process.env.UNIXSEE_API_KEY,
  defaultLang: "fa",
  defaultNext: {
    revalidate: 300,
    tags: ["wordpress"],
  },
});
