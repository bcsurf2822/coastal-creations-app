"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useProducts } from "@/hooks/queries/use-products";

const PANEL =
  "relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/82 shadow-[0_18px_34px_rgba(12,74,110,0.14)] backdrop-blur-[2px]";

const GiftCardBanner = (): ReactElement => {
  const router = useRouter();
  const { data: products = [], isLoading } = useProducts();

  // Marquee shows every in-stock item. The track renders the list TWICE so the
  // -50% translate loops seamlessly; speed scales with the item count.
  const marqueeItems = products.filter(
    (item) => item.availability !== "sold_out"
  );
  const marqueeDurationSec = Math.max(24, marqueeItems.length * 5);

  return (
    <section id="gift-cards" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {/* ── Gift cards ─────────────────────────────────────────── */}
        <div className={`${PANEL} px-6 py-10 md:px-10 lg:px-14`}>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Gift Cards
              </p>
              <h2 className="mb-4 text-4xl font-bold leading-tight text-primary md:text-5xl">
                Give the gift of creativity.
              </h2>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-700">
                Send a digital gift card that can be used for classes, camps,
                workshops, private events, and walk-in studio time.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => router.push("/gift-cards")}
              >
                Buy a Gift Card
              </Button>
            </div>

            {/* Gift card visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-2xl border border-sky-100 bg-white p-3 shadow-[0_14px_24px_rgba(12,74,110,0.14)]">
                <div className="rounded-xl border border-slate-200 bg-[linear-gradient(155deg,#ffffff_0%,#f3f9fd_70%,#e7f3fa_100%)] p-7">
                  <div className="mb-6 flex justify-center">
                    <Image
                      src="/assets/logos/coastalLogoFull.png"
                      alt="Coastal Creations Studio logo"
                      width={180}
                      height={70}
                      className="h-auto w-auto object-contain"
                    />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                      Digital Gift Card
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      Coastal Creations Studio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Shop preview ───────────────────────────────────────── */}
        <div className={`${PANEL} px-6 py-10 md:px-10 lg:px-14`}>
          {/* Header: copy left, CTA right (CTA drops below on mobile) */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Shop
              </p>
              <h2 className="mb-3 text-4xl font-bold leading-tight text-primary md:text-5xl">
                Take home a little creativity.
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-slate-700">
                Art kits, studio goods, and works of art from local artists —
                shipped right to your door.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="shrink-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => router.push("/shop")}
            >
              Visit the Shop
            </Button>
          </div>

          {/* Product preview — a continuous right-to-left auto-scroll (no drag),
              image + full name only. Bleeds to the panel edges; fades at sides. */}
          {isLoading ? (
            <div className="flex gap-5 overflow-hidden">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square w-52 shrink-0 animate-pulse rounded-[var(--radius-lg)] bg-sky-100/70"
                />
              ))}
            </div>
          ) : marqueeItems.length > 0 ? (
            <div className="relative -mx-6 overflow-hidden md:-mx-10 lg:-mx-14">
              {/* edge fades */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white/85 to-transparent md:w-16" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white/85 to-transparent md:w-16" />
              <div
                className="animate-marquee flex w-max gap-5 px-6 md:px-10 lg:px-14"
                style={{ animationDuration: `${marqueeDurationSec}s` }}
              >
                {[...marqueeItems, ...marqueeItems].map((item, index) => (
                  <Link
                    key={`${item.squareItemId}-${index}`}
                    href={`/shop/${item.slug}`}
                    aria-hidden={index >= marqueeItems.length}
                    tabIndex={index >= marqueeItems.length ? -1 : undefined}
                    className="group block w-52 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-sky-100 bg-white shadow-[0_8px_20px_rgba(12,74,110,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(12,74,110,0.16)]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-light)]">
                      {item.primaryImage ? (
                        <Image
                          src={item.primaryImage.url}
                          alt={item.primaryImage.altText ?? item.name}
                          fill
                          sizes="208px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-subtle)]">
                          No image
                        </div>
                      )}
                    </div>
                    <p className="px-3 py-3 text-center text-sm font-semibold leading-snug text-primary">
                      {item.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default GiftCardBanner;
