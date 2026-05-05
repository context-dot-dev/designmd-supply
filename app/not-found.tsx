import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70dvh] w-full max-w-3xl place-items-center px-5 py-16 text-center sm:px-8">
      <div className="grid gap-6">
        <p className="font-mono text-base/6 uppercase tracking-wide text-muted sm:text-xs">
          404 — out of stock
        </p>
        <h1 className="max-w-[20ch] text-4xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
          That style guide is not on the shelf.
        </h1>
        <p className="mx-auto max-w-[58ch] text-base/7 text-pretty text-muted">
          Try a different domain from the supply.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-base/5 font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Browse the directory
          </Link>
        </div>
      </div>
    </main>
  );
}
