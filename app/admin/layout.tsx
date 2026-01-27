"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
