import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fetches a paste by ID.
 * Enforces time-based expiry (TTL) and view-based limits.
 * Increments view count atomically on successful access.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  /**
   * Extract route parameter.
   * In the App Router, `params` can be async depending on runtime.
   */
  const { id } = await params;

  /**
   * Guard clause for missing or malformed ID.
   * Returns 404 to avoid leaking existence information.
   */
  if (!id) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  /**
   * Resolve current timestamp.
   * Supports deterministic testing via TEST_MODE and request header override.
   */
  let now = Date.now();

  if (process.env.TEST_MODE === "1") {
    const testNow = req.headers.get("x-test-now-ms");
    if (testNow) {
      now = Number(testNow);
    }
  }

  /**
   * Fetch paste from database.
   * A single read is performed before validation checks.
   */
  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  /**
   * Paste does not exist.
   * Return 404 without exposing additional context.
   */
  if (!paste) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  /**
   * TTL enforcement.
   * If the paste has an expiry timestamp and it has elapsed,
   * treat it as non-existent.
   */
  if (paste.expiresAt && paste.expiresAt.getTime() <= now) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  /**
   * View limit enforcement.
   * Once maxViews is reached, the paste becomes inaccessible.
   */
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  /**
   * Increment view count.
   * Uses atomic update to avoid race conditions under concurrent access.
   */
  await prisma.paste.update({
    where: { id },
    data: {
      viewCount: { increment: 1 },
    },
  });

  /**
   * Calculate remaining views after current access.
   * Null indicates unlimited views.
   */
  const remainingViews =
    paste.maxViews === null
      ? null
      : Math.max(paste.maxViews - (paste.viewCount + 1), 0);

  /**
   * Successful response payload.
   * Includes content and metadata required by the client.
   */
  return NextResponse.json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at: paste.expiresAt,
  });
}
