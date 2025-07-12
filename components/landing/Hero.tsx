"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Abril_Fatface } from "next/font/google";

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
});

export default function Hero() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [showLiveEventPopup, setShowLiveEventPopup] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
    }

    // Show the live event popup after 1 second
    const popupTimer = setTimeout(() => {
      setShowLiveEventPopup(true);
    }, 1000); // Show after 1 second

    // Auto-hide the popup after 8 seconds
    const hideTimer = setTimeout(() => {
      setShowLiveEventPopup(false);
    }, 9000); // Hide after 9 seconds (1s delay + 8s display)

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
      clearTimeout(popupTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Define words in the specific order and positioning seen in the image
  const words = ["Welcome", "to", "Coastal", "Creations", "Studio"];

  return (
    <section className="relative -mt-4 md:-mt-6 pb-16 md:pb-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/backgrounds/seaAndBrushSolidBG.png"
          alt="Coastal pattern background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/60" />
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
        className="fixed top-1/2 right-4 md:right-8 z-50 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-sm max-w-xs"
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
          >
            ✨
          </motion.div>
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
          >
            ⭐
          </motion.div>

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
              🎨 Live Artist Event! 🎨
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

      <div className="container mx-auto px-6 md:px-12 relative z-10 pt-8 md:pt-12">
        <div className="max-w-4xl mx-auto text-center">
          {isClient ? (
            <div className="mb-20 sm:mb-24 h-[320px] md:h-[280px] flex items-center justify-center relative text-slate-800">
              {words.map((word, index) => {
                // Define specific positioning for each word based on device size
                const getPosition = () => {
                  // Desktop layout (two lines)
                  if (windowWidth >= 1024) {
                    return [
                      { x: -80, y: -50 }, // Welcome
                      { x: 130, y: -50 }, // to
                      { x: -280, y: 50 }, // Coastal
                      { x: 0, y: 50 }, // Creations
                      { x: 260, y: 50 }, // Studio
                    ][index];
                  }

                  // Tablet and mobile - stack vertically
                  return [
                    { x: 0, y: -140 }, // Welcome
                    { x: 0, y: -70 }, // to
                    { x: 0, y: 0 }, // Coastal - centered
                    { x: 0, y: 70 }, // Creations - centered
                    { x: 0, y: 140 }, // Studio
                  ][index];
                };

                // Text sizes for each word with consistent sizing
                const sizes = [
                  "text-5xl sm:text-6xl lg:text-6xl", // Welcome
                  "text-4xl sm:text-5xl lg:text-5xl", // to - slightly smaller
                  "text-5xl sm:text-6xl lg:text-6xl", // Coastal
                  "text-5xl sm:text-6xl lg:text-6xl", // Creations
                  "text-5xl sm:text-6xl lg:text-6xl", // Studio
                ];

                return (
                  <motion.span
                    key={index}
                    className={`${abrilFatface.className} ${sizes[index]} font-bold inline-block absolute`}
                    initial={{
                      opacity: 0,
                      x: Math.sin((index / words.length) * Math.PI * 2) * 300,
                      y: Math.cos((index / words.length) * Math.PI * 2) * 200,
                      scale: 0.2,
                      rotate: (index * 45) % 360,
                    }}
                    animate={{
                      opacity: 1,
                      x: getPosition().x,
                      y: getPosition().y,
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 70,
                      damping: 15,
                    }}
                    style={{
                      transformOrigin: "center center",
                      zIndex: 10 - index,
                      letterSpacing: "0.02em", // Consistent letter spacing
                      color: "#326C85",
                    }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          ) : (
            <h2
              className={`${abrilFatface.className} text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-20 sm:mb-24 h-[280px] flex items-center justify-center`}
              style={{ color: "#326C85" }}
            >
              Welcome to Coastal Creations Studio
            </h2>
          )}

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
