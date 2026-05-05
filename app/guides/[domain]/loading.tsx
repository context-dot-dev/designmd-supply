"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LoadingCanvas } from "@/components/loading-canvas";

export default function Loading() {
  const pathname = usePathname();

  const domain = useMemo(() => {
    const last = pathname?.split("/").filter(Boolean).pop() ?? "";
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  }, [pathname]);

  // No brand seed here — when this fallback is showing, the server component
  // hasn't returned yet and we have no synchronous source for cached brand
  // data on the client. The orchestrator hydrates from Turso a moment later.
  return (
    <LoadingCanvas
      domain={domain}
      brand={undefined}
      screenshot={{ status: "none" }}
      styleguide={null}
      progress={{
        brand: "loading",
        styleguide: "loading",
        screenshot: "loading",
        design: "idle",
      }}
    />
  );
}
