# designmd.supply

> A supply of design md, generated. Drop in any public domain — get back a
> Google-spec `DESIGN.md` ready to feed an AI agent.

`designmd.supply` is a small Next.js app that turns any website into a
self-contained design system document. It pulls brand identity, design tokens,
a hero screenshot, and the live page Markdown, then composes them into a
`DESIGN.md` file with YAML frontmatter and the canonical sections (Overview,
Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts).

## Powered by Context.dev

The whole pipeline runs on four endpoints from the
[Context.dev API](https://context.dev?utm_source=designmd-supply&utm_medium=github&utm_campaign=open-source):

| Context.dev API                                                                                                                                                                                   | What we use it for                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [**Styleguide API**](https://docs.context.dev/api-reference/web-extraction/scrape-styleguide?utm_source=designmd-supply&utm_medium=github&utm_campaign=open-source) — `web.extractStyleguide`     | Primary source of truth for design tokens: colors, typography, spacing, radii, components.                          |
| [**Brand API**](https://docs.context.dev/api-reference/brand-intelligence/retrieve-brand-data-by-domain?utm_source=designmd-supply&utm_medium=github&utm_campaign=open-source) — `brand.retrieve` | Logos, backdrops, brand colors, slogan, industry classification — used to render the directory and the canvas hero. |
| [**Screenshot API**](https://docs.context.dev/api-reference/web-scraping/scrape-screenshot?utm_source=designmd-supply&utm_medium=github&utm_campaign=open-source) — `web.screenshot`              | High-quality homepage capture, fed to the model as visual context for tone and layout.                              |
| [**Markdown API**](https://docs.context.dev/api-reference/web-scraping/scrape-markdown?utm_source=designmd-supply&utm_medium=github&utm_campaign=open-source) — `web.webScrapeMd`                 | Clean Markdown of the live page so the model can ground component and copy guidance in real content.                |

The four payloads converge in
[`lib/design-md.ts`](lib/design-md.ts), where they're shaped into a single
prompt and sent through the [Vercel AI Gateway](https://vercel.com/ai-gateway)
to produce the final `DESIGN.md`.

Get a free Context.dev key at
[context.dev](https://context.dev?utm_source=designmd-supply&utm_medium=github&utm_campaign=open-source).

## Quickstart

```bash
npm install
cp .env.example .env
npm run dev
```

Then open <http://localhost:3000> and search for any domain.

### Environment variables

```bash
CONTEXT_DEV_API_KEY=             # https://context.dev
VERCEL_AI_GATEWAY_API_KEY=       # https://vercel.com/ai-gateway

# Turso (Vercel Marketplace integration — auto-injected on Vercel)
designmd_TURSO_DATABASE_URL=
designmd_TURSO_AUTH_TOKEN=
```

The `designmd_*` prefix matches the variables provisioned by the
[Turso integration on the Vercel Marketplace](https://vercel.com/marketplace/turso),
so on Vercel they're injected automatically. Locally, copy them from the
project's Vercel dashboard into `.env`. If they're absent, the app still
works — it just falls through to the live Context.dev APIs on every request
with no cache.

## How it works

```
            ┌──────────────────────────────────────────┐
            │             Domain in (any URL)          │
            └──────────────────────────────────────────┘
                                  │
                                  ▼
                       Turso cache hit?  ──► serve cached payload
                                  │
                                  ▼ (miss)
       ┌──────────────┬───────────┴──────────┬──────────────┐
       ▼              ▼                      ▼              ▼
  Styleguide API   Brand API           Screenshot API   Markdown API
  (tokens)         (logos, colors)     (hero image)     (page text)
       │              │                      │              │
       └──────────────┴──────────┬───────────┴──────────────┘
                                 ▼
                  Prompt assembly  (lib/design-md.ts)
                                 ▼
                   LLM via Vercel AI Gateway
                                 ▼
                    DESIGN.md  (YAML + Markdown)
                                 ▼
                       write back to Turso
```

The four Context.dev calls run in parallel. The model receives the styleguide
JSON as the primary token source and the screenshot + page Markdown as
supporting evidence for tone, components, and layout — so values come from
real data rather than the model's imagination.

## Project layout

```
app/
  api/
    brand/         GET  — Context.dev Brand API proxy (Turso-cached)
    styleguide/    GET  — Context.dev Styleguide API proxy (Turso-cached)
    screenshot/    GET  — Context.dev Screenshot API proxy (Turso-cached)
    design-md/     GET  — Turso cache lookup
                   POST — compose DESIGN.md from the three payloads + Markdown
  guides/[domain]/ route for an individual generated guide
  page.tsx         home with search + directory of curated domains

components/        UI: directory, search, canvas, orchestration, copy block
lib/
  design-md.ts     prompt + spec summary
  domains.ts       curated list of domains shown on the home page
  turso.ts         libSQL client + cache helpers (get/set/batch/listDomains)
```

## Caching with Turso

The four Context.dev payloads (styleguide, brand, screenshot, markdown) and
the final composed `DESIGN.md` are all cached in a single Turso table,
`domain_cache`, keyed by `(domain, kind)`. The schema is created lazily on
first use — there's no migration step.

- **First request** for a domain hits Context.dev + the LLM and writes every
  payload back to Turso.
- **Subsequent requests** for the same domain serve straight from Turso.
- **`generateStaticParams`** for `/guides/[domain]` reads the set of domains
  with a cached `designmd` row from Turso, so the build only pre-renders
  pages that actually have content.
- **Homepage directory** uses a single batched read (`getCachedBatch`) to
  pull brand + screenshot for every curated domain in one round trip.

Cache writes are best-effort — if Turso is unreachable, the request still
succeeds, the user just doesn't get a cached copy. The same applies if the
env vars are missing entirely (see above).

To add a domain to the curated directory, append it to `TOP_DOMAINS` in
`lib/domains.ts`. The first visit will populate the cache.

## Scripts

```bash
npm run dev         # Next dev server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, RSC)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [`context.dev`](https://www.npmjs.com/package/context.dev) SDK
- [Vercel AI SDK](https://sdk.vercel.ai/) + AI Gateway
- [Turso](https://turso.tech/) (libSQL) via the
  [Vercel Marketplace integration](https://vercel.com/marketplace/turso)

## Contributing

Issues and PRs welcome. To add a domain to the curated directory, append it
to `TOP_DOMAINS` in `lib/domains.ts` — the cache populates on first visit.

## License

MIT
