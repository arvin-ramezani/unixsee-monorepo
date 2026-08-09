import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ src: string | string[] }> },
) {
  const src = (await params)?.src;
  let videoPath = src;
  if (typeof src === "string") {
    console.warn(`src: ${src} is not string array`);
    videoPath = `${process.env.BASE_URL}/videos/${src}`;

    // return NextResponse.json({
    //   status: 400,
    //   message: `src: ${src} is not string array`,
    //   success: false,
    // });
  } else {
    videoPath = `${process.env.BASE_URL}/videos/${src.join("/")}`;
  }

  const upstream = await fetch(videoPath, {
    headers: { Range: req.headers.get("Range") ?? "" },
  });

  //localhost:3000/videos/testimonials/testimonial-1.mp4

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "video/mp4",
      "Content-Range": upstream.headers.get("Content-Range") ?? "",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    },
  });
}
// export async function GET(
//   req: Request,
//   { params }: { params: { src: string } },
// ) {
//   const url = params.src;

//   const upstream = await fetch(url, {
//     headers: { Range: req.headers.get("Range") ?? "" },
//   });

//   return new Response(upstream.body, {
//     status: upstream.status,
//     headers: {
//       "Content-Type": upstream.headers.get("Content-Type") ?? "video/mp4",
//       "Content-Range": upstream.headers.get("Content-Range") ?? "",
//       "Accept-Ranges": "bytes",
//       "Cache-Control": "no-store",
//     },
//   });
// }
