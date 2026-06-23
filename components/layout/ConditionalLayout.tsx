"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/layout/nav/NavBar";
import Footer from "@/components/layout/footer/Footer";
import LayoutTransition from "@/components/layout/LayoutTransition";
import { isCheckoutRoute } from "@/lib/utils/isCheckoutRoute";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps): ReactElement {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    // Admin routes get no navbar, footer, or background gradient
    return <div>{children}</div>;
  }

  // On checkout pages the nav is in-flow (relative), so the fixed-nav top offset
  // would just create dead space — drop it there.
  const isCheckout = isCheckoutRoute(pathname);

  // Regular routes get full layout with navbar, footer, and background
  return (
    <>
      <NavBar />
      <main className={isCheckout ? "" : "pt-[var(--nav-offset,8rem)]"}>
        {/* "Ocean depth" page background: a faint paper grain over a soft
            light-from-above glow + vertical sky -> sea-glass gradient (her blue
            family, with depth). */}
        <div
          style={{
            background:
              "url('/assets/svg/paper-grain.svg') repeat, radial-gradient(130% 70% at 50% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, #e8f4f7 0%, #cfe7eb 45%, #b6dce6 100%)",
          }}
        >
          <LayoutTransition>{children}</LayoutTransition>
          {/* Shoreline: the ocean fades into wet sand just before the footer. */}
          <div
            aria-hidden
            className="h-20 bg-gradient-to-b from-transparent to-[#f3ddc4] md:h-28"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
