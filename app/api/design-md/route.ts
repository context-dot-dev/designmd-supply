import { NextRequest, NextResponse } from "next/server";
import { createGateway, generateText } from "ai";
import { ContextDev } from "context.dev";
import { buildDesignMdPrompt } from "@/lib/design-md";
import { normalizeDomain, domainToUrl } from "@/lib/domain";
import { getCached, setCached } from "@/lib/turso";
import type { DesignMdRequest, DesignMdResponse } from "@/lib/api-types";

type CachedDesignMd = { designMd: string; markdownLength: number };

export const runtime = "nodejs";
export const maxDuration = 120;

// Browser 1h, downstream CDNs 1d (1w stale), Vercel CDN 30d (30d stale).
// Turso reads are fast (~10ms from same region), so caching is purely about
// shedding load — not masking slow upstreams.
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600",
  "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  "Vercel-CDN-Cache-Control":
    "public, s-maxage=2592000, stale-while-revalidate=2592000",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("domain") ?? "";
  const domain = normalizeDomain(raw);
  if (!domain) {
    return NextResponse.json(
      { status: "error", message: "Invalid domain" } satisfies DesignMdResponse,
      { status: 400 },
    );
  }

  const tursoCached = await getCached<CachedDesignMd>(domain, "designmd");
  if (tursoCached) {
    return NextResponse.json(
      {
        status: "ready",
        designMd: tursoCached.designMd,
        markdownLength: tursoCached.markdownLength,
      } satisfies DesignMdResponse,
      { headers: CACHE_HEADERS },
    );
  }

  return NextResponse.json({ status: "miss" } satisfies DesignMdResponse, {
    headers: CACHE_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  let body: DesignMdRequest;
  try {
    body = (await req.json()) as DesignMdRequest;
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid JSON body",
      } satisfies DesignMdResponse,
      { status: 400 },
    );
  }

  const domain = normalizeDomain(body?.domain ?? "");
  if (!domain) {
    return NextResponse.json(
      { status: "error", message: "Invalid domain" } satisfies DesignMdResponse,
      { status: 400 },
    );
  }

  // Fast path: Turso cache (pre-generated or from a prior on-demand call).
  const tursoCached = await getCached<CachedDesignMd>(domain, "designmd");
  if (tursoCached) {
    return NextResponse.json({
      status: "ready",
      designMd: tursoCached.designMd,
      markdownLength: tursoCached.markdownLength,
    } satisfies DesignMdResponse);
  }

  const missing: string[] = [];
  if (!process.env.CONTEXT_DEV_API_KEY) missing.push("CONTEXT_DEV_API_KEY");
  if (!process.env.VERCEL_AI_GATEWAY_API_KEY) {
    missing.push("VERCEL_AI_GATEWAY_API_KEY");
  }
  if (missing.length) {
    return NextResponse.json({
      status: "missing-env",
      missing,
    } satisfies DesignMdResponse);
  }

  try {
    const client = new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY });
    const gateway = createGateway({
      apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
    });

    // Markdown is the only call we still run server-side — it's cheap context
    // for the LLM and the client doesn't need to render it.
    let markdown = "";
    const cachedMd = await getCached<{ markdown: string }>(domain, "markdown");
    if (cachedMd) {
      markdown = cachedMd.markdown;
    } else {
      try {
        const md = await client.web.webScrapeMd({
          url: domainToUrl(domain),
          includeLinks: true,
          includeImages: false,
          useMainContentOnly: true,
        });
        markdown = md.markdown ?? "";
        if (markdown) {
          await setCached(domain, "markdown", { markdown });
        }
      } catch {
        markdown = "";
      }
    }

    const prompt = buildDesignMdPrompt({
      domain,
      contextStyleguide: body.styleguide,
      screenshotUrl: body.screenshotUrl ?? undefined,
      markdown,
    });

    const userContent = body.screenshotUrl
      ? [
          { type: "image" as const, image: new URL(body.screenshotUrl) },
          { type: "text" as const, text: prompt },
        ]
      : [{ type: "text" as const, text: prompt }];

    const { text } = await generateText({
      model: gateway("openai/gpt-5.4-mini"),
      system:
        "You are a senior design systems writer. Produce concise, implementation-grade DESIGN.md files that follow the requested spec.",
      messages: [{ role: "user", content: userContent }],
      temperature: 0.2,
      providerOptions: {
        gateway: {
          caching: "auto",
        },
      },
    });

    const designMd = text.trim();
    await setCached(domain, "designmd", {
      designMd,
      markdownLength: markdown.length,
    } satisfies CachedDesignMd);

    return NextResponse.json({
      status: "ready",
      designMd,
      markdownLength: markdown.length,
    } satisfies DesignMdResponse);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "DESIGN.md compose failed",
      } satisfies DesignMdResponse,
      { status: 502 },
    );
  }
}
