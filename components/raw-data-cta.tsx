import { ArrowUpRight } from "lucide-react";

const CONTEXT_BLUE = "#2663eb";

export function RawDataCta({ domain }: { domain: string }) {
  const utm = (medium: string, campaign: string) =>
    `utm_source=designmd-supply&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${encodeURIComponent(domain)}`;

  const apiHref = `https://context.dev/?${utm("guide_cta", "raw_data")}`;
  const docsHref = `https://context.dev/docs?${utm("guide_cta", "raw_data_docs")}`;

  return (
    <section
      aria-labelledby="raw-data-cta-heading"
      className="mt-16 sm:mt-20"
    >
      <div className="relative overflow-hidden rounded-2xl border border-rule bg-paper">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(10_10_10_/_0.045)_1px,transparent_0)] [background-size:18px_18px] opacity-70"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full blur-3xl"
          style={{ background: `${CONTEXT_BLUE}1a` }}
        />

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12 lg:p-12">
          <div className="flex min-w-0 flex-col">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full"
                style={{ background: CONTEXT_BLUE }}
              />
              Behind the supply
            </p>
            <h2
              id="raw-data-cta-heading"
              className="mt-4 max-w-[18ch] text-3xl font-medium tracking-tight text-balance text-ink sm:text-4xl"
            >
              Want the raw data we used to power this designmd?
            </h2>
            <p className="mt-4 max-w-[52ch] text-base/7 text-muted sm:text-[15px]/7">
              Every guide here is composed from a structured payload — brand
              identity, palette tokens, screenshots, and styleguide notes —
              fetched live from{" "}
              <span className="font-medium text-ink">context.dev</span>. Plug
              the same API into your own product to render brand-aware
              experiences without scraping.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={apiHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/15 transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: CONTEXT_BLUE,
                  boxShadow: `0 12px 32px -10px ${CONTEXT_BLUE}66`,
                }}
              >
                Get the raw data on context.dev
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href={docsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted underline-offset-4 transition hover:text-ink hover:underline"
              >
                or browse the docs →
              </a>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="overflow-hidden rounded-xl border border-ink/80 bg-ink text-paper shadow-2xl shadow-ink/15">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2 rounded-full bg-white/15" />
                  <span className="size-2 rounded-full bg-white/15" />
                  <span className="size-2 rounded-full bg-white/15" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50">
                  api.context.dev
                </p>
              </div>
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11px]">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
                  style={{
                    background: "rgb(52 211 153 / 0.15)",
                    color: "rgb(110 231 183)",
                  }}
                >
                  GET
                </span>
                <span className="truncate text-paper/70">
                  /v1/brand?domain=
                  <span className="text-paper">{domain}</span>
                </span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 font-mono text-[11px]/5 text-paper/75">
{`{
  "domain": "${domain}",
  "name": "…",
  "colors": [
    { "hex": "#…", "role": "primary" },
    { "hex": "#…", "role": "accent"  }
  ],
  "logos":      [ … ],
  "screenshot": "https://…",
  "styleguide": { … }
}`}
              </pre>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -left-3 hidden rotate-[-4deg] sm:block"
            >
              <div className="rounded-lg border border-rule bg-paper px-3 py-1.5 shadow-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Raw · structured · realtime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
