"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/layout/nav/NavBar";
import Footer from "@/components/layout/footer/Footer";

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
      <div className="relative pt-32 md:pt-56">
        <div className="absolute inset-0 bg-gradient-to-r from-[#b6dce6] via-[#BEDCDC] to-[#daebeb] z-10"></div>
        <div className="relative z-20">{children}</div>
      </div>
      <Footer />
    </>
  );
}