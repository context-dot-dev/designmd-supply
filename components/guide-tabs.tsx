"use client";

import { useMemo, useState } from "react";
import { MarkdownCopyBlock } from "@/components/markdown-copy-block";
import {
  deriveCssVariables,
  deriveTailwindTheme,
} from "@/lib/derive-tokens";
import type { LiveBrand, LiveStyleguide } from "@/lib/api-types";

type TabId = "design" | "tailwind" | "css";

type Props = {
  domain: string;
  designMd: string;
  brand?: LiveBrand;
  styleguide?: LiveStyleguide | null;
};

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: "design", label: "DESIGN.md", hint: "raw markdown" },
  { id: "tailwind", label: "Tailwind v4", hint: "@theme block" },
  { id: "css", label: "CSS variables", hint: ":root tokens" },
];

export function GuideTabs({ domain, designMd, brand, styleguide }: Props) {
  const [active, setActive] = useState<TabId>("design");

  const tailwind = useMemo(
    () => deriveTailwindTheme(domain, brand, styleguide),
    [domain, brand, styleguide],
  );
  const cssVars = useMemo(
    () => deriveCssVariables(domain, brand, styleguide),
    [domain, brand, styleguide],
  );

  const content =
    active === "design" ? designMd : active === "tailwind" ? tailwind : cssVars;
  const filename =
    active === "design"
      ? `${domain}/DESIGN.md`
      : active === "tailwind"
        ? `${domain}/theme.css`
        : `${domain}/tokens.css`;

  return (
    <div className="grid gap-3">
      <div
        role="tablist"
        aria-label="Design token formats"
        className="flex flex-wrap items-center gap-1 rounded-lg border border-rule bg-paper p-1"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`guide-tab-${tab.id}`}
              id={`guide-tab-trigger-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`group flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition sm:flex-none sm:justify-start ${
                isActive
                  ? "bg-ink text-paper shadow-[0_8px_24px_-12px_rgb(10_10_10_/_0.35)]"
                  : "text-muted hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              <span className="truncate font-mono text-xs font-medium tracking-wide">
                {tab.label}
              </span>
              <span
                className={`hidden truncate font-mono text-[10px] uppercase tracking-wide sm:inline ${
                  isActive ? "text-paper/60" : "text-muted/60"
                }`}
              >
                {tab.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`guide-tab-${active}`}
        aria-labelledby={`guide-tab-trigger-${active}`}
      >
        <MarkdownCopyBlock
          key={active}
          filename={filename}
          content={content}
        />
      </div>
    </div>
  );
}
