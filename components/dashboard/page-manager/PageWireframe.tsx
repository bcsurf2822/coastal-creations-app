"use client";

import type { ReactElement } from "react";
import type { WireframeSectionConfig, PageConfig } from "./pageConfig";

interface PageWireframeProps {
  pageConfig: PageConfig;
  focusedSection: string | null;
}

interface WireframeBoxProps {
  section: WireframeSectionConfig;
  focusedSection: string | null;
  depth?: number;
}

const WireframeBox = ({
  section,
  focusedSection,
  depth = 0,
}: WireframeBoxProps): ReactElement => {
  const isHighlighted =
    focusedSection !== null && section.linkedSectionId === focusedSection;
  const isImageSection = section.linkedSectionId === "images";

  // If this section has grid children, render as a grid container
  if (section.children && section.gridCols) {
    return (
      <div
        className={`rounded-lg border-2 transition-all duration-200 ${
          isHighlighted
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
        }`}
        style={{ minHeight: section.height || "auto" }}
      >
        <p
          className={`text-[10px] font-medium px-2 pt-1 ${
            isHighlighted
              ? "text-blue-600 dark:text-blue-300"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {section.label}
        </p>
        <div
          className="grid gap-2 p-2"
          style={{ gridTemplateColumns: `repeat(${section.gridCols}, 1fr)` }}
        >
          {section.children.map((child) => (
            <WireframeBox
              key={child.id}
              section={child}
              focusedSection={focusedSection}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
        isHighlighted
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
          : isImageSection
            ? "border-dashed border-gray-300 dark:border-gray-600 bg-amber-50/50 dark:bg-amber-900/10"
            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      }`}
      style={{ minHeight: section.height || "60px" }}
    >
      <p
        className={`text-xs font-medium ${
          isHighlighted
            ? "text-blue-600 dark:text-blue-300"
            : isImageSection
              ? "text-amber-600 dark:text-amber-400"
              : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {section.label}
      </p>
    </div>
  );
};

const PageWireframe = ({
  pageConfig,
  focusedSection,
}: PageWireframeProps): ReactElement => {
  return (
    <div className="sticky top-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
        Page Preview
      </h3>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        {/* Fake browser chrome */}
        <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="ml-3 flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center px-2">
            <span className="text-[9px] text-gray-400 dark:text-gray-500 truncate">
              coastalcreationsstudio.com/{pageConfig.id === "homepage" ? "" : pageConfig.id}
            </span>
          </div>
        </div>

        {/* Wireframe sections */}
        <div className="space-y-2">
          {pageConfig.wireframe.map((section) => (
            <WireframeBox
              key={section.id}
              section={section}
              focusedSection={focusedSection}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-50" />
          <span>Editing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-dashed border-gray-300 bg-amber-50/50" />
          <span>Images</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-gray-200 bg-gray-50" />
          <span>Content</span>
        </div>
      </div>
    </div>
  );
};

export default PageWireframe;
