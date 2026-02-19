"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

const GiftCardBanner = (): ReactElement => {
  const router = useRouter();

  return (
    <section id="gift-cards" className="bg-transparent py-16 md:py-24">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/82 px-6 py-10 shadow-[0_18px_34px_rgba(12,74,110,0.14)] backdrop-blur-[2px] md:px-10 lg:px-14">
          <div className="pointer-events-none absolute -left-6 top-8 hidden md:block">

          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Gift Cards
              </p>
              <h2 className="mb-4 text-4xl font-bold leading-tight text-primary md:text-5xl">
                Give the gift of creativity.
              </h2>
              <p className="mb-7 max-w-xl text-lg leading-relaxed text-slate-700">
                Send a digital gift card that can be used for classes, camps, workshops,
                private events, and walk-in studio time.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => router.push("/gift-cards")}
              >
                Buy Gift Card
              </Button>
            </div>

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
                    <p className="text-2xl font-bold text-primary">Coastal Creations Studio</p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </section>
  );
};

export default GiftCardBanner;
