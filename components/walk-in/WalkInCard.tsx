"use client";

import type { ReactElement, ReactNode } from "react";
import { motion } from "motion/react";

export interface WalkInCardProps {
  title: string;
  description: ReactNode;
  imageSlot: ReactNode;
  reverse?: boolean;
  index?: number;
  largeImage?: boolean;
}

export default function WalkInCard({
  title,
  description,
  imageSlot,
  reverse = false,
  index = 0,
  largeImage = false,
}: WalkInCardProps): ReactElement {
  const gridCols = largeImage
    ? reverse
      ? "md:grid-cols-[1.8fr_1fr]"
      : "md:grid-cols-[1fr_1.8fr]"
    : reverse
      ? "md:grid-cols-[1fr_1.05fr]"
      : "md:grid-cols-[1.05fr_1fr]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.08 }}
      className="group relative rounded-[28px] bg-white shadow-[0_10px_30px_rgba(12,74,110,0.12)] ring-1 ring-[var(--color-border-lighter)] transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(12,74,110,0.18)]"
    >
      <div
        className={`grid items-center gap-6 p-6 md:gap-10 md:p-10 ${gridCols}`}
      >
        <div
          className={`flex flex-col items-center text-center ${
            reverse ? "md:order-2" : "md:order-1"
          }`}
        >
          <h2
            className="mb-4 text-3xl font-bold text-[var(--color-primary)] md:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            {title}
          </h2>
          <div className="mb-5 h-[3px] w-14 rounded-full bg-[var(--color-accent)]" />
          <div
            className="max-w-md text-base leading-relaxed text-[var(--color-primary)]/85 md:text-lg lg:text-xl"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {description}
          </div>
        </div>
        <div
          className={`flex items-center justify-center ${
            reverse ? "md:order-1" : "md:order-2"
          }`}
        >
          {imageSlot}
        </div>
      </div>
    </motion.article>
  );
}
