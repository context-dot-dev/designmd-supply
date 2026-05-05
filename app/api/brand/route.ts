import { NextRequest, NextResponse } from "next/server";
import { ContextDev } from "context.dev";
import { normalizeDomain } from "@/lib/domain";
import { getCached, setCached } from "@/lib/turso";
import type { LiveBrand, LiveColor } from "@/lib/api-types";

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
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const cached = await getCached<LiveBrand>(domain, "brand");
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
    const res = await client.brand.retrieve({ domain });
    const brand = res.brand ?? {};

    const logos = (brand.logos ?? [])
      .filter((l): l is typeof l & { url: string } => !!l.url)
      .map((l) => ({
        url: l.url,
        mode: l.mode ?? null,
        type: l.type ?? null,
        resolution: l.resolution
          ? {
              width: l.resolution.width,
              height: l.resolution.height,
              aspect_ratio: l.resolution.aspect_ratio,
            }
          : null,
      }));

    // Pick the widest backdrop — wide hero shots compose best in the canvas.
    const widest = [...(brand.backdrops ?? [])]
      .filter((b) => !!b.url)
      .sort(
        (a, b) =>
          (b.resolution?.aspect_ratio ?? 0) - (a.resolution?.aspect_ratio ?? 0),
      )[0];

    const backdrop = widest?.url
      ? {
          url: widest.url,
          aspect_ratio: widest.resolution?.aspect_ratio ?? null,
          colors: (widest.colors ?? [])
            .filter((c): c is typeof c & { hex: string } => !!c.hex)
            .map((c) => ({ hex: c.hex, name: c.name ?? null })),
        }
      : null;

    const flat: LiveColor[] = (brand.colors ?? [])
      .filter((c): c is typeof c & { hex: string } => !!c.hex)
      .map((c) => ({ hex: c.hex.toLowerCase(), name: c.name ?? null }));

    const colors = [...flat];
    const seen = new Set(colors.map((c) => c.hex));
    for (const c of backdrop?.colors ?? []) {
      const k = c.hex.toLowerCase();
      if (!seen.has(k)) {
        colors.push({ hex: k, name: c.name });
        seen.add(k);
      }
      if (colors.length >= 6) break;
    }

    const eic = brand.industries?.eic?.[0];

    const out: LiveBrand = {
      domain,
      name: brand.title ?? domain,
      title: brand.title ?? domain,
      description: brand.description ?? null,
      slogan: brand.slogan ?? null,
      logos,
      backdrop,
      colors,
      industry: eic
        ? { industry: eic.industry, subindustry: eic.subindustry }
        : null,
    };

    await setCached(domain, "brand", out);

    return NextResponse.json(out, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Brand lookup failed",
      },
      { status: 502 },
    );
  }
}
