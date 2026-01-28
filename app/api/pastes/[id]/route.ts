import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  // 🔹 Determine current time (TEST_MODE support)
  let now = Date.now();

  if (process.env.TEST_MODE === "1") {
    const testNow = req.headers.get("x-test-now-ms");
    if (testNow) {
      now = Number(testNow);
    }
  }

  // 🔹 Fetch paste
  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  // 🔹 Check TTL
  if (paste.expiresAt && paste.expiresAt.getTime() <= now) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  // 🔹 Check view limit
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  // 🔹 Atomically increment view count
  await prisma.paste.update({
    where: { id },
    data: {
      viewCount: { increment: 1 },
    },
  });

  const remainingViews =
    paste.maxViews === null
      ? null
      : Math.max(paste.maxViews - (paste.viewCount + 1), 0);

  return NextResponse.json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at: paste.expiresAt,
  });
}
