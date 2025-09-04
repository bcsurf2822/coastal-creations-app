"use client";

// import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
// import { Abril_Fatface } from "next/font/google";
import WaveText from "./WaveText";
import SeaCreatures from "./SeaCreatures";

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

// const abrilFatface = Abril_Fatface({
//   subsets: ["latin"],
//   weight: "400",
// });

export default function Hero() {
  const [showLiveEventPopup, setShowLiveEventPopup] = useState(false);

  useEffect(() => {

    // Check for live artist events
    const checkLiveArtistEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.events) {
          // Filter for artist events and check if any are upcoming
          const artistEvents = data.events.filter(
            (event: CalendarEvent) => event.eventType === "artist"
          );

          const now = new Date();
          const upcomingArtistEvents = artistEvents.filter(
            (event: CalendarEvent) => new Date(event.dates.startDate) >= now
          );

          const hasUpcomingEvents = upcomingArtistEvents.length > 0;

          // Only show popup if there are live artist events
          if (hasUpcomingEvents) {
            // Show the live event popup after 1 second
            const popupTimer = setTimeout(() => {
              setShowLiveEventPopup(true);
            }, 1000);

            // Auto-hide the popup after 8 seconds
            const hideTimer = setTimeout(() => {
              setShowLiveEventPopup(false);
            }, 9000);

            return () => {
              clearTimeout(popupTimer);
              clearTimeout(hideTimer);
            };
          }
        }
      } catch (err) {
        console.error("[Hero-checkLiveArtistEvents] Error fetching artist events:", err);
      }
    };

    checkLiveArtistEvents();
  }, []);


  return (
    <section className="relative -mt-4 md:-mt-6 pb-16 md:pb-20">
      <div className="absolute inset-0 z-0 bg-white/90 backdrop-blur-sm">
      </div>

      {/* Live Artist Event Popup */}
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
        className="fixed top-1/2 right-4 md:right-8 z-50 bg-gradient-to-r from-slate-500 via-blue-400 to-slate-400  px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm max-w-xs text-white"
      >
        <motion.div
          animate={
            showLiveEventPopup
              ? {
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="relative"
        >
          {/* Sparkle effects */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute -top-2 -right-2 text-yellow-300 text-xl"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
            className="absolute -bottom-1 -left-1 text-yellow-300 text-lg"
          ></motion.div>

          <div className="text-center">
            <motion.div
              animate={{
                textShadow: [
                  "0 0 5px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.8)",
                  "0 0 5px rgba(255,255,255,0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="font-bold text-lg mb-1"
            >
              Live Artist Event!
            </motion.div>
            <p className="text-sm opacity-90 mb-3 font-bold">
              Watch creativity unfold in real-time!
            </p>
            <Link
              href="/classes/live-artist"
              className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 border border-white/30"
            >
              Learn More →
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <SeaCreatures />
      <div className="container mx-auto px-6 md:px-12 relative z-10 pt-8 md:pt-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-20 sm:mb-24 h-[320px] md:h-[280px] flex items-center justify-center relative">
            <WaveText
              text="Welcome to Coastal Creations Studio"
              className="text-4xl sm:text-5xl md:text-6xl leading-tight relative z-10"
              delay={0.3}
              staggerDelay={0.05}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/classes"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-base sm:text-xl tracking-wide"
            >
              Explore Classes
            </Link>
            <Link
              href="/about"
              className="bg-white hover:bg-gray-50 border-2 border-slate-600 text-slate-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-base sm:text-xl tracking-wide"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
