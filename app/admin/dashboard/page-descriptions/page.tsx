"use client";

import { ReactElement, useState, useEffect } from "react";
import { RiFileTextLine, RiSaveLine } from "react-icons/ri";
import TabNavigation, {
  TabType,
} from "@/components/dashboard/page-descriptions/TabNavigation";
import TextEditor from "@/components/dashboard/page-descriptions/TextEditor";
import type { PageContent } from "@/types/pageContent";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";

export default function PageDescriptionsPage(): ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>("homepage");
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/page-content");

        if (response.ok) {
          const result = await response.json();
          console.log("[PAGE-DESCRIPTIONS-FETCH] Received result:", result);
          if (result.data) {
            setContent(result.data);
          } else {
            // Initialize with empty structure if no data
            setContent({
              homepage: {},
              eventPages: {},
              otherPages: {},
            });
          }
        }
      } catch (error) {
        console.error("[PAGE-DESCRIPTIONS-FETCH] Error fetching content:", error);
        setError("Failed to load page content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!content) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      console.log("[PAGE-DESCRIPTIONS-SAVE] Saving content:", content);

      const response = await fetch("/api/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      const result = await response.json();
      console.log("[PAGE-DESCRIPTIONS-SAVE] Save result:", result);
      setContent(result.data);
      setSuccessMessage("Page content saved successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("[PAGE-DESCRIPTIONS-SAVE] Error saving content:", error);
      setError("Failed to save page content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (path: string[], value: string): void => {
    setContent((prev) => {
      if (!prev) return prev;

      const newContent = { ...prev };
      let current: unknown = newContent;

      // Navigate to the nested property
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current || typeof current !== "object") break;

        if (!(key in current)) {
          (current as Record<string, unknown>)[key] = {};
        }
        current = (current as Record<string, unknown>)[key];
      }

      // Set the final value
      if (current && typeof current === "object") {
        (current as Record<string, string>)[path[path.length - 1]] = value;
      }

      return newContent;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Page Descriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage text content across your website. Allow up to five minutes
              for the Sanity update to complete.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Page Descriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage text content across your website
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 text-center py-10">
            <p className="text-red-500 dark:text-red-400">
              Failed to load page content
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page Descriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage text content across your website. Allow up to five minutes
            for the Sanity update to complete.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Tabs */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="space-y-6 pt-6">
              {/* Homepage Tab */}
              {activeTab === "homepage" && (
                <div className="space-y-6">
                  {/* Hero Section */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Hero Section
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Main Heading
                        </label>
                        <input
                          type="text"
                          value={
                            content.homepage?.hero?.heading ||
                            DEFAULT_TEXT.homepage.hero.heading
                          }
                          onChange={(e) =>
                            updateContent(
                              ["homepage", "hero", "heading"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CTA Button 1 Text
                          </label>
                          <input
                            type="text"
                            value={
                              content.homepage?.hero?.ctaButton1 ||
                              DEFAULT_TEXT.homepage.hero.ctaButton1
                            }
                            onChange={(e) =>
                              updateContent(
                                ["homepage", "hero", "ctaButton1"],
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CTA Button 2 Text
                          </label>
                          <input
                            type="text"
                            value={
                              content.homepage?.hero?.ctaButton2 ||
                              DEFAULT_TEXT.homepage.hero.ctaButton2
                            }
                            onChange={(e) =>
                              updateContent(
                                ["homepage", "hero", "ctaButton2"],
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Section */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Main Section (Our Creative Space)
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.homepage?.mainSection?.title ||
                            DEFAULT_TEXT.homepage.mainSection.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["homepage", "mainSection", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Description"
                        value={
                          content.homepage?.mainSection?.description as unknown as string ||
                          DEFAULT_TEXT.homepage.mainSection.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["homepage", "mainSection", "description"],
                            value
                          )
                        }
                        rows={6}
                        placeholder="Enter the main section description..."
                      />
                    </div>
                  </div>

                  {/* Offerings / Creative Experiences Section */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Creative Experiences / Offerings
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.homepage?.offerings?.sectionTitle ||
                            DEFAULT_TEXT.homepage.offerings.sectionTitle
                          }
                          onChange={(e) =>
                            updateContent(
                              ["homepage", "offerings", "sectionTitle"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Section Subtitle"
                        value={
                          content.homepage?.offerings?.sectionSubtitle as unknown as string ||
                          DEFAULT_TEXT.homepage.offerings.sectionSubtitle
                        }
                        onChange={(value) =>
                          updateContent(
                            ["homepage", "offerings", "sectionSubtitle"],
                            value
                          )
                        }
                        rows={3}
                        placeholder="Enter the section subtitle..."
                      />

                      <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Art Camps Card
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Card Title
                            </label>
                            <input
                              type="text"
                              value={
                                content.homepage?.offerings?.artCamps?.title ||
                                DEFAULT_TEXT.homepage.offerings.artCamps.title
                              }
                              onChange={(e) =>
                                updateContent(
                                  ["homepage", "offerings", "artCamps", "title"],
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <TextEditor
                            label="Card Description"
                            value={
                              content.homepage?.offerings?.artCamps?.description as unknown as string ||
                              DEFAULT_TEXT.homepage.offerings.artCamps.description
                            }
                            onChange={(value) =>
                              updateContent(
                                ["homepage", "offerings", "artCamps", "description"],
                                value
                              )
                            }
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Classes & Workshops Card
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Card Title
                            </label>
                            <input
                              type="text"
                              value={
                                content.homepage?.offerings?.classesWorkshops?.title ||
                                DEFAULT_TEXT.homepage.offerings.classesWorkshops.title
                              }
                              onChange={(e) =>
                                updateContent(
                                  ["homepage", "offerings", "classesWorkshops", "title"],
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <TextEditor
                            label="Card Description"
                            value={
                              content.homepage?.offerings?.classesWorkshops?.description as unknown as string ||
                              DEFAULT_TEXT.homepage.offerings.classesWorkshops.description
                            }
                            onChange={(value) =>
                              updateContent(
                                ["homepage", "offerings", "classesWorkshops", "description"],
                                value
                              )
                            }
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Private Events Card
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Card Title
                            </label>
                            <input
                              type="text"
                              value={
                                content.homepage?.offerings?.privateEvents?.title ||
                                DEFAULT_TEXT.homepage.offerings.privateEvents.title
                              }
                              onChange={(e) =>
                                updateContent(
                                  ["homepage", "offerings", "privateEvents", "title"],
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <TextEditor
                            label="Card Description"
                            value={
                              content.homepage?.offerings?.privateEvents?.description as unknown as string ||
                              DEFAULT_TEXT.homepage.offerings.privateEvents.description
                            }
                            onChange={(value) =>
                              updateContent(
                                ["homepage", "offerings", "privateEvents", "description"],
                                value
                              )
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Workshops Section */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Upcoming Workshops Section
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Label (above title)
                        </label>
                        <input
                          type="text"
                          value={
                            content.homepage?.upcomingWorkshops?.label ||
                            DEFAULT_TEXT.homepage.upcomingWorkshops.label
                          }
                          onChange={(e) =>
                            updateContent(
                              ["homepage", "upcomingWorkshops", "label"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.homepage?.upcomingWorkshops?.title ||
                            DEFAULT_TEXT.homepage.upcomingWorkshops.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["homepage", "upcomingWorkshops", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Subtitle"
                        value={
                          content.homepage?.upcomingWorkshops?.subtitle as unknown as string ||
                          DEFAULT_TEXT.homepage.upcomingWorkshops.subtitle
                        }
                        onChange={(value) =>
                          updateContent(
                            ["homepage", "upcomingWorkshops", "subtitle"],
                            value
                          )
                        }
                        rows={3}
                        placeholder="Enter the subtitle..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Event Pages Tab */}
              {activeTab === "eventPages" && (
                <div className="space-y-6">
                  {/* Adult Classes */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Adult Classes Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.eventPages?.adultClasses?.title ||
                            DEFAULT_TEXT.eventPages.adultClasses.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["eventPages", "adultClasses", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.eventPages?.adultClasses?.description as unknown as string ||
                          DEFAULT_TEXT.eventPages.adultClasses.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["eventPages", "adultClasses", "description"],
                            value
                          )
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Kid Classes */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Kid Classes Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.eventPages?.kidClasses?.title ||
                            DEFAULT_TEXT.eventPages.kidClasses.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["eventPages", "kidClasses", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.eventPages?.kidClasses?.description as unknown as string ||
                          DEFAULT_TEXT.eventPages.kidClasses.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["eventPages", "kidClasses", "description"],
                            value
                          )
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Camps */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Camps Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.eventPages?.camps?.title ||
                            DEFAULT_TEXT.eventPages.camps.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["eventPages", "camps", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.eventPages?.camps?.description as unknown as string ||
                          DEFAULT_TEXT.eventPages.camps.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["eventPages", "camps", "description"],
                            value
                          )
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Private Events */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Private Events Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.eventPages?.privateEvents?.title ||
                            DEFAULT_TEXT.eventPages.privateEvents.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["eventPages", "privateEvents", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.eventPages?.privateEvents?.description as unknown as string ||
                          DEFAULT_TEXT.eventPages.privateEvents.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["eventPages", "privateEvents", "description"],
                            value
                          )
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Other Pages Tab */}
              {activeTab === "otherPages" && (
                <div className="space-y-6">
                  {/* Reservations */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Reservations Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.otherPages?.reservations?.title ||
                            DEFAULT_TEXT.otherPages.reservations.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["otherPages", "reservations", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.otherPages?.reservations?.description as unknown as string ||
                          DEFAULT_TEXT.otherPages.reservations.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["otherPages", "reservations", "description"],
                            value
                          )
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        Gallery Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.otherPages?.gallery?.title ||
                            DEFAULT_TEXT.otherPages.gallery.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["otherPages", "gallery", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.otherPages?.gallery?.description as unknown as string ||
                          DEFAULT_TEXT.otherPages.gallery.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["otherPages", "gallery", "description"],
                            value
                          )
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* About */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        About Page
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={
                            content.otherPages?.about?.title ||
                            DEFAULT_TEXT.otherPages.about.title
                          }
                          onChange={(e) =>
                            updateContent(
                              ["otherPages", "about", "title"],
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <TextEditor
                        label="Page Description"
                        value={
                          content.otherPages?.about?.description as unknown as string ||
                          DEFAULT_TEXT.otherPages.about.description
                        }
                        onChange={(value) =>
                          updateContent(
                            ["otherPages", "about", "description"],
                            value
                          )
                        }
                        rows={6}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <RiSaveLine className="w-4 h-4" />
                    <span>Save All Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
