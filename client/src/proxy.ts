import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // Next.js 16 can invoke Proxy again for next-intl's internal locale rewrite.
  // Let that rewritten request reach the route instead of canonicalizing it twice.
  if (request.headers.has("x-next-intl-locale")) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
