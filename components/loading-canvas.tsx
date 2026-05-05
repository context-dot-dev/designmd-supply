"use client";

import { Camera, Code2, FileText, Layers, Palette, Type } from "lucide-react";
import type {
  LiveBrand,
  LiveScreenshot,
  LiveStyleguide,
} from "@/lib/api-types";
import { pickLogoForSurface, shouldInvert } from "@/lib/logo-pick";

type FloaterPosition = {
  className: string;
  rot: number;
  enterDelay: number;
  bobbleDelay: number;
};

type Status = "loading" | "ready" | "none" | "error";

export type CanvasProgress = {
  brand: Status;
  styleguide: Status;
  screenshot: Status;
  design: "idle" | "loading" | "ready" | "error";
};

export function LoadingCanvas({
  domain,
  brand,
  screenshot,
  styleguide,
  progress,
}: {
  domain: string;
  brand?: LiveBrand;
  screenshot: LiveScreenshot;
  styleguide?: LiveStyleguide | null;
  progress: CanvasProgress;
}) {
  const displayName = brand?.title ?? brand?.name ?? domain;
  const industry = brand?.industry?.industry ?? "DESIGN.md";
  const colors = brand?.colors ?? [];
  const primary = colors[0]?.hex ?? "#0a0a0a";
  const accent = colors[1]?.hex ?? primary;
  const onPrimary = readableOn(primary);
  const onAccent = readableOn(accent);
  const backdrop = brand?.backdrop;

  const lightLogo = pickLogoForSurface(brand?.logos, "light", "logo");
  const darkMark = pickLogoForSurface(brand?.logos, "dark", "icon");

  const positions: Record<string, FloaterPosition> = {
    logo: {
      className:
        "absolute left-[3vw] top-[12vh] w-52 sm:left-[6vw] sm:top-[14vh] sm:w-60",
      rot: -4,
      enterDelay: 350,
      bobbleDelay: 0,
    },
    palette: {
      className:
        "absolute right-[3vw] top-[10vh] w-56 sm:right-[6vw] sm:top-[12vh] sm:w-64",
      rot: 3,
      enterDelay: 500,
      bobbleDelay: 1.4,
    },
    backdrop: {
      className:
        "hidden md:block absolute left-[14vw] top-[42vh] w-56 -translate-y-1/2",
      rot: -2,
      enterDelay: 650,
      bobbleDelay: 2.8,
    },
    components: {
      className:
        "absolute left-[3vw] bottom-[14vh] w-72 sm:left-[8vw] sm:bottom-[16vh] sm:w-80",
      rot: 2,
      enterDelay: 800,
      bobbleDelay: 0.6,
    },
    screenshot: {
      className:
        "hidden md:block absolute right-[6vw] bottom-[14vh] w-64 sm:right-[8vw] sm:bottom-[16vh] sm:w-72",
      rot: -3,
      enterDelay: 950,
      bobbleDelay: 3.6,
    },
    swatches: {
      className: "hidden lg:block absolute right-[14vw] top-[44vh] w-44",
      rot: 4,
      enterDelay: 1100,
      bobbleDelay: 2,
    },
  };

  const sgButtons = styleguide?.components?.button;
  const styleguideReady = progress.styleguide === "ready";
  const screenshotReady =
    progress.screenshot === "ready" && screenshot.status === "ready";
  const brandReady = progress.brand === "ready";

  return (
    <div
      className="canvas-stage bg-paper text-ink"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">
        Generating DESIGN.md for {domain}. About a minute for new domains.
      </span>

      <BackdropLayer
        url={backdrop?.url}
        primary={primary}
        accent={accent}
        ready={brandReady}
      />
      <div className="canvas-grain pointer-events-none absolute inset-0" />
      <div className="canvas-vignette pointer-events-none absolute inset-0" />

      {/* Top status bar */}
      <header className="canvas-fade absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-10 sm:py-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px]">
          designmd.supply
        </p>
        <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px]">
          {progress.design === "loading" ? "composing" : "fetching"}
          <span className="inline-flex items-center gap-1">
            <span className="canvas-dot size-1 rounded-full bg-ink" />
            <span className="canvas-dot canvas-dot-2 size-1 rounded-full bg-ink" />
            <span className="canvas-dot canvas-dot-3 size-1 rounded-full bg-ink" />
          </span>
        </p>
      </header>

      {/* Centered title */}
      <div className="pointer-events-none absolute inset-0 z-0 grid place-items-center px-6 text-center">
        <div>
          <p
            className="canvas-rise font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:text-xs"
            style={{ animationDelay: "100ms" } as React.CSSProperties}
          >
            {industry}
          </p>
          <h1
            className="canvas-rise mt-4 max-w-[14ch] mx-auto text-5xl font-medium tracking-tight text-balance sm:text-7xl md:text-8xl"
            style={{ animationDelay: "220ms" } as React.CSSProperties}
          >
            {displayName}
          </h1>
          <p
            className="canvas-rise mt-4 inline-flex items-baseline font-mono text-sm text-muted sm:text-base"
            style={{ animationDelay: "340ms" } as React.CSSProperties}
          >
            <span>{domain}</span>
            <span className="caret" aria-hidden="true" />
          </p>
          {brand?.slogan ? (
            <p
              className="canvas-rise mt-6 max-w-[44ch] mx-auto text-pretty text-base/7 text-muted sm:text-lg/8"
              style={{ animationDelay: "460ms" } as React.CSSProperties}
            >
              {brand.slogan}
            </p>
          ) : null}
        </div>
      </div>

      {/* Logo */}
      <Floater position={positions.logo}>
        <Card>
          <CardHeader
            icon={<Layers className="size-3" />}
            label="Logo"
            hint={progress.brand === "ready" ? "ready" : "loading"}
          >
            <Pulse active={progress.brand === "loading"} />
          </CardHeader>
          <div
            className="grid h-28 place-items-center"
            style={{ backgroundColor: "#fbfaf6" }}
          >
            {lightLogo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightLogo.url}
                alt=""
                className="max-h-12 max-w-[70%] object-contain transition-opacity duration-500"
                style={{
                  filter: shouldInvert(lightLogo, "light")
                    ? "brightness(0)"
                    : "none",
                }}
              />
            ) : (
              <span
                className={`grid size-12 place-items-center rounded-xl bg-ink/5 font-mono text-lg font-semibold text-ink/40 transition ${
                  progress.brand === "loading" ? "animate-pulse" : ""
                }`}
              >
                {(brand?.name ?? domain).slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </Card>
      </Floater>

      {/* Palette */}
      <Floater position={positions.palette}>
        <Card>
          <CardHeader
            icon={<Palette className="size-3" />}
            label="Palette"
            hint={
              colors.length
                ? `${colors.length} tokens`
                : progress.brand === "loading"
                  ? "loading"
                  : "—"
            }
          >
            <Pulse active={progress.brand === "loading" && !colors.length} />
          </CardHeader>
          <div className="p-3">
            <div className="grid grid-cols-5 gap-1.5">
              {(colors.length ? colors : Array.from({ length: 5 }))
                .slice(0, 5)
                .map((c, i) => {
                  const hex = (c as { hex?: string })?.hex ?? "#0a0a0a";
                  const opacity = c ? 1 : 0.08;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded ring-1 ring-black/5 transition-opacity duration-500"
                      style={{ backgroundColor: hex, opacity }}
                    />
                  );
                })}
            </div>
            {colors[0] ? (
              <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-wide text-muted/80">
                {colors[0].hex}
              </p>
            ) : (
              <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-wide text-muted/40">
                — — — — — —
              </p>
            )}
          </div>
        </Card>
      </Floater>

      {/* Backdrop */}
      <Floater position={positions.backdrop}>
        <Card padded={false}>
          <CardHeader
            icon={<Layers className="size-3" />}
            label="Backdrop"
            hint={
              backdrop?.url
                ? "image"
                : progress.brand === "loading"
                  ? "loading"
                  : "synth"
            }
          >
            <Pulse active={progress.brand === "loading" && !backdrop} />
          </CardHeader>
          <div className="relative aspect-[5/3] overflow-hidden">
            {backdrop?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backdrop.url}
                alt=""
                className="absolute inset-0 size-full object-cover transition-opacity duration-700"
              />
            ) : (
              <div
                className="absolute inset-0 transition"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                }}
              />
            )}
            {progress.brand === "loading" && !backdrop?.url ? (
              <div className="shimmer-sweep absolute inset-0" />
            ) : null}
          </div>
        </Card>
      </Floater>

      {/* Components — morphs from synthetic brand-color buttons to real
          styleguide-extracted button CSS once that call resolves. */}
      <Floater position={positions.components}>
        <Card>
          <CardHeader
            icon={<Code2 className="size-3" />}
            label="Components"
            hint={
              styleguideReady
                ? "extracted"
                : progress.styleguide === "loading"
                  ? "extracting"
                  : "buttons"
            }
          >
            <Pulse active={progress.styleguide === "loading"} />
          </CardHeader>
          <div className="grid gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              {styleguideReady && sgButtons?.primary ? (
                <button
                  type="button"
                  style={cssTextToObject(sgButtons.primary.css)}
                  className="text-xs font-medium"
                >
                  Primary
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: primary, color: onPrimary }}
                >
                  Primary
                </button>
              )}
              {styleguideReady && sgButtons?.secondary ? (
                <button
                  type="button"
                  style={cssTextToObject(sgButtons.secondary.css)}
                  className="text-xs font-medium"
                >
                  Secondary
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: withAlpha(primary, 0.25),
                    color: primary,
                    backgroundColor: "#fbfaf6",
                  }}
                >
                  Secondary
                </button>
              )}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                style={{ backgroundColor: accent, color: onAccent }}
              >
                Badge
              </span>
            </div>
            <div
              className="flex items-center gap-2 rounded-md border px-2.5 py-2"
              style={{
                borderColor: withAlpha(primary, 0.18),
                backgroundColor: "#fbfaf6",
              }}
            >
              <Type className="size-3 text-muted" aria-hidden="true" />
              <span className="font-mono text-[11px] text-muted">
                hello@{domain}
              </span>
            </div>
          </div>
        </Card>
      </Floater>

      {/* Screenshot */}
      <Floater position={positions.screenshot}>
        <Card padded={false}>
          <CardHeader
            icon={<Camera className="size-3" />}
            label="Live screenshot"
            hint={
              screenshotReady
                ? "captured"
                : progress.screenshot === "loading"
                  ? "capturing"
                  : "n/a"
            }
          >
            <Pulse
              active={progress.screenshot === "loading" && !screenshotReady}
            />
          </CardHeader>
          <div className="relative aspect-[16/10] overflow-hidden bg-rule/40">
            {screenshotReady ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(screenshot as { url: string }).url}
                alt=""
                className="absolute inset-0 size-full object-cover object-top transition-opacity duration-700"
              />
            ) : backdrop?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backdrop.url}
                alt=""
                className="absolute inset-0 size-full object-cover opacity-60"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                }}
              />
            )}
            {!screenshotReady ? (
              <div className="shimmer-sweep absolute inset-0 bg-transparent" />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-ink/70 px-3 py-2 text-paper backdrop-blur-sm">
              <Camera className="size-3" aria-hidden="true" />
              <span className="truncate font-mono text-[10px] uppercase tracking-wide">
                {domain}
              </span>
            </div>
          </div>
        </Card>
      </Floater>

      {/* Mark on dark surface */}
      <Floater position={positions.swatches}>
        <Card padded={false}>
          <CardHeader icon={<Layers className="size-3" />} label="Mark · dark">
            <Pulse active={progress.brand === "loading" && !darkMark} />
          </CardHeader>
          <div
            className="grid h-24 place-items-center"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
            }}
          >
            {darkMark?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={darkMark.url}
                alt=""
                className="max-h-10 max-w-[70%] object-contain transition-opacity duration-500"
                style={{
                  filter: shouldInvert(darkMark, "dark")
                    ? "brightness(0) invert(1)"
                    : "none",
                }}
              />
            ) : (
              <span
                className="grid size-10 place-items-center rounded-lg font-mono text-base font-semibold"
                style={{ backgroundColor: onPrimary, color: primary }}
              >
                {(brand?.name ?? domain).slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        </Card>
      </Floater>

      {/* Bottom status: progress + steps */}
      <footer
        className="canvas-fade absolute inset-x-0 bottom-0 z-10 px-5 py-5 sm:px-10 sm:py-7"
        style={{ animationDelay: "1400ms" } as React.CSSProperties}
      >
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink sm:text-[11px]">
              <FileText className="size-3" aria-hidden="true" />
              {progress.design === "loading"
                ? "Composing DESIGN.md"
                : "Gathering ingredients"}
            </p>
            <p className="mt-1 truncate font-mono text-[10px] text-muted/70 sm:text-[11px]">
              <StepDot ok={brandReady} active={progress.brand === "loading"} />
              brand
              <span className="mx-1.5 text-muted/40">·</span>
              <StepDot
                ok={styleguideReady}
                active={progress.styleguide === "loading"}
              />
              styleguide
              <span className="mx-1.5 text-muted/40">·</span>
              <StepDot
                ok={progress.screenshot === "ready"}
                active={progress.screenshot === "loading"}
              />
              screenshot
              <span className="mx-1.5 text-muted/40">·</span>
              <StepDot
                ok={progress.design === "ready"}
                active={progress.design === "loading"}
              />
              design.md
            </p>
          </div>
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px]">
            v1
          </p>
        </div>
        <div className="canvas-progress relative mt-4 h-px w-full overflow-hidden bg-rule" />
      </footer>
    </div>
  );
}

function BackdropLayer({
  url,
  primary,
  accent,
  ready,
}: {
  url?: string;
  primary: string;
  accent: string;
  ready: boolean;
}) {
  return (
    <div className="canvas-fade absolute inset-0">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-25 blur-2xl transition-opacity duration-1000"
        />
      ) : null}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: ready ? 0.5 : 0.4,
          background: `radial-gradient(60vmax 60vmax at 25% 30%, ${withAlpha(primary, 0.18)}, transparent 60%), radial-gradient(50vmax 50vmax at 75% 70%, ${withAlpha(accent, 0.22)}, transparent 60%)`,
        }}
      />
    </div>
  );
}

function Floater({
  position,
  children,
}: {
  position: FloaterPosition;
  children: React.ReactNode;
}) {
  return (
    <div className={position.className}>
      <div
        className="canvas-bobble"
        style={
          {
            "--bobble-delay": `${position.bobbleDelay}s`,
          } as React.CSSProperties
        }
      >
        <div
          className="canvas-tilt"
          style={{ "--rot": `${position.rot}deg` } as React.CSSProperties}
        >
          <div
            className="canvas-card-enter"
            style={
              {
                "--enter-delay": `${position.enterDelay}ms`,
              } as React.CSSProperties
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-rule bg-white shadow-[0_30px_60px_-30px_rgb(10_10_10_/_0.25)]">
      {children}
    </article>
  );
}

function CardHeader({
  icon,
  label,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-rule px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        {children ?? (
          <span
            className="size-1.5 shrink-0 rounded-full bg-ink/60"
            aria-hidden="true"
          />
        )}
        <span className="grid size-3.5 shrink-0 place-items-center text-muted">
          {icon}
        </span>
        <p className="truncate font-mono text-[10px] uppercase tracking-wide text-muted">
          {label}
        </p>
      </div>
      {hint ? (
        <p className="shrink-0 truncate font-mono text-[10px] uppercase tracking-wide text-muted/70">
          {hint}
        </p>
      ) : null}
    </header>
  );
}

function Pulse({ active }: { active: boolean }) {
  return (
    <span
      className={`size-1.5 shrink-0 rounded-full ${active ? "bg-ink/70 canvas-dot" : "bg-ink/30"}`}
      aria-hidden="true"
    />
  );
}

function StepDot({ ok, active }: { ok: boolean; active: boolean }) {
  return (
    <span
      className={`mr-1 inline-block size-1 rounded-full align-middle ${
        ok ? "bg-ink" : active ? "bg-ink/60 canvas-dot" : "bg-muted/30"
      }`}
      aria-hidden="true"
    />
  );
}

function readableOn(hex: string): string {
  const c = hex.replace("#", "").trim();
  if (c.length !== 3 && c.length !== 6) return "#0a0a0a";
  const expanded =
    c.length === 3
      ? c
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : c;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#0a0a0a" : "#fbfaf6";
}

function withAlpha(hex: string, alpha: number): string {
  const c = hex.replace("#", "").trim();
  if (c.length !== 3 && c.length !== 6) return `rgb(10 10 10 / ${alpha})`;
  const expanded =
    c.length === 3
      ? c
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : c;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

// Convert a Context.dev `css` block ("background-color: #x; padding: 8px;")
// into a React style object so we can apply it without a raw <style> injection.
function cssTextToObject(css?: string): React.CSSProperties {
  if (!css) return {};
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) continue;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  }
  return out as React.CSSProperties;
}
