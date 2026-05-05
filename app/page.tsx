import { DomainDirectory, type DirectoryCard } from "@/components/domain-directory";
import { DomainSearch } from "@/components/domain-search";
import { TOP_DOMAINS } from "@/lib/domains";
import { pickLogoForSurface } from "@/lib/logo-pick";
import { getCachedBatch, isTursoEnabled, type CacheKind } from "@/lib/turso";
import type { LiveBrand, LiveScreenshot } from "@/lib/api-types";

export default async function Home() {
  const cards = await loadDirectoryCards();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-20">
      <section className="grid gap-12 sm:gap-16">
        <div>
          <h1 className="max-w-[14ch] text-5xl font-medium tracking-tight text-balance text-ink sm:text-7xl">
            A supply of{" "}
            <span className="italic font-light text-muted">style guides</span>,
            generated.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base/7 text-pretty text-muted sm:text-lg/8">
            Drop in any public domain. We pull brand identity, screenshots, and
            live markup from Context.dev, then shape it into a Google DESIGN.md
            document — ready to feed an AI agent.
          </p>
        </div>

        <div className="max-w-2xl">
          <DomainSearch />
        </div>
      </section>

      <section className="mt-20">
        <div>
          <DomainDirectory cards={cards} />
        </div>
      </section>
    </main>
  );
}

async function loadDirectoryCards(): Promise<DirectoryCard[]> {
  if (!isTursoEnabled()) return [];
  const domains = TOP_DOMAINS.map((d) => d.domain);
  const kinds: CacheKind[] = ["brand", "screenshot"];
  // Single round trip — avoids N+1 reads when the list grows.
  const cached = await getCachedBatch<LiveBrand | LiveScreenshot>(
    domains,
    kinds,
  );

  return TOP_DOMAINS.map((entry) => {
    const bucket = cached.get(entry.domain);
    const brand = bucket?.get("brand") as LiveBrand | undefined;
    const screenshot = bucket?.get("screenshot") as LiveScreenshot | undefined;

    const colors = brand?.colors ?? [];
    const fallbackColor =
      colors[0]?.hex ?? brand?.backdrop?.colors[0]?.hex ?? "#0a0a0a";
    // Directory cards live on white tiles, so pick a light-surface mark and
    // prefer the more compact icon variant.
    const mark = pickLogoForSurface(brand?.logos, "light", "icon");

    return {
      domain: entry.domain,
      name: brand?.name ?? entry.name,
      title: brand?.title ?? entry.name,
      industry: brand?.industry?.industry ?? null,
      colors: colors.slice(0, 5),
      fallbackColor,
      screenshotUrl:
        screenshot?.status === "ready" ? screenshot.url : null,
      markUrl: mark?.url ?? null,
    } satisfies DirectoryCard;
  });
}
