import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "designmd.supply",
    template: "%s — designmd.supply",
  },
  description: "A minimal supply of generated DESIGN.md for any domain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <script
          async
          src="https://plausible.io/js/pa-2NMJub8G8j1KD1nTGrH6n.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
          }}
        />
      </head>
      <body className="min-h-dvh bg-paper font-sans text-ink">
        <div className="isolate flex min-h-dvh flex-col">
          <a
            href="https://github.com/context-dot-dev/designmd-supply"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper/80 px-3.5 py-1.5 text-sm font-medium text-ink shadow-sm backdrop-blur transition hover:border-ink/20 hover:bg-paper sm:right-6 sm:top-6"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            <span>open source</span>
          </a>
          <a
            href="https://context.dev/?utm_source=designmd.supply&utm_medium=widget&utm_campaign=powered_by"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by context.dev — opens in a new tab"
            className="px-4 py-2 fixed bottom-4 right-4 z-40 inline-flex items-center gap-1 rounded-full bg-[#2663eb] text-xs font-medium text-white/85 shadow-lg shadow-[#2663eb]/30 ring-1 ring-inset ring-white/15 transition-transform duration-200 hover:-translate-y-0.5 hover:text-white sm:bottom-6 sm:right-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="flex items-center space-x-2">
              <img
                src="/context-logo.png"
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0 rounded-md"
              />
              <span className="font-semibold text-white">Context.dev</span>
            </div>
          </a>
          <div className="grow">{children}</div>
          <Analytics />
        </div>
      </body>
    </html>
  );
}
