"use client";

import React from "react";
import { motion } from "motion/react";
import { Abril_Fatface } from "next/font/google";

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
});

interface WaveTextProps {
  text?: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
}

const WaveText: React.FC<WaveTextProps> = ({
  text = "Welcome To Coastal Creations Studio",
  className = "",
  delay = 0,
  duration = 0.5,
  staggerDelay = 0.08,
}) => {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        duration: duration,
      },
    },
  };

  let letterIndex = 0;

  return (
    <motion.h2
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${abrilFatface.className} font-bold text-center flex justify-center items-center flex-wrap ${className}`}
      style={{ color: "#326C85" }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="inline-block"
          style={{ whiteSpace: "nowrap" }}
        >
          {Array.from(word).map((letter) => {
            const currentIndex = letterIndex++;
            return (
              <motion.span
                key={currentIndex}
                variants={letterVariants}
                style={{ display: "inline-block" }}
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <motion.span
              key={letterIndex++}
              variants={letterVariants}
              style={{ display: "inline-block", minWidth: "1rem" }}
            >
              {"\u00A0"}
            </motion.span>
          )}
        </span>
      ))}
    </motion.h2>
  );
};

export default WaveText;
