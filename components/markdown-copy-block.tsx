"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  filename: string;
  content: string;
};

export function MarkdownCopyBlock({ filename, content }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const lineCount = content.split("\n").length;
  const charCount = content.length;

  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-ink shadow-[0_24px_60px_-30px_rgb(10_10_10_/_0.35)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
        <div
          className="hidden shrink-0 items-center gap-1.5 sm:flex"
          aria-hidden="true"
        >
          <span className="size-2.5 rounded-full bg-paper/15" />
          <span className="size-2.5 rounded-full bg-paper/15" />
          <span className="size-2.5 rounded-full bg-paper/15" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm/5 text-paper sm:text-xs">
            {filename}
          </p>
        </div>
        <p className="hidden shrink-0 font-mono text-xs tabular-nums text-paper/45 sm:block">
          {lineCount} lines · {charCount.toLocaleString()} chars
        </p>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy DESIGN.md"}
          className="relative inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-sm/5 text-paper transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:text-xs"
        >
          {copied ? (
            <>
              <Check className="size-4 sm:size-3.5" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-4 sm:size-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="guide-code overflow-auto px-4 py-4 font-mono text-[0.8125rem]/6 text-paper/95 sm:max-h-[36rem] sm:px-5">
        <code className="whitespace-pre-wrap break-words">{content}</code>
      </pre>
    </div>
  );
}
