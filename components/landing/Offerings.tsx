"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { EB_Garamond } from "next/font/google";
import GalleryCarousel from "@/components/gallery/GalleryCarousel";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface CalendarEvent {
  _id: string;
  eventName: string;
  eventType: "class" | "camp" | "workshop" | "artist";
  description: string;
  price?: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
    recurringEndDate?: string;
    excludeDates?: string[];
    specificDates?: string[];
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  image?: string;
}

export default function Offerings() {
  const [nextArtistEvent, setNextArtistEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { content } = usePageContent();

  // Convert PortableText to plain text
  const sectionSubtitle = content?.homepage?.offerings?.sectionSubtitle
    ? portableTextToPlainText(content.homepage.offerings.sectionSubtitle)
    : DEFAULT_TEXT.homepage.offerings.sectionSubtitle;

  const artCampsDescription = content?.homepage?.offerings?.artCamps
    ?.description
    ? portableTextToPlainText(content.homepage.offerings.artCamps.description)
    : DEFAULT_TEXT.homepage.offerings.artCamps.description;

  const classesWorkshopsDescription = content?.homepage?.offerings
    ?.classesWorkshops?.description
    ? portableTextToPlainText(
        content.homepage.offerings.classesWorkshops.description
      )
    : DEFAULT_TEXT.homepage.offerings.classesWorkshops.description;

  const privateEventsDescription = content?.homepage?.offerings?.privateEvents
    ?.description
    ? portableTextToPlainText(
        content.homepage.offerings.privateEvents.description
      )
    : DEFAULT_TEXT.homepage.offerings.privateEvents.description;

  useEffect(() => {
    // Fetch events and find the next upcoming artist event
    const fetchNextArtistEvent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.events) {
          // Filter for artist events and find the next upcoming one
          const artistEvents = data.events.filter(
            (event: CalendarEvent) => event.eventType === "artist"
          );

          // Sort by start date and get the next upcoming event
          const now = new Date();
          const upcomingArtistEvents = artistEvents
            .filter(
              (event: CalendarEvent) => new Date(event.dates.startDate) >= now
            )
            .sort(
              (a: CalendarEvent, b: CalendarEvent) =>
                new Date(a.dates.startDate).getTime() -
                new Date(b.dates.startDate).getTime()
            );

          if (upcomingArtistEvents.length > 0) {
            setNextArtistEvent(upcomingArtistEvents[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching artist events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextArtistEvent();
  }, []);

  // Format event time from time.startTime string
  const formatEventTime = (startTime: string) => {
    try {
      // If startTime is in HH:MM format, convert to 12-hour format
      if (startTime.match(/^\d{1,2}:\d{2}$/)) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
      }
      return startTime;
    } catch {
      return "All Day";
    }
  };

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="py-20 md:py-28 ">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex flex-col items-start">
            <div className="mb-6">
              <h4
                className={`${ebGaramond.className} text-secondary uppercase tracking-widest text-lg font-bold mb-3`}
              >
                What We Offer
              </h4>
              <h3
                className={`${ebGaramond.className} text-6xl font-bold text-primary`}
              >
                {content?.homepage?.offerings?.sectionTitle ||
                  DEFAULT_TEXT.homepage.offerings.sectionTitle}
              </h3>
            </div>
            <p
              className={`${ebGaramond.className} text-neutral-900 max-w-md mx-auto text-justify font-bold text-lg`}
            >
              {sectionSubtitle}
            </p>
          </div>

          {/* Gallery Carousel */}
          <div className="mb-16">
            <GalleryCarousel
              destination="home-page"
              // title="Gallery"
              autoPlay={true}
              autoPlayInterval={4000}
              height="h-[32rem]"
            />
          </div>

          {/* Live Artist Painting - Full Width Row - Only show if there are upcoming events */}
          {(nextArtistEvent || isLoading) && (
            <div className="mb-12">
              <div className="group p-8 border border-neutral-100 bg-white/80 rounded-lg hover:border-primary shadow-[-8px_8px_15px_rgba(0,0,0,0.15)] hover:shadow-lg transition duration-300">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <div className="relative w-full lg:w-1/3 h-64 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        nextArtistEvent && nextArtistEvent.image
                          ? nextArtistEvent.image
                          : "/assets/images/live_add.png"
                      }
                      alt="Live Artist Painting"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-contain"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <p
                          className={`${ebGaramond.className} text-white font-bold`}
                        >
                          Loading...
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-light rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary transition duration-300">
                        <i
                          data-lucide="palette"
                          className="w-6 h-6 text-primary group-hover:text-white transition duration-300"
                        ></i>
                      </div>
                      <div className="flex-1">
                        {nextArtistEvent ? (
                          <div>
                            <h4
                              className={`${ebGaramond.className} text-2xl font-semibold text-primary mb-1`}
                            >
                              {nextArtistEvent.eventName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center text-gray-600 text-lg font-bold">
                                <i
                                  data-lucide="calendar"
                                  className="w-4 h-4 mr-1"
                                ></i>
                                <span
                                  className={`${ebGaramond.className} font-medium`}
                                >
                                  {formatEventDate(
                                    nextArtistEvent.dates.startDate
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center text-lg text-gray-600">
                                <i
                                  data-lucide="clock"
                                  className="w-4 h-4 mr-1"
                                ></i>
                                <span
                                  className={`${ebGaramond.className} font-medium text-lg`}
                                >
                                  {formatEventTime(
                                    nextArtistEvent.time.startTime
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <h4
                            className={`${ebGaramond.className} text-3xl font-semibold text-primary`}
                          >
                            Next Live Artist Event
                          </h4>
                        )}
                      </div>
                    </div>
                    {nextArtistEvent ? (
                      <div className="mb-6 flex-1">
                        <p
                          className={`${ebGaramond.className} text-gray-600 group-hover:text-gray-800 transition duration-300 text-justify font-bold text-xl`}
                        >
                          {nextArtistEvent.description}
                        </p>
                      </div>
                    ) : (
                      <p
                        className={`${ebGaramond.className} text-gray-600 mb-6 group-hover:text-gray-800 transition duration-300 text-justify font-bold text-lg flex-1`}
                      >
                        Watch talented artists create beautiful works live!
                        Check back for upcoming painting sessions where you can
                        observe the creative process and learn new techniques.
                      </p>
                    )}
                    <div className="flex justify-end">
                      {nextArtistEvent ? (
                        <Link
                          href={"/events/events"}
                          className={`${ebGaramond.className} inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg border-2 border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-gray-300 hover:border-gray-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-all duration-300`}
                        >
                          <span className="mr-2">View Live Events</span>
                          <i data-lucide="arrow-right" className="w-4 h-4"></i>
                        </Link>
                      ) : (
                        <Link
                          href="/calendar"
                          className={`${ebGaramond.className} inline-flex items-center justify-center px-8 py-4 bg-gray-200 text-gray-800 font-semibold rounded-lg border-2 border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:bg-gray-300 hover:border-gray-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] transform hover:scale-105 transition-all duration-300`}
                        >
                          <span className="mr-2">View Calendar</span>
                          <i data-lucide="arrow-right" className="w-4 h-4"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Original Three Offerings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Art Camps Card */}
            <div className="relative group">
              {/* Decorative background */}
              <div className="absolute -inset-2 bg-primary/10 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative w-full h-52 overflow-hidden">
                  <Image
                    src="/assets/images/paintingAction1.jpeg"
                    alt="Canvas and Collage"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <h4
                    className={`${ebGaramond.className} text-xl font-bold text-gray-800 mb-2`}
                  >
                    {content?.homepage?.offerings?.artCamps?.title ||
                      DEFAULT_TEXT.homepage.offerings.artCamps.title}
                  </h4>
                  <p
                    className={`${ebGaramond.className} text-gray-600 mb-4 text-sm leading-relaxed flex-1`}
                  >
                    {artCampsDescription}
                  </p>
                  <Link
                    href={"/events/camps"}
                    className={`${ebGaramond.className} inline-flex items-center justify-center w-full px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 text-sm`}
                  >
                    <span>Upcoming Camps</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Classes & Workshops Card */}
            <div className="relative group">
              {/* Decorative background */}
              <div className="absolute -inset-2 bg-primary/10 rounded-3xl rotate-2 group-hover:rotate-0 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative w-full h-52 overflow-hidden">
                  <Image
                    src="/assets/images/classes_workshops.jpeg"
                    alt="Workshops"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <h4
                    className={`${ebGaramond.className} text-xl font-bold text-gray-800 mb-2`}
                  >
                    {content?.homepage?.offerings?.classesWorkshops?.title ||
                      DEFAULT_TEXT.homepage.offerings.classesWorkshops.title}
                  </h4>
                  <p
                    className={`${ebGaramond.className} text-gray-600 mb-4 text-sm leading-relaxed flex-1`}
                  >
                    {classesWorkshopsDescription}
                  </p>
                  <Link
                    href={"/events/classes-workshops"}
                    className={`${ebGaramond.className} inline-flex items-center justify-center w-full px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 text-sm`}
                  >
                    <span>Upcoming Classes</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Private Events Card */}
            <div className="relative group">
              {/* Decorative background */}
              <div className="absolute -inset-2 bg-primary/10 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative w-full h-52 overflow-hidden">
                  <Image
                    src="/assets/images/private_events.png"
                    alt="Private Events"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-[center_40%] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <h4
                    className={`${ebGaramond.className} text-xl font-bold text-gray-800 mb-2`}
                  >
                    {content?.homepage?.offerings?.privateEvents?.title ||
                      DEFAULT_TEXT.homepage.offerings.privateEvents.title}
                  </h4>
                  <p
                    className={`${ebGaramond.className} text-gray-600 mb-4 text-sm leading-relaxed flex-1`}
                  >
                    {privateEventsDescription}
                  </p>
                  <Link
                    href={"/events/private-events"}
                    className={`${ebGaramond.className} inline-flex items-center justify-center w-full px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 text-sm`}
                  >
                    <span>Learn More</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
