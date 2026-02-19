"use client";

import type { ReactElement } from "react";
import { motion } from "motion/react";
import Image from "next/image";

interface SeaCreatureConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  driftX: [number, number, number, number];
  driftY: [number, number, number, number];
  driftRotate: [number, number, number, number];
  duration: number;
  delay: number;
}

const SEA_CREATURES: SeaCreatureConfig[] = [
  {
    src: "/assets/svg/animate/starfish.svg",
    alt: "Starfish",
    width: 88,
    height: 88,
    className: "top-4 left-12 opacity-50",
    driftX: [0, 14, -10, 0],
    driftY: [0, -18, 14, 0],
    driftRotate: [0, 9, -7, 0],
    duration: 6.4,
    delay: 0.3,
  },
  {
    src: "/assets/svg/animate/fish1.svg",
    alt: "Fish",
    width: 104,
    height: 104,
    className: "top-6 right-8 opacity-30",
    driftX: [0, -22, 12, 0],
    driftY: [0, 10, -16, 0],
    driftRotate: [0, -8, 7, 0],
    duration: 6.9,
    delay: 1.1,
  },
  {
    src: "/assets/svg/animate/octopus.svg",
    alt: "Octopus",
    width: 96,
    height: 96,
    className: "top-16 left-1/4 opacity-45",
    driftX: [0, 12, -18, 0],
    driftY: [0, -20, 8, 0],
    driftRotate: [0, 7, -8, 0],
    duration: 6,
    delay: 0.7,
  },
  {
    src: "/assets/svg/animate/stingray.svg",
    alt: "Stingray",
    width: 102,
    height: 102,
    className: "top-20 right-1/3 opacity-25",
    driftX: [0, -18, 14, 0],
    driftY: [0, 14, -20, 0],
    driftRotate: [0, -9, 6, 0],
    duration: 6.7,
    delay: 1.5,
  },
  {
    src: "/assets/svg/animate/shark.svg",
    alt: "Shark",
    width: 122,
    height: 122,
    className: "top-1/3 left-4 opacity-50",
    driftX: [0, 20, -12, 0],
    driftY: [0, -12, 18, 0],
    driftRotate: [0, 6, -7, 0],
    duration: 6.3,
    delay: 2.1,
  },
  {
    src: "/assets/svg/jellyfish.svg",
    alt: "Jellyfish",
    width: 82,
    height: 82,
    className: "top-2/5 right-4 opacity-60",
    driftX: [0, -10, 16, 0],
    driftY: [0, -24, 10, 0],
    driftRotate: [0, -5, 6, 0],
    duration: 5.8,
    delay: 0.9,
  },
  {
    src: "/assets/svg/shell-paint.svg",
    alt: "Shell",
    width: 72,
    height: 72,
    className: "top-3/5 left-1/5 opacity-40",
    driftX: [0, 12, -8, 0],
    driftY: [0, -14, 12, 0],
    driftRotate: [0, 8, -5, 0],
    duration: 6.1,
    delay: 1.9,
  },
  {
    src: "/assets/svg/turtle.svg",
    alt: "Turtle",
    width: 98,
    height: 98,
    className: "top-2/3 right-1/4 opacity-55",
    driftX: [0, -16, 18, 0],
    driftY: [0, 12, -16, 0],
    driftRotate: [0, -6, 7, 0],
    duration: 7.1,
    delay: 2.5,
  },
  {
    src: "/assets/svg/animate/fish1.svg",
    alt: "Fish",
    width: 92,
    height: 92,
    className: "bottom-12 left-8 opacity-50",
    driftX: [0, 16, -20, 0],
    driftY: [0, -18, 10, 0],
    driftRotate: [0, 9, -8, 0],
    duration: 6,
    delay: 1.3,
  },
  {
    src: "/assets/svg/animate/octopus.svg",
    alt: "Octopus",
    width: 90,
    height: 90,
    className: "bottom-8 left-1/3 opacity-45",
    driftX: [0, -14, 12, 0],
    driftY: [0, 10, -18, 0],
    driftRotate: [0, -7, 9, 0],
    duration: 6.8,
    delay: 0.5,
  },
  {
    src: "/assets/svg/animate/stingray.svg",
    alt: "Stingray",
    width: 96,
    height: 96,
    className: "bottom-16 right-12 opacity-60",
    driftX: [0, 18, -12, 0],
    driftY: [0, -12, 16, 0],
    driftRotate: [0, 8, -6, 0],
    duration: 5.9,
    delay: 1.8,
  },
  {
    src: "/assets/svg/turtle.svg",
    alt: "Turtle",
    width: 68,
    height: 68,
    className: "top-1/4 left-2/3 opacity-35",
    driftX: [0, -12, 14, 0],
    driftY: [0, 14, -10, 0],
    driftRotate: [0, -7, 5, 0],
    duration: 6.2,
    delay: 2.2,
  },
  {
    src: "/assets/svg/jellyfish.svg",
    alt: "Jellyfish",
    width: 74,
    height: 74,
    className: "top-3/4 left-1/2 opacity-40",
    driftX: [0, 10, -16, 0],
    driftY: [0, -20, 14, 0],
    driftRotate: [0, 6, -8, 0],
    duration: 5.7,
    delay: 0.8,
  },
  {
    src: "/assets/svg/shell-paint.svg",
    alt: "Shell",
    width: 66,
    height: 66,
    className: "top-1/2 left-3/4 opacity-35",
    driftX: [0, -14, 9, 0],
    driftY: [0, 12, -14, 0],
    driftRotate: [0, -6, 7, 0],
    duration: 6.6,
    delay: 1.4,
  },
];

const SeaCreatures = (): ReactElement => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {SEA_CREATURES.map((creature) => (
        <div
          key={`${creature.alt}-${creature.className}`}
          className={`absolute ${creature.className}`}
          style={{ width: `${creature.width}px`, height: `${creature.height}px` }}
        >
          <motion.div
            className="h-full w-full will-change-transform"
            animate={{
              x: creature.driftX,
              y: creature.driftY,
              rotate: creature.driftRotate,
            }}
            transition={{
              duration: creature.duration,
              delay: creature.delay,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            <Image
              src={creature.src}
              alt={creature.alt}
              width={creature.width}
              height={creature.height}
              className="h-full w-full"
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default SeaCreatures;
