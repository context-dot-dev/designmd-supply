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
CONTEXT_DEV_API_KEY=        # https://context.dev
VERCEL_AI_GATEWAY_API_KEY=  # https://vercel.com/ai-gateway
```

## How it works

```
            ┌──────────────────────────────────────────┐
            │             Domain in (any URL)          │
            └──────────────────────────────────────────┘
                                  │
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
```

The four Context.dev calls run in parallel. The model receives the styleguide
JSON as the primary token source and the screenshot + page Markdown as
supporting evidence for tone, components, and layout — so values come from
real data rather than the model's imagination.

## Project layout

```
app/
  api/
    brand/         GET  — Context.dev Brand API proxy
    styleguide/    GET  — Context.dev Styleguide API proxy
    screenshot/    GET  — Context.dev Screenshot API proxy (with cache passthrough)
    design-md/     GET  — cache lookup
                   POST — compose DESIGN.md from the three payloads + Markdown
  guides/[domain]/ route for an individual generated guide
  page.tsx         home with search + directory of pre-generated brands

components/        UI: directory, search, canvas, orchestration, copy block
lib/
  design-md.ts     prompt + spec summary
  brands.json      curated list of brands shown on the home page
  styleguides.json build-time cache of generated DESIGN.md files
scripts/
  generate-brands.mjs       prefetch brand payloads
  generate-styleguides.mjs  batch-generate DESIGN.md for every brand in brands.json
```

## Pre-generating the directory

The home page directory is backed by `lib/styleguides.json`, which is built at
authoring time so the live app can serve those domains instantly without
hitting the API on every request.

```bash
# Brand metadata for the directory cards
npm run generate:brands

# DESIGN.md for every domain in lib/brands.json (3-way concurrent)
npm run generate:styleguides

# Re-generate one domain
node scripts/generate-styleguides.mjs --only=stripe.com

# Force a full rebuild
node scripts/generate-styleguides.mjs --force
```

Live searches for any other domain are generated on demand and cached at the
edge by Vercel.

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

## Contributing

Issues and PRs welcome. To add a brand to the curated directory, drop it into
`lib/brands.json` and run `npm run generate:styleguides --only=yourdomain.com`.

## License

MIT
