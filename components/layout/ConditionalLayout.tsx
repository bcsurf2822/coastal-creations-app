"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/layout/nav/NavBar";
import Footer from "@/components/layout/footer/Footer";
import LayoutTransition from "@/components/layout/LayoutTransition";

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

  // Regular routes get full layout with navbar, footer, and background
  return (
    <>
      <NavBar />
      <div className="pt-[var(--nav-offset,8rem)]">
        <div className="bg-gradient-to-r from-[#b6dce6] via-[#BEDCDC] to-[#daebeb]">
          <LayoutTransition>{children}</LayoutTransition>
        </div>
      </div>
      <Footer />
    </>
  );
}
