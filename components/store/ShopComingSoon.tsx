import type { ReactElement } from "react";
import Link from "next/link";
import { FaShoppingBag } from "react-icons/fa";
import { Button } from "@/components/ui";

/**
 * Placeholder rendered on every store surface while the shop launch gate
 * (NEXT_PUBLIC_SHOP_ENABLED) is down.
 */
export default function ShopComingSoon(): ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-100 bg-white/90 px-8 py-12 text-center shadow-[0_10px_28px_rgba(12,74,110,0.14)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-light)] text-3xl text-[var(--color-primary)]">
          <FaShoppingBag />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
          Our Online Store is Coming Soon
        </h1>
        <p className="mt-4 leading-relaxed text-slate-700">
          We&apos;re putting the finishing touches on our shop of art kits and
          more. Check back soon — in the meantime, come create with us in the
          studio!
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/events/classes-workshops">
            <Button variant="primary" size="lg">
              Explore Classes
            </Button>
          </Link>
          <Link href="/gift-cards">
            <Button variant="secondary" size="lg">
              Gift Cards
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
