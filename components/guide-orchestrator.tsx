"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { domainToUrl } from "@/lib/domain";
import type {
  DesignMdResponse,
  LiveBrand,
  LiveScreenshot,
  LiveStyleguide,
} from "@/lib/api-types";
import {
  LoadingCanvas,
  type CanvasProgress,
} from "@/components/loading-canvas";
import { DesignMdArticle, IngredientsSidebar } from "@/components/guide-canvas";

type Status = "loading" | "ready" | "none" | "error";
type DesignStatus = "idle" | "loading" | "ready" | "error";

type Props = {
  domain: string;
  initialBrand?: LiveBrand;
};

export function GuideOrchestrator({ domain, initialBrand }: Props) {
  const [brand, setBrand] = useState<LiveBrand | undefined>(initialBrand);
  const [brandStatus, setBrandStatus] = useState<Status>("loading");

  const [styleguide, setStyleguide] = useState<LiveStyleguide | null>(null);
  const [styleguideStatus, setStyleguideStatus] = useState<Status>("loading");

  const [screenshot, setScreenshot] = useState<LiveScreenshot>({
    status: "none",
  });
  const [screenshotStatus, setScreenshotStatus] = useState<Status>("loading");

  const [designMd, setDesignMd] = useState<DesignMdResponse | null>(null);

  const designKickedOffRef = useRef(false);
  const transitioningRef = useRef(false);
  const [transitioning, setTransitioning] = useState(false);

  // Derived rather than stored: setting "loading" synchronously inside the
  // kickoff effect triggers React 19's set-state-in-effect lint, and we can
  // get the same value from the inputs we already have.
  const allIngredientsSettled =
    brandStatus !== "loading" &&
    styleguideStatus !== "loading" &&
    screenshotStatus !== "loading";
  const designStatus: DesignStatus = !allIngredientsSettled
    ? "idle"
    : designMd === null
      ? "loading"
      : designMd.status === "ready"
        ? "ready"
        : "error";

  // Fan out the three independent calls in parallel as soon as we mount.
  useEffect(() => {
    const ctrl = new AbortController();
    const q = `domain=${encodeURIComponent(domain)}`;

    fetch(`/api/brand?${q}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`brand ${r.status}`);
        return (await r.json()) as LiveBrand;
      })
      .then((b) => {
        setBrand(b);
        setBrandStatus("ready");
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        // Keep whatever the server seeded from Turso, but mark the live call
        // as errored so the canvas can stop pulsing.
        console.warn("brand call failed", err);
        setBrandStatus("error");
      });

    fetch(`/api/styleguide?${q}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`styleguide ${r.status}`);
        return (await r.json()) as { styleguide: LiveStyleguide | null };
      })
      .then((data) => {
        setStyleguide(data.styleguide);
        setStyleguideStatus(data.styleguide ? "ready" : "none");
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        console.warn("styleguide call failed", err);
        setStyleguideStatus("error");
      });

    fetch(`/api/screenshot?${q}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`screenshot ${r.status}`);
        return (await r.json()) as LiveScreenshot;
      })
      .then((s) => {
        setScreenshot(s);
        setScreenshotStatus(
          s.status === "ready"
            ? "ready"
            : s.status === "none"
              ? "none"
              : "error",
        );
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        console.warn("screenshot call failed", err);
        setScreenshotStatus("error");
      });

    return () => ctrl.abort();
  }, [domain]);

  // Once all three ingredients have settled (either with data or an error
  // we can route around), kick off the DESIGN.md compose call exactly once.
  useEffect(() => {
    if (!allIngredientsSettled) return;
    if (designKickedOffRef.current) return;
    designKickedOffRef.current = true;

    // Try the cacheable GET first (Turso fast path — browser + Vercel CDN
    // cache it). On a miss, POST to generate fresh.
    (async () => {
      try {
        const hit = await fetch(
          `/api/design-md?domain=${encodeURIComponent(domain)}`,
        ).then(async (r) => (await r.json()) as DesignMdResponse);
        if (hit.status === "ready") {
          setDesignMd(hit);
          return;
        }

        const fresh = await fetch("/api/design-md", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            domain,
            styleguide,
            screenshotUrl:
              screenshot.status === "ready" ? screenshot.url : null,
          }),
        }).then(async (r) => (await r.json()) as DesignMdResponse);
        setDesignMd(fresh);
      } catch (err) {
        console.warn("design-md call failed", err);
        setDesignMd({
          status: "error",
          message:
            err instanceof Error ? err.message : "DESIGN.md compose failed",
        });
      }
    })();
  }, [allIngredientsSettled, domain, screenshot, styleguide]);

  // Hold the canvas a tick after design-md lands so the final transition
  // doesn't feel like a cut.
  useEffect(() => {
    if (
      designStatus !== "ready" &&
      designStatus !== "error" &&
      !(designMd?.status === "missing-env")
    )
      return;
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    const t = window.setTimeout(() => setTransitioning(true), 150);
    return () => window.clearTimeout(t);
  }, [designStatus, designMd]);

  const progress: CanvasProgress = useMemo(
    () => ({
      brand: brandStatus,
      styleguide: styleguideStatus,
      screenshot: screenshotStatus,
      design: designStatus,
    }),
    [brandStatus, styleguideStatus, screenshotStatus, designStatus],
  );

  if (!transitioning) {
    return (
      <LoadingCanvas
        domain={domain}
        brand={brand}
        screenshot={screenshot}
        styleguide={styleguide}
        progress={progress}
      />
    );
  }

  const designStatusForArticle: "ready" | "missing-env" | "error" =
    designMd?.status === "ready"
      ? "ready"
      : designMd?.status === "missing-env"
        ? "missing-env"
        : "error";

  const message =
    designMd?.status === "missing-env"
      ? `Add ${designMd.missing.join(", ")} from .env.example and reload.`
      : designMd?.status === "error"
        ? designMd.message
        : undefined;

  const markdownLength =
    designMd?.status === "ready" ? designMd.markdownLength : 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-16 sm:px-8 sm:pt-12 sm:pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-base/6 text-muted transition hover:text-ink sm:text-xs"
      >
        <ArrowLeft className="size-4 sm:size-3.5" aria-hidden="true" />
        Back to supply
      </Link>

      <header className="mt-6 grid gap-3 border-b border-rule pb-6 sm:mt-8 sm:pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {brand?.industry?.industry ?? "DESIGN.md"}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className="max-w-[20ch] text-4xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
            {brand?.title ?? domain}
          </h1>
          <a
            href={domainToUrl(domain)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted transition hover:text-ink sm:text-[11px]"
          >
            {domain}
            <ExternalLink className="size-3.5 sm:size-3" aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <DesignMdArticle
          domain={domain}
          designMd={
            designMd?.status === "ready" ? designMd.designMd : undefined
          }
          status={designStatusForArticle}
          message={message}
          brand={brand}
          styleguide={styleguide}
        />
        <IngredientsSidebar
          brand={brand}
          domain={domain}
          screenshot={screenshot}
          source={{
            styleguide: styleguideStatus === "ready",
            screenshot: screenshotStatus === "ready",
            markdownLength,
          }}
        />
      </div>
    </main>
  );
}
