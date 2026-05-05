/**
 * Pick the right logo asset for a given UI surface.
 *
 * Context.dev `Logo.mode` semantics:
 *   - 'light'                  → designed for LIGHT backgrounds (logo itself is dark-toned)
 *   - 'dark'                   → designed for DARK backgrounds (logo itself is light-toned)
 *   - 'has_opaque_background'  → carries its own background, safe on either side
 *
 * Picking the wrong mode is what was making Apple / Google / Amazon look broken on
 * the white card — they all ship a `mode:'dark'` asset that's invisible on paper.
 */

export type LogoLike = {
  url?: string;
  mode?: "light" | "dark" | "has_opaque_background" | null;
  type?: "icon" | "logo" | null;
};

export type LogoSurface = "light" | "dark";

type Pick = { url: string; mode: LogoLike["mode"]; type: LogoLike["type"] };

export function pickLogoForSurface(
  logos: LogoLike[] | undefined,
  surface: LogoSurface,
  preferType: "logo" | "icon" = "logo",
): Pick | null {
  if (!logos?.length) return null;

  const safe: "light" | "dark" = surface;
  const fallbackSurface: "light" | "dark" = surface === "light" ? "dark" : "light";
  const otherType: "logo" | "icon" = preferType === "logo" ? "icon" : "logo";

  // Tiered preference. Earlier entries win.
  const preferences: Array<(l: LogoLike) => boolean> = [
    (l) => l.mode === safe && l.type === preferType,
    (l) => l.mode === "has_opaque_background" && l.type === preferType,
    (l) => l.mode === safe && l.type === otherType,
    (l) => l.mode === "has_opaque_background" && l.type === otherType,
    // Last resort: a logo built for the *other* surface. We fall through to it
    // only when nothing else exists — the caller may want to invert it.
    (l) => l.mode === fallbackSurface && l.type === preferType,
    (l) => l.mode === fallbackSurface && l.type === otherType,
  ];

  for (const test of preferences) {
    const hit = logos.find((l) => l.url && test(l));
    if (hit?.url) {
      return { url: hit.url, mode: hit.mode ?? null, type: hit.type ?? null };
    }
  }

  // Anything with a URL beats nothing.
  const any = logos.find((l) => l.url);
  return any?.url
    ? { url: any.url, mode: any.mode ?? null, type: any.type ?? null }
    : null;
}

/**
 * True when the picked asset is destined for a surface it wasn't designed for —
 * a single-color silhouette can be inverted as a last resort, but we should
 * only do that when the picker explicitly fell back to the other surface.
 */
export function shouldInvert(pick: Pick | null, surface: LogoSurface): boolean {
  if (!pick) return false;
  if (pick.mode === "has_opaque_background") return false;
  if (surface === "light") return pick.mode === "dark";
  return pick.mode === "light";
}
