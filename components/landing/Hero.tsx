"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import SeaCreatures from "./SeaCreatures";
import ThreeHeroText from "./ThreeHeroText";
import { createEventSlug } from "@/lib/utils/slugify";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { Button } from "@/components/ui";

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

interface BubbleConfig {
  left: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

const HERO_BUBBLES: BubbleConfig[] = [
  { left: "6%", size: 16, duration: 6.5, delay: 0.2, drift: 14 },
  { left: "14%", size: 24, duration: 7.2, delay: 1.4, drift: -18 },
  { left: "22%", size: 14, duration: 6.1, delay: 0.9, drift: 11 },
  { left: "34%", size: 28, duration: 7.8, delay: 2.1, drift: -16 },
  { left: "43%", size: 20, duration: 6.7, delay: 0.6, drift: 17 },
  { left: "54%", size: 22, duration: 7.4, delay: 1.8, drift: -14 },
  { left: "63%", size: 15, duration: 6.2, delay: 1.2, drift: 15 },
  { left: "72%", size: 26, duration: 7.7, delay: 2.4, drift: -19 },
  { left: "82%", size: 21, duration: 6.8, delay: 0.5, drift: 12 },
  { left: "90%", size: 18, duration: 6.3, delay: 1.6, drift: -11 },
];

const CTA_BUTTON_CLASS =
  "min-w-[170px] shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer";

const Hero = (): ReactElement => {
  const [showLiveEventPopup, setShowLiveEventPopup] = useState(false);
  const [upcomingArtistEvent, setUpcomingArtistEvent] = useState<CalendarEvent | null>(null);
  const { content } = usePageContent();

  useEffect(() => {
    let popupTimer: number | null = null;
    let hideTimer: number | null = null;
    let isMounted = true;

    const checkLiveArtistEvents = async (): Promise<void> => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.events) {
          return;
        }

        const artistEvents = data.events.filter(
          (event: CalendarEvent) => event.eventType === "artist"
        );
        const now = new Date();
        const upcomingArtistEvents = artistEvents.filter(
          (event: CalendarEvent) => new Date(event.dates.startDate) >= now
        );

        if (upcomingArtistEvents.length === 0) {
          return;
        }

        if (!isMounted) {
          return;
        }

        setUpcomingArtistEvent(upcomingArtistEvents[0]);

        popupTimer = window.setTimeout(() => {
          setShowLiveEventPopup(true);
        }, 1000);

        hideTimer = window.setTimeout(() => {
          setShowLiveEventPopup(false);
        }, 9000);
      } catch (err: unknown) {
        console.error("[Hero-checkLiveArtistEvents] Error fetching artist events:", err);
      }
    };

    void checkLiveArtistEvents();

    return () => {
      isMounted = false;
      if (popupTimer !== null) {
        window.clearTimeout(popupTimer);
      }
      if (hideTimer !== null) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  return (
    <section className="relative -mt-4 flex min-h-[calc(100svh-var(--nav-offset,8rem)+1rem)] items-center md:-mt-6 md:min-h-[calc(100svh-var(--nav-offset,8rem)+1.5rem)]">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.985)_0%,rgba(255,255,255,0.95)_55%,rgba(255,255,255,0.75)_78%,rgba(255,255,255,0.3)_100%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(245,252,255,0.62),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {HERO_BUBBLES.map((bubble) => (
          <motion.span
            key={`${bubble.left}-${bubble.size}`}
            className="absolute bottom-[-90px] rounded-full border border-sky-200/95 bg-sky-100/65 shadow-[0_0_14px_rgba(14,116,144,0.35)] backdrop-blur-[1px]"
            style={{
              left: bubble.left,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
            animate={{
              y: [0, -500],
              x: [0, bubble.drift, bubble.drift * -0.55, 0],
              opacity: [0, 0.92, 0.7, 0],
              scale: [0.85, 1, 1.15, 1],
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={
          showLiveEventPopup ? { x: 0, opacity: 1 } : { x: "100%", opacity: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8,
        }}
        className="fixed right-4 top-1/2 z-50 max-w-xs rounded-xl bg-gradient-to-r from-slate-500 via-blue-400 to-slate-400 px-6 py-4 text-white shadow-2xl backdrop-blur-sm md:right-8"
      >
        <div className="text-center">
          <div className="mb-1 text-lg font-bold">Live Artist Event!</div>
          <p className="mb-3 text-sm font-bold opacity-90">
            Watch creativity unfold in real-time!
          </p>
          <Link
            href={
              upcomingArtistEvent
                ? `/events/live-artist/${createEventSlug(
                    upcomingArtistEvent.eventName,
                    upcomingArtistEvent._id
                  )}`
                : "/events/events"
            }
            className="inline-block rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-bold transition-all duration-300 hover:scale-105 hover:bg-white/30"
          >
            Learn More →
          </Link>
        </div>
      </motion.div>

      <SeaCreatures />

      <div className="container relative z-10 mx-auto flex w-full items-center px-6 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="relative mb-12 flex h-[320px] items-center justify-center rounded-[2rem] border border-slate-100 bg-white/82 px-3 py-3 shadow-[0_10px_28px_rgba(12,74,110,0.14)] sm:mb-14 md:mb-16 md:h-[280px]">
            <ThreeHeroText
              text={
                content?.homepage?.hero?.heading || DEFAULT_TEXT.homepage.hero.heading
              }
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/events/classes-workshops">
              <Button variant="pill" size="lg" className={CTA_BUTTON_CLASS}>
                Explore Classes
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="pill" size="lg" className={CTA_BUTTON_CLASS}>
                About Us
              </Button>
            </Link>
            <Link href="/gift-cards">
              <Button variant="pill" size="lg" className={CTA_BUTTON_CLASS}>
                Gift Cards
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
