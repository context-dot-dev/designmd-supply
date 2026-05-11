import { Camera, FileText, ImageIcon, Layers, Palette } from "lucide-react";
import type {
  LiveBrand,
  LiveScreenshot,
  LiveStyleguide,
} from "@/lib/api-types";
import { pickLogoForSurface, shouldInvert } from "@/lib/logo-pick";
import { GuideTabs } from "@/components/guide-tabs";
import { RawDataCta } from "./raw-data-cta";

/* ------------------------------------------------------------ */
/* Left column — raw DESIGN.md with copy button                 */
/* ------------------------------------------------------------ */

export function DesignMdArticle({
  domain,
  designMd,
  status,
  message,
  brand,
  styleguide,
}: {
  domain: string;
  designMd?: string;
  status: "ready" | "missing-env" | "error";
  message?: string;
  brand?: LiveBrand;
  styleguide?: LiveStyleguide | null;
}) {
  return (
    <article className="tile-reveal min-w-0">
      <header className="flex items-baseline justify-between gap-4 pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Design tokens · copy & paste
        </p>
        <p className="hidden font-mono text-[10px] uppercase tracking-wide text-muted/70 sm:block">
          {status === "ready"
            ? "ready"
            : status === "missing-env"
              ? "setup required"
              : "failed"}
        </p>
      </header>

      {status === "ready" && designMd ? (
        <>
          <GuideTabs
            domain={domain}
            designMd={designMd}
            brand={brand}
            styleguide={styleguide}
          />
          <RawDataCta domain={domain} />
        </>
      ) : status === "missing-env" ? (
        <Notice
          tone="warn"
          title="Environment variables required"
          body={
            message ??
            "Add CONTEXT_DEV_API_KEY and VERCEL_AI_GATEWAY_API_KEY from .env.example and reload."
          }
        />
      ) : (
        <Notice
          tone="error"
          title="Generation failed"
          body={message ?? "Unknown error."}
        />
      )}
    </article>
  );
}

/* ------------------------------------------------------------ */
/* Right column — ingredients that fed the generation           */
/* ------------------------------------------------------------ */

export function IngredientsSidebar({
  brand,
  domain,
  screenshot,
  source,
}: {
  brand?: LiveBrand;
  domain: string;
  screenshot: LiveScreenshot;
  source: { styleguide: boolean; screenshot: boolean; markdownLength: number };
}) {
  return (
    <aside className="grid min-w-0 gap-6 lg:sticky lg:top-8 lg:self-start">
      <SidebarHeader />
      <ScreenshotIngredient domain={domain} screenshot={screenshot} />
      <IdentityIngredient brand={brand} domain={domain} />
      <BackdropIngredient brand={brand} />
      <PaletteIngredient brand={brand} />
      <SourceIngredient source={source} />
    </aside>
  );
}

/* ------------------------------------------------------------ */
/* Sidebar parts                                                */
/* ------------------------------------------------------------ */

function SidebarHeader() {
  return (
    <div className="border-b border-rule pb-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        Ingredients
      </p>
      <p className="mt-1.5 max-w-[28ch] font-mono text-[11px]/5 text-muted/80">
        The raw inputs we handed to the model.
      </p>
    </div>
  );
}

function ScreenshotIngredient({
  domain,
  screenshot,
}: {
  domain: string;
  screenshot: LiveScreenshot;
}) {
  if (screenshot.status === "ready") {
    return (
      <Section
        label="Live screenshot"
        hint="captured just now"
        icon={<Camera className="size-3" />}
      >
        <div className="overflow-hidden rounded-md border border-rule bg-[radial-gradient(circle_at_1px_1px,rgb(10_10_10_/_0.05)_1px,transparent_0)] [background-size:14px_14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshot.url}
            alt={`${domain} screenshot`}
            className="block aspect-[16/10] w-full object-cover object-top"
          />
        </div>
      </Section>
    );
  }

  return (
    <Section
      label="Live screenshot"
      hint={screenshot.status === "none" ? "no capture" : "failed"}
      icon={<Camera className="size-3" />}
    >
      <div className="grid aspect-[16/10] place-items-center rounded-md border border-dashed border-rule bg-paper">
        <div className="grid place-items-center gap-2 text-center">
          <ImageIcon className="size-5 text-muted/60" aria-hidden="true" />
          <p className="font-mono text-[10px] text-muted">
            {screenshot.status === "error"
              ? screenshot.message
              : "Screenshot unavailable for this domain."}
          </p>
        </div>
      </div>
    </Section>
  );
}

function IdentityIngredient({
  brand,
  domain,
}: {
  brand?: LiveBrand;
  domain: string;
}) {
  const colors = brand?.colors ?? [];
  const primary = colors[0]?.hex ?? "#0a0a0a";
  const accent = colors[1]?.hex ?? primary;
  const name = brand?.name ?? domain;

  const lightLogo = pickLogoForSurface(brand?.logos, "light", "logo");
  const darkMark = pickLogoForSurface(brand?.logos, "dark", "icon");

  return (
    <Section
      label="Identity"
      hint="logo · mark"
      icon={<Layers className="size-3" />}
    >
      <div className="grid grid-cols-2 gap-2">
        <Slot caption="Logo · light" surface="bg-paper">
          {lightLogo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightLogo.url}
              alt={`${name} logo`}
              className="max-h-10 max-w-[70%] object-contain"
              style={{
                filter: shouldInvert(lightLogo, "light")
                  ? "brightness(0)"
                  : "none",
              }}
            />
          ) : (
            <Initial name={name} />
          )}
        </Slot>
        <Slot
          caption="Mark · brand"
          surfaceStyle={{
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
          }}
        >
          {darkMark?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={darkMark.url}
              alt={`${name} mark`}
              className="max-h-10 max-w-[70%] object-contain"
              style={{
                filter: shouldInvert(darkMark, "dark")
                  ? "brightness(0) invert(1)"
                  : "none",
              }}
            />
          ) : (
            <Initial name={name} dark />
          )}
        </Slot>
      </div>
    </Section>
  );
}

function BackdropIngredient({ brand }: { brand?: LiveBrand }) {
  const backdrop = brand?.backdrop;
  const colors = brand?.colors ?? [];
  const primary = colors[0]?.hex ?? "#0a0a0a";
  const accent = colors[1]?.hex ?? primary;
  const accentColors = (backdrop?.colors ?? []).slice(0, 4);

  return (
    <Section
      label="Backdrop"
      hint={backdrop?.url ? "image · accents" : "synthesised"}
      icon={<ImageIcon className="size-3" />}
    >
      <div className="overflow-hidden rounded-md border border-rule">
        <div className="relative aspect-[5/3] overflow-hidden">
          {backdrop?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backdrop.url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
              }}
            />
          )}
        </div>
        {accentColors.length > 0 ? (
          <ul
            role="list"
            className="flex items-center gap-1.5 border-t border-rule bg-paper px-2.5 py-2"
          >
            {accentColors.map((color) => (
              <li
                key={color.hex}
                title={color.hex}
                className="size-3.5 rounded-full ring-1 ring-black/5"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-muted/70">
              {accentColors.length} accents
            </span>
          </ul>
        ) : null}
      </div>
    </Section>
  );
}

function PaletteIngredient({ brand }: { brand?: LiveBrand }) {
  const colors = (brand?.colors ?? []).slice(0, 6);

  if (colors.length === 0) {
    return (
      <Section
        label="Palette"
        hint="no tokens"
        icon={<Palette className="size-3" />}
      >
        <p className="font-mono text-[11px] text-muted">
          No palette extracted from this brand record.
        </p>
      </Section>
    );
  }

  return (
    <Section
      label="Palette"
      hint={`${colors.length} tokens`}
      icon={<Palette className="size-3" />}
    >
      <ul role="list" className="grid grid-cols-3 gap-1.5">
        {colors.map((color) => (
          <li
            key={color.hex}
            title={`${color.hex}${color.name ? ` · ${color.name}` : ""}`}
            className="overflow-hidden rounded-md border border-rule"
          >
            <div
              className="h-9"
              style={{ backgroundColor: color.hex }}
              aria-hidden="true"
            />
            <p className="truncate bg-paper px-1.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              {color.hex.replace("#", "")}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SourceIngredient({
  source,
}: {
  source: { styleguide: boolean; screenshot: boolean; markdownLength: number };
}) {
  return (
    <Section
      label="Source payload"
      hint="context.dev"
      icon={<FileText className="size-3" />}
    >
      <dl className="grid gap-2.5">
        <SourceRow
          label="Styleguide"
          value={source.styleguide ? "loaded" : "missing"}
          ok={source.styleguide}
        />
        <SourceRow
          label="Screenshot"
          value={source.screenshot ? "loaded" : "missing"}
          ok={source.screenshot}
        />
        <SourceRow
          label="Markdown"
          value={`${source.markdownLength.toLocaleString()} chars`}
          ok={source.markdownLength > 0}
          mono
        />
      </dl>
    </Section>
  );
}

/* ------------------------------------------------------------ */
/* Atoms                                                        */
/* ------------------------------------------------------------ */

function Section({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2.5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-ink"
          />
          {icon ? (
            <span className="grid size-3.5 shrink-0 place-items-center text-muted">
              {icon}
            </span>
          ) : null}
          <p className="truncate font-mono text-[11px] uppercase tracking-wide text-ink">
            {label}
          </p>
        </div>
        {hint ? (
          <p className="shrink-0 truncate font-mono text-[10px] uppercase tracking-wide text-muted/70">
            {hint}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function Slot({
  caption,
  surface,
  surfaceStyle,
  children,
}: {
  caption: string;
  surface?: string;
  surfaceStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-md border border-rule">
      <div
        className={`relative grid aspect-[5/3] place-items-center overflow-hidden ${surface ?? ""}`}
        style={surfaceStyle}
      >
        {children}
      </div>
      <figcaption className="border-t border-rule bg-paper px-2 py-1.5">
        <p className="truncate font-mono text-[10px] uppercase tracking-wide text-muted/80">
          {caption}
        </p>
      </figcaption>
    </figure>
  );
}

function Initial({ name, dark = false }: { name: string; dark?: boolean }) {
  return (
    <span
      className={`grid size-9 place-items-center rounded-lg font-mono text-base font-semibold ${
        dark ? "bg-paper text-ink" : "bg-ink text-paper"
      }`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function SourceRow({
  label,
  value,
  ok,
  mono = false,
}: {
  label: string;
  value: string;
  ok: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-muted">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${ok ? "bg-ink" : "bg-muted/40"}`}
        />
        {label}
      </dt>
      <dd
        className={`text-base/6 font-medium text-ink sm:text-sm/5 ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Notice({
  tone,
  title,
  body,
}: {
  tone: "warn" | "error";
  title: string;
  body: string;
}) {
  const toneClass =
    tone === "warn"
      ? "border-amber-700/20 bg-amber-50 text-amber-950"
      : "border-red-700/20 bg-red-50 text-red-950";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-base/6 font-medium sm:text-sm/5">{title}</p>
      <p className="mt-2 max-w-[72ch] text-base/7 sm:text-sm/6">{body}</p>
    </div>
  );
}
