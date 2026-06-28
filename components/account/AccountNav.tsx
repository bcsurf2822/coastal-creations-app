"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiDashboardFill,
  RiShoppingBag3Line,
  RiShoppingBag3Fill,
  RiCalendarEventLine,
  RiCalendarEventFill,
  RiUser3Line,
  RiUser3Fill,
  RiBankCardLine,
  RiBankCardFill,
} from "react-icons/ri";
import LogoutButton from "@/components/authentication/LogoutButton";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/account",
    label: "Overview",
    icon: <RiDashboardLine className="w-5 h-5" />,
    activeIcon: <RiDashboardFill className="w-5 h-5" />,
  },
  {
    href: "/account/orders",
    label: "Orders",
    icon: <RiShoppingBag3Line className="w-5 h-5" />,
    activeIcon: <RiShoppingBag3Fill className="w-5 h-5" />,
  },
  {
    href: "/account/bookings",
    label: "Bookings",
    icon: <RiCalendarEventLine className="w-5 h-5" />,
    activeIcon: <RiCalendarEventFill className="w-5 h-5" />,
  },
  {
    href: "/account/payment-methods",
    label: "Payment methods",
    icon: <RiBankCardLine className="w-5 h-5" />,
    activeIcon: <RiBankCardFill className="w-5 h-5" />,
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: <RiUser3Line className="w-5 h-5" />,
    activeIcon: <RiUser3Fill className="w-5 h-5" />,
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsFrom(name?: string | null, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    const combined = `${first}${last}`.toUpperCase();
    if (combined) return combined;
  }
  return (email?.[0] ?? "?").toUpperCase();
}

interface AccountNavProps {
  name?: string | null;
  email: string;
  image?: string | null;
}

const AccountNav = ({ name, email, image }: AccountNavProps): ReactElement => {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Identity header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        {image ? (
          <Image
            src={image}
            alt={name ?? email}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            {initialsFrom(name, email)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">
            {name ?? "My Account"}
          </p>
          <p className="truncate text-xs text-gray-500">{email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2" aria-label="Account">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="text-xl">
                    {active ? item.activeIcon : item.icon}
                  </span>
                  <span
                    className={`text-sm font-medium ${active ? "font-semibold" : ""}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-2 mx-2 border-t border-gray-200" />
        <div className="px-2 pb-1">
          <LogoutButton />
        </div>
      </nav>
    </div>
  );
};

export default AccountNav;
