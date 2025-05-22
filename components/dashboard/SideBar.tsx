"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiHome4Line,
  RiHome4Fill,
  RiCalendarEventLine,
  RiCalendarEventFill,
  RiSettings4Line,
  RiSettings4Fill,
  RiFileList3Line,
  RiFileList3Fill,
  RiPieChartLine,
  RiPieChartFill,
} from "react-icons/ri";

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
  activeIcon: JSX.Element;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <RiHome4Line className="w-5 h-5" />,
      activeIcon: <RiHome4Fill className="w-5 h-5" />,
    },
    {
      path: "/admin/dashboard/add-event",
      label: "Add Event",
      icon: <RiCalendarEventLine className="w-5 h-5" />,
      activeIcon: <RiCalendarEventFill className="w-5 h-5" />,
    },
    {
      path: "/admin/dashboard/edit-event",
      label: "Class Details",
      icon: <RiSettings4Line className="w-5 h-5" />,
      activeIcon: <RiSettings4Fill className="w-5 h-5" />,
    },
    {
      path: "/admin/dashboard/reports",
      label: "Reports",
      icon: <RiPieChartLine className="w-5 h-5" />,
      activeIcon: <RiPieChartFill className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-full md:w-64 md:min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-4 mb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center md:justify-start">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <span className="text-xl">
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <span
                    className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 hidden md:block">
        <div className="flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Coastal Creations
          </span>
        </div>
      </div>
    </div>
  );
}
