"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Package, User } from "lucide-react";
import { cn } from "@/lib/shadcn/utils";

interface NavItem {
  href: string;
  label: string;
  icon: ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/account", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/account/orders", label: "Orders", icon: <Package className="size-4" /> },
  { href: "/account/bookings", label: "Bookings", icon: <CalendarDays className="size-4" /> },
  { href: "/account/profile", label: "Profile", icon: <User className="size-4" /> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const AccountNav = (): ReactElement => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Account">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AccountNav;
