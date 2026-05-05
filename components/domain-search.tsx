"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { normalizeDomain } from "@/lib/domain";

export function DomainSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeDomain(value);

    if (!normalized) {
      setError("Enter a valid domain, like linear.app or stripe.com.");
      return;
    }

    setError("");
    setPending(true);
    router.push(`/guides/${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2">
      <div className="relative flex h-14 items-center rounded-full border border-rule bg-white pl-6 pr-2 transition focus-within:border-ink/40 focus-within:ring-4 focus-within:ring-ink/5">
        <input
          aria-label="Domain"
          name="domain"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="enter a domain — e.g. linear.app"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) {
              setError("");
            }
          }}
          className="grow bg-transparent text-base/6 text-ink outline-none placeholder:text-muted/70 sm:text-sm/5"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Generate style guide"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-ink/30"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error ? (
        <p className="min-h-5 px-2 text-base/6 text-red-700 sm:text-sm/5">
          {error}
        </p>
      ) : null}
    </form>
  );
}
