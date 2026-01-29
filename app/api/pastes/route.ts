import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Handles creation of a new paste.
 * Accepts content with optional TTL (expiry) and max view limits.
 */
export async function POST(req: NextRequest) {
  try {
    /**
     * Parse and deserialize request body.
     * If the body is not valid JSON, control will jump to catch block.
     */
    const body = await req.json();

    const { content, ttl_seconds, max_views } = body;

    /**
     * Validate `content`
     * - Must exist
     * - Must be a non-empty string
     */
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "content must be a non-empty string" },
        { status: 400 }
      );
    }

    /**
     * Validate `ttl_seconds` (optional)
     * - Must be an integer
     * - Must be >= 1 second
     */
    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    /**
     * Validate `max_views` (optional)
     * - Must be an integer
     * - Must be >= 1
     */
    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    /**
     * Calculate expiration timestamp.
     * If TTL is not provided, the paste will never expire.
     */
    let expiresAt: Date | null = null;
    if (ttl_seconds) {
      expiresAt = new Date(Date.now() + ttl_seconds * 1000);
    }

    /**
     * Persist paste to database.
     * - `expiresAt` controls time-based expiry
     * - `maxViews` controls view-based expiry
     */
    const paste = await prisma.paste.create({
      data: {
        content,
        expiresAt,
        maxViews: max_views ?? null,
      },
    });

    /**
     * Resolve base URL.
     * Uses environment variable in production,
     * falls back to localhost for development.
     */
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://pastebin-lite-livid.vercel.app";

    /**
     * Return minimal response payload.
     * Client only needs the paste ID and public URL.
     */
    return NextResponse.json({
      id: paste.id,
      url: `${baseUrl}/p/${paste.id}`,
    });
  } catch (error) {
    /**
     * Covers:
     * - Invalid JSON body
     * - Unexpected parsing errors
     */
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
