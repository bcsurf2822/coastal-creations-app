"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import {
  RiHome4Line,
  RiHome4Fill,
  RiCalendarEventLine,
  RiCalendarEventFill,
  RiPieChartLine,
  RiPieChartFill,
  RiBookletLine,
  RiBookletFill,
  RiTeamLine,
  RiTeamFill,
  RiTimeLine,
  RiTimeFill,
  RiFileTextLine,
  RiFileTextFill,
} from "react-icons/ri";

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const STORE_ITEMS: NavItem[] = [
  {
    path: "/admin/dashboard",
    label: "Classes | Camps | Events",
    icon: <RiHome4Line className="w-5 h-5" />,
    activeIcon: <RiHome4Fill className="w-5 h-5" />,
  },
  {
    path: "/admin/dashboard/reservations",
    label: "Reservations",
    icon: <RiCalendarEventLine className="w-5 h-5" />,
    activeIcon: <RiCalendarEventFill className="w-5 h-5" />,
  },
  {
    path: "/admin/dashboard/private-offerings",
    label: "Private Offerings",
    icon: <RiBookletLine className="w-5 h-5" />,
    activeIcon: <RiBookletFill className="w-5 h-5" />,
  },
  {
    path: "/admin/dashboard/customers",
    label: "Customers",
    icon: <RiTeamLine className="w-5 h-5" />,
    activeIcon: <RiTeamFill className="w-5 h-5" />,
  },
];

const WEBSITE_ITEMS: NavItem[] = [
  {
    path: "/admin/dashboard/page-descriptions",
    label: "Page Manager",
    icon: <RiFileTextLine className="w-5 h-5" />,
    activeIcon: <RiFileTextFill className="w-5 h-5" />,
  },
  {
    path: "/admin/dashboard/hours",
    label: "Hours",
    icon: <RiTimeLine className="w-5 h-5" />,
    activeIcon: <RiTimeFill className="w-5 h-5" />,
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    path: "/admin/dashboard/error-logs",
    label: "Error Logs",
    icon: <RiPieChartLine className="w-5 h-5" />,
    activeIcon: <RiPieChartFill className="w-5 h-5" />,
  },
];

const NAV_SECTIONS: NavSection[] = [
  { label: "Store", items: STORE_ITEMS },
  { label: "Website", items: WEBSITE_ITEMS },
];

const NavLink = ({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}): ReactElement => (
  <li>
    <Link
      href={item.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
        ${
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      <span className="text-xl">{isActive ? item.activeIcon : item.icon}</span>
      <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}>
        {item.label}
      </span>
    </Link>
  </li>
);

export default function Sidebar(): ReactElement {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 md:min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm">
      <nav className="px-2">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.label}>
            {sectionIdx > 0 && (
              <div className="my-2 mx-3 border-t border-gray-200 dark:border-gray-700" />
            )}
            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  isActive={pathname === item.path}
                />
              ))}
            </ul>
          </div>
        ))}

        {/* Error Logs */}
        <div className="my-2 mx-3 border-t border-gray-200 dark:border-gray-700" />
        <ul className="space-y-0.5 pb-4">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              isActive={pathname === item.path}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
