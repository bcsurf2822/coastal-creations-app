import { ReactElement } from "react";

export type TabType = "homepage" | "eventPages" | "otherPages";

interface Tab {
  id: TabType;
  label: string;
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Tab[] = [
  { id: "homepage", label: "Homepage" },
  { id: "eventPages", label: "Event Pages" },
  { id: "otherPages", label: "Reservations, Gallery & About" },
];

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps): ReactElement {
  return (
    <div className="border-b-2 border-gray-200 dark:border-gray-700">
      <nav className="flex gap-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-6 border-b-4 font-semibold text-base transition-all cursor-pointer rounded-t-lg ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-400 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
