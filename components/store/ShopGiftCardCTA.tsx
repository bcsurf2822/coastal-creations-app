import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Gift-card nudge shown beneath the shop grid: for the shopper who can't decide
 * on a specific item, point them at a gift card (usable in store + at events).
 */
export default function ShopGiftCardCTA(): ReactElement {
  return (
    <section className="bg-transparent py-10 md:py-14">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-sky-100 bg-[var(--color-light)] px-6 py-10 text-center shadow-[0_10px_24px_rgba(12,74,110,0.08)] md:flex-row md:gap-12 md:px-12 md:text-left">
          {/* Coastal Creations gift card visual */}
          <div className="w-full max-w-[18rem] shrink-0 rounded-2xl border border-sky-100 bg-white p-3 shadow-[0_14px_24px_rgba(12,74,110,0.14)]">
            <div className="rounded-xl border border-slate-200 bg-[linear-gradient(155deg,#ffffff_0%,#f3f9fd_70%,#e7f3fa_100%)] p-6">
              <div className="mb-5 flex justify-center">
                <Image
                  src="/assets/logos/coastalLogoFull.png"
                  alt="Coastal Creations Studio logo"
                  width={160}
                  height={62}
                  className="h-auto w-auto object-contain"
                />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Digital Gift Card
                </p>
                <p className="text-lg font-bold text-primary">
                  Coastal Creations Studio
                </p>
              </div>
            </div>
          </div>

          {/* Copy + CTA */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <h2 className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">
              Tough to buy for? Let them choose.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              A Coastal Creations gift card is always the right fit — use it here
              in the shop, or for classes, camps, workshops, and walk-in studio
              time.
            </p>
            <Link
              href="/gift-cards"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-default)] bg-[var(--color-primary)] px-6 text-base font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] hover:shadow-lg"
            >
              Buy a Gift Card
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
