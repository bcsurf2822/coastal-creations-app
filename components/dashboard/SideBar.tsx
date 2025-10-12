"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "react-icons/ri";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
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
      path: "/admin/dashboard/add-reservation",
      label: "Add Reservation",
      icon: <RiCalendarEventLine className="w-5 h-5" />,
      activeIcon: <RiCalendarEventFill className="w-5 h-5" />,
    },
    {
      path: "/admin/dashboard/add-private-event",
      label: "Add Private Event",
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
    {
      path: "/admin/dashboard/error-logs",
      label: "Error Logs",
      icon: <RiPieChartLine className="w-5 h-5" />,
      activeIcon: <RiPieChartFill className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-full md:w-64 md:min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm">


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
    </div>
  );
}
