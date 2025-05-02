"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Define words in the specific order and positioning seen in the image
  const words = ["Welcome", "to", "Coastal", "Creations", "Studio"];

  return (
    <section className="relative py-16 md:py-20">
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

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {isClient ? (
            <div className="mb-20 sm:mb-24 h-[320px] md:h-[280px] flex items-center justify-center relative">
              {words.map((word, index) => {
                // Define specific positioning for each word based on device size
                const getPosition = () => {
                  // Desktop layout (side by side for some words)
                  if (windowWidth >= 1024) {
                    return [
                      { x: 0, y: -100 }, // Welcome
                      { x: 0, y: -40 }, // to
                      { x: -150, y: 20 }, // Coastal - reduced spacing
                      { x: 150, y: 20 }, // Creations - reduced spacing
                      { x: 0, y: 110 }, // Studio
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
                    className={`font-serif ${sizes[index]} font-bold text-primary inline-block absolute`}
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
                    }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          ) : (
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary leading-tight mb-20 sm:mb-24 h-[280px] flex items-center justify-center">
              Welcome to Coastal Creations Studio
            </h2>
          )}

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/classes"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-base sm:text-lg tracking-wide"
            >
              Explore Classes
            </Link>
            <Link
              href="/about"
              className="bg-white hover:bg-gray-50 border-2 border-slate-600 text-slate-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-base sm:text-lg tracking-wide"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
