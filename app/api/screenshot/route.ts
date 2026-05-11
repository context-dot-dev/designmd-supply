import { NextRequest, NextResponse } from "next/server";
import { ContextDev } from "context.dev";
import { normalizeDomain } from "@/lib/domain";
import { getCached, setCached } from "@/lib/turso";
import type { LiveScreenshot } from "@/lib/api-types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Browser 1h, downstream CDNs 1d (1w stale), Vercel CDN 30d (30d stale).
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600",
  "CDN-Cache-Control":
    "public, s-maxage=86400, stale-while-revalidate=604800",
  "Vercel-CDN-Cache-Control":
    "public, s-maxage=2592000, stale-while-revalidate=2592000",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("domain") ?? "";
  const domain = normalizeDomain(raw);
  if (!domain) {
    return NextResponse.json(
      { status: "error", message: "Invalid domain" } satisfies LiveScreenshot,
      { status: 400 },
    );
  }

  const tursoCached = await getCached<LiveScreenshot>(domain, "screenshot");
  if (tursoCached) {
    return NextResponse.json(tursoCached, { headers: CACHE_HEADERS });
  }

  const apiKey = process.env.CONTEXT_DEV_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing CONTEXT_DEV_API_KEY",
      } satisfies LiveScreenshot,
      { status: 500 },
    );
  }

  try {
    const client = new ContextDev({ apiKey });
    const result = await client.web.screenshot({
      domain,
      fullScreenshot: "false",
      handleCookiePopup: "true",
    });

    const body: LiveScreenshot = result.screenshot
      ? { status: "ready", url: result.screenshot }
      : { status: "none" };

    await setCached(domain, "screenshot", body);

    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Screenshot failed",
      } satisfies LiveScreenshot,
      { status: 502 },
    );
  }
}
