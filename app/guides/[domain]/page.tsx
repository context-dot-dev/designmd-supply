import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeDomain } from "@/lib/domain";
import { TOP_DOMAINS } from "@/lib/domains";
import { getCached, listDomainsWithDesignMd } from "@/lib/turso";
import { GuideOrchestrator } from "@/components/guide-orchestrator";
import type { LiveBrand } from "@/lib/api-types";

export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render any domain that has a designmd row in Turso, scoped to the
  // top-level supply list so we don't accidentally pre-render adversarial
  // domains that someone happened to cache.
  const cached = new Set(await listDomainsWithDesignMd());
  return TOP_DOMAINS.filter((d) => cached.has(d.domain)).map((d) => ({
    domain: d.domain,
  }));
}

type Props = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(decodeURIComponent(rawDomain));
  return { title: domain ? `${domain}` : "Style guide" };
}

export default async function StyleGuidePage({ params }: Props) {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(decodeURIComponent(rawDomain));
  if (!domain) notFound();

  // Seed the client with whatever Turso already has so the first paint isn't
  // empty. The client still re-fetches /api/brand to keep this hydrationally
  // identical to a cold visit.
  const initialBrand =
    (await getCached<LiveBrand>(domain, "brand")) ?? undefined;

  return <GuideOrchestrator domain={domain} initialBrand={initialBrand} />;
}
