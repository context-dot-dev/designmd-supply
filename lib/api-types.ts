import type { LogoLike } from "@/lib/logo-pick";

/**
 * Wire types returned by /api/* and consumed by the client orchestrator.
 * They are intentionally a thin pass-through of the Context.dev shapes
 * (cleaned of vendor types) so the UI can render directly off them.
 */

export type LiveColor = { hex: string; name: string | null };

export type LiveLogo = LogoLike & {
  url: string;
  resolution?: { width?: number; height?: number; aspect_ratio?: number } | null;
};

export type LiveBackdrop = {
  url: string;
  aspect_ratio: number | null;
  colors: LiveColor[];
};

export type LiveIndustry = {
  industry: string;
  subindustry: string;
} | null;

export type LiveBrand = {
  domain: string;
  name: string;
  title: string;
  description: string | null;
  slogan: string | null;
  logos: LiveLogo[];
  backdrop: LiveBackdrop | null;
  colors: LiveColor[];
  industry: LiveIndustry;
};

export type LiveScreenshot =
  | { status: "ready"; url: string }
  | { status: "none" }
  | { status: "error"; message: string };

export type LiveStyleguideButton = {
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  padding?: string;
  css?: string;
};

export type LiveStyleguide = {
  // Top-level pass-through of the Context.dev styleguide payload.
  // We only type the fields the UI renders; everything else is forwarded
  // to the design-md generator as-is.
  mode?: "light" | "dark";
  colors?: { accent?: string; background?: string; text?: string };
  components?: {
    button?: {
      primary?: LiveStyleguideButton;
      secondary?: LiveStyleguideButton;
      link?: LiveStyleguideButton;
    };
  };
  typography?: {
    headings?: {
      h1?: { fontFamily?: string; fontSize?: string; fontWeight?: number };
    };
    p?: { fontFamily?: string; fontSize?: string; fontWeight?: number };
  };
  // raw payload for the LLM
  raw?: unknown;
};

export type DesignMdRequest = {
  domain: string;
  styleguide: unknown;
  screenshotUrl?: string | null;
};

export type DesignMdResponse =
  | { status: "ready"; designMd: string; markdownLength: number }
  | { status: "miss" }
  | { status: "missing-env"; missing: string[] }
  | { status: "error"; message: string };
