import { NextRequest, NextResponse } from "next/server";
import { ContextDev } from "context.dev";
import { normalizeDomain } from "@/lib/domain";
import { getCached, setCached } from "@/lib/turso";

type StyleguidePayload = { styleguide: unknown };

export const runtime = "nodejs";
export const maxDuration = 120;

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
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const cached = await getCached<StyleguidePayload>(domain, "styleguide");
  if (cached) {
    return NextResponse.json(cached, { headers: CACHE_HEADERS });
  }

  const apiKey = process.env.CONTEXT_DEV_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing CONTEXT_DEV_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const client = new ContextDev({ apiKey });
    const result = await client.web.extractStyleguide({
      domain,
      timeoutMS: 120000,
    });

    const payload: StyleguidePayload = { styleguide: result.styleguide ?? null };
    await setCached(domain, "styleguide", payload);

    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Styleguide extract failed",
      },
      { status: 502 },
    );
  }
}
