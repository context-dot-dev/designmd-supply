import Link from "next/link";

export type DirectoryCard = {
  name: string;
  title: string;
  domain: string;
  industry: string | null;
  colors: { hex: string; name: string | null }[];
  fallbackColor: string;
  screenshotUrl: string | null;
  markUrl: string | null;
};

type Props = {
  cards: DirectoryCard[];
};

export function DomainDirectory({ cards }: Props) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
    >
      {cards.map((card) => (
        <li key={card.domain}>
          <BrandCard card={card} />
        </li>
      ))}
    </ul>
  );
}

function BrandCard({ card }: { card: DirectoryCard }) {
  const meta = card.industry
    ? `${card.domain} · ${card.industry}`
    : card.domain;

  return (
    <Link
      href={`/guides/${card.domain}`}
      className="group block overflow-hidden rounded-2xl border border-rule bg-paper transition hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[0_18px_40px_-22px_rgb(10_10_10_/_0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ backgroundColor: card.fallbackColor }}
      >
        {card.screenshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.screenshotUrl}
            alt=""
            aria-hidden="true"
            className="size-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : card.markUrl ? (
          <div className="grid size-full place-items-center">
            <div className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white outline-1 -outline-offset-1 outline-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.markUrl}
                alt=""
                aria-hidden="true"
                className="size-10 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 outline-1 -outline-offset-1 outline-black/5"
        />
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white outline-1 -outline-offset-1 outline-black/5">
          {card.markUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.markUrl}
              alt=""
              aria-hidden="true"
              className="size-6 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="font-mono text-sm font-semibold text-ink">
              {card.name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight text-ink">
            {card.title || card.name}
          </p>
          <p className="truncate font-mono text-[11px] text-muted/80">{meta}</p>
        </div>
        <Swatches colors={card.colors} />
      </div>
    </Link>
  );
}

function Swatches({
  colors,
}: {
  colors: { hex: string; name: string | null }[];
}) {
  if (!colors.length) {
    return <span className="text-xs text-muted/60">—</span>;
  }

  return (
    <ul role="list" className="flex shrink-0 items-center -space-x-1">
      {colors.map((color) => (
        <li
          key={color.hex}
          title={`${color.hex}${color.name ? ` · ${color.name}` : ""}`}
          aria-label={color.name ?? color.hex}
          className="size-4 rounded-full ring-2 ring-paper"
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </ul>
  );
}
