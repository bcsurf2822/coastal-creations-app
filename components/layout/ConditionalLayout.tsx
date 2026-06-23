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
        <div className="bg-gradient-to-r from-[#b6dce6] via-[#BEDCDC] to-[#daebeb]">
          <LayoutTransition>{children}</LayoutTransition>
        </div>
      </main>
      <Footer />
    </>
  );
}
