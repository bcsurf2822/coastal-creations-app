"use client";

import { ReactElement, useState, useEffect, useCallback } from "react";
import { RiSaveLine, RiFileTextLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import TextEditor from "@/components/dashboard/page-descriptions/TextEditor";
import PageWireframe from "@/components/dashboard/page-manager/PageWireframe";
import PageImageSection from "@/components/dashboard/page-manager/PageImageSection";
import OfferingImageUpload from "@/components/dashboard/page-manager/OfferingImageUpload";
import {
  PAGE_CONFIGS,
  type PageConfig,
  type SectionConfig,
  type FieldConfig,
} from "@/components/dashboard/page-manager/pageConfig";
import type { PageContent, SanityImageRef, PortableTextBlock } from "@/types/pageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

// ── Helpers ──────────────────────────────────────────────────────────────

/** Check if a value is a Portable Text array */
const isPortableText = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length > 0 &&
  typeof value[0] === "object" &&
  value[0] !== null &&
  "_type" in value[0] &&
  value[0]._type === "block";

/** Convert a plain string to a Portable Text block array */
const stringToPortableText = (text: string): PortableTextBlock[] =>
  text.split("\n\n").filter(Boolean).map((paragraph, i) => ({
    _type: "block" as const,
    _key: `block-${i}-${Date.now()}`,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span" as const,
        _key: `span-${i}-${Date.now()}`,
        text: paragraph,
        marks: [],
      },
    ],
  }));

/** Read a nested string value from content by path.
 *  Automatically converts Portable Text arrays to plain strings for editing. */
const getNestedValue = (obj: unknown, path: string[]): string => {
  let current: unknown = obj;
  for (const key of path) {
    if (!current || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === "string") return current;
  if (isPortableText(current)) {
    return portableTextToPlainText(current as PortableTextBlock[]);
  }
  return "";
};

/** Read a nested value of any type from content by path */
const getNestedObject = (obj: unknown, path: string[]): unknown => {
  let current: unknown = obj;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

/** Set a nested value in content by path (immutable, supports any value type) */
const setNestedValue = (
  obj: PageContent,
  path: string[],
  value: unknown,
): PageContent => {
  const newObj = { ...obj };
  let current: unknown = newObj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current || typeof current !== "object") break;
    if (!(key in (current as Record<string, unknown>))) {
      (current as Record<string, unknown>)[key] = {};
    }
    const next = {
      ...((current as Record<string, unknown>)[key] as Record<string, unknown>),
    };
    (current as Record<string, unknown>)[key] = next;
    current = next;
  }

  if (current && typeof current === "object") {
    const lastKey = path[path.length - 1];
    if (value === null || value === undefined) {
      delete (current as Record<string, unknown>)[lastKey];
    } else {
      (current as Record<string, unknown>)[lastKey] = value;
    }
  }

  return newObj;
};

// ── Section Fields Component ─────────────────────────────────────────────

interface SectionFieldsProps {
  section: SectionConfig;
  content: PageContent;
  onFieldChange: (path: string[], value: unknown) => void;
  onFocusSection: (sectionId: string | null) => void;
}

const SectionFields = ({
  section,
  content,
  onFieldChange,
  onFocusSection,
}: SectionFieldsProps): ReactElement => {
  const currentImage = section.imagePath
    ? (getNestedObject(content, section.imagePath) as SanityImageRef | undefined)
    : undefined;

  return (
    <div
      className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
      onMouseEnter={() => onFocusSection(section.id)}
      onMouseLeave={() => onFocusSection(null)}
    >
      <div className="flex items-center space-x-3 mb-4">
        <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          {section.label}
        </h3>
      </div>
      <div className="space-y-4">
        {/* Image upload (if section has imagePath) */}
        {section.imagePath && (
          <OfferingImageUpload
            currentImage={currentImage}
            onImageChange={(img) => onFieldChange(section.imagePath!, img)}
          />
        )}

        {section.fields.map((field: FieldConfig) => {
          const value = getNestedValue(content, field.path) || field.defaultValue;

          if (field.type === "textarea") {
            return (
              <TextEditor
                key={field.id}
                label={field.label}
                value={value}
                onChange={(v) => onFieldChange(field.path, stringToPortableText(v))}
                rows={field.rows || 4}
                placeholder={field.placeholder}
              />
            );
          }

          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onFieldChange(field.path, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Page Tabs Component ──────────────────────────────────────────────────

interface PageTabsProps {
  selectedPage: PageConfig;
  onPageChange: (page: PageConfig) => void;
}

const PageTabs = ({
  selectedPage,
  onPageChange,
}: PageTabsProps): ReactElement => (
  <div className="flex flex-wrap gap-1.5">
    {PAGE_CONFIGS.map((page) => {
      const isActive = page.id === selectedPage.id;
      return (
        <button
          key={page.id}
          type="button"
          onClick={() => onPageChange(page)}
          className={`px-3.5 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            isActive
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
          }`}
        >
          {page.label}
        </button>
      );
    })}
  </div>
);

// ── Main Page Manager ────────────────────────────────────────────────────

export default function PageManagerPage(): ReactElement {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<PageConfig>(PAGE_CONFIGS[0]);
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch content
  useEffect(() => {
    const fetchContent = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/page-content");
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setContent(result.data);
          } else {
            setContent({ homepage: {}, eventPages: {}, otherPages: {} });
          }
        }
      } catch (err) {
        console.error("[PAGE-MANAGER-FETCH] Error:", err);
        toast.error("Failed to load page content");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Save content
  const handleSave = async (): Promise<void> => {
    if (!content) return;
    try {
      setIsSaving(true);

      const response = await fetch("/api/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!response.ok) throw new Error("Failed to save content");

      const result = await response.json();
      setContent(result.data);
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      setHasUnsavedChanges(false);
      toast.success("Page content saved successfully!");
    } catch (err) {
      console.error("[PAGE-MANAGER-SAVE] Error:", err);
      toast.error("Failed to save page content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Update a field in content (supports strings, objects, or null)
  const handleFieldChange = useCallback(
    (path: string[], value: unknown): void => {
      setContent((prev) => {
        if (!prev) return prev;
        return setNestedValue(prev, path, value);
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage text and images across your website.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  // Error state
  if (!content) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage text and images across your website.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center py-10">
          <p className="text-red-500 dark:text-red-400">
            Failed to load page content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage text and images across your website. Hover over a section to
            see where it appears.
          </p>
        </div>
        <PageTabs
          selectedPage={selectedPage}
          onPageChange={(page) => {
            if (hasUnsavedChanges) {
              const confirmed = window.confirm(
                "You have unsaved changes. Switch pages without saving?",
              );
              if (!confirmed) return;
              setHasUnsavedChanges(false);
            }
            setSelectedPage(page);
          }}
        />
      </div>

      {/* Split-screen Layout */}
      <div className="flex gap-6">
        {/* Left Panel: Edit Form */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Text sections */}
              {selectedPage.sections.map((section) => (
                <SectionFields
                  key={section.id}
                  section={section}
                  content={content}
                  onFieldChange={handleFieldChange}
                  onFocusSection={setFocusedSection}
                />
              ))}

              {/* Image section (only if page has a gallery destination) */}
              {selectedPage.galleryDestination && (
                <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <RiFileTextLine className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Page Images
                    </h3>
                  </div>
                  <PageImageSection
                    destination={selectedPage.galleryDestination}
                    onFocusSection={setFocusedSection}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Wireframe Preview (hidden on mobile) */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0">
          <PageWireframe
            pageConfig={selectedPage}
            focusedSection={focusedSection}
          />
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-colors ${
        hasUnsavedChanges
          ? "border-amber-400 dark:border-amber-500 bg-amber-50/95 dark:bg-gray-900/95"
          : "border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Editing: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedPage.label}</span>
            </p>
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                Unsaved changes
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`ml-auto px-6 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2 font-medium shadow-sm ${
              hasUnsavedChanges
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <RiSaveLine className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
