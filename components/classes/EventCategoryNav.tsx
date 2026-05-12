"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegCalendarAlt } from "react-icons/fa";
import { ReactElement } from "react";

interface CategoryLink {
  href: string;
  label: string;
}

const CATEGORY_LINKS: CategoryLink[] = [
  { href: "/events/classes-workshops", label: "All Events" },
  { href: "/events/adult-classes", label: "Adult Classes" },
  { href: "/events/kid-classes", label: "Kid Classes" },
  { href: "/events/camps", label: "Camps" },
  { href: "/events/events", label: "Workshops & Events" },
];

export default function EventCategoryNav(): ReactElement {
  const pathname = usePathname();

  return (
    <section className="border-y border-gray-100 bg-[var(--color-light)]/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-between">
          <nav
            aria-label="Event categories"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {CATEGORY_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:text-base ${
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-primary)]/30 bg-white text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-light)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#f97316] sm:text-base"
          >
            <FaRegCalendarAlt className="text-base" />
            View Full Calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
