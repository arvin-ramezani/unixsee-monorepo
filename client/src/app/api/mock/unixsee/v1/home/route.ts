import { NextRequest, NextResponse } from "next/server";

// import homeFixtureFa from "@/fixtures/frontend/home.fa.published.json";
// import homeFixtureEn from "@/fixtures/frontend/home.en.published.json";

// const fixtures: Record<string, typeof homeFixtureFa> = {
//   fa: homeFixtureFa,
//   en: homeFixtureEn,
// };

export async function GET(req: NextRequest) {
  //   return Response.json({});
  //   if (process.env.NODE_ENV === "production") {
  //     return NextResponse.json(
  //       { success: false, error: { code: "not_found", message: "Not found." } },
  //       { status: 404 },
  //     );
  //   }

  // const lang = req.nextUrl.searchParams.get("lang") ?? "fa";
  // const fixture = fixtures[lang] ?? fixtures["fa"];

  return NextResponse.json({});
}
