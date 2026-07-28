"use client";

import type { ReactElement } from "react";
import { motion } from "motion/react";

const PANEL =
  "relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/82 shadow-[0_18px_34px_rgba(12,74,110,0.14)] backdrop-blur-[2px]";

// Matches the hero heading (Impact with the globally-loaded Anton fallback).
const DISPLAY_FONT =
  'Impact, Haettenschweiler, "Arial Narrow Bold", var(--font-anton), sans-serif';

// Paint-palette dots that bob gently around the banner.
const PAINT_DOTS: {
  color: string;
  size: number;
  left: string;
  top: string;
  delay: number;
}[] = [
  { color: "#42A5F5", size: 20, left: "7%", top: "20%", delay: 0 },
  { color: "#FB923C", size: 13, left: "14%", top: "68%", delay: 0.6 },
  { color: "#2DD4BF", size: 24, left: "86%", top: "18%", delay: 0.3 },
  { color: "#FB7185", size: 15, left: "79%", top: "72%", delay: 0.9 },
  { color: "#FBBF24", size: 17, left: "93%", top: "50%", delay: 1.2 },
  { color: "#0ea5e9", size: 11, left: "22%", top: "34%", delay: 1.5 },
];

/**
 * Rendered on the landing page in place of ShopPreview while the shop launch
 * gate (NEXT_PUBLIC_SHOP_ENABLED) is down.
 */
const ShopComingSoonBanner = (): ReactElement => {
  return (
    <section id="shop-preview" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className={`${PANEL} px-6 py-14 text-center md:px-10 md:py-16`}>
          {PAINT_DOTS.map((dot) => (
            <motion.span
              key={`${dot.left}-${dot.top}`}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: dot.left,
                top: dot.top,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                backgroundColor: dot.color,
                opacity: 0.55,
              }}
              animate={{ y: [0, -12, 0], scale: [1, 1.12, 1] }}
              transition={{
                duration: 4.5,
                delay: dot.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              <motion.span
                className="h-2 w-2 rounded-full bg-[var(--color-accent,#2DD4BF)]"
                animate={{ opacity: [1, 0.35, 1], scale: [1, 1.25, 1] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              Online Shop
            </span>

            <h2
              className="mt-5 bg-gradient-to-r from-[#0c4a6e] via-sky-500 to-teal-400 bg-clip-text leading-tight text-transparent text-[clamp(2.75rem,7vw,5rem)]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Coming Soon
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-700">
              Take home a little creativity — art kits, studio goods, and works
              of art from local artists, shipped right to your door. We&apos;re
              putting the finishing touches on our online shop!
            </p>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              In the meantime, come create with us in the studio
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopComingSoonBanner;
