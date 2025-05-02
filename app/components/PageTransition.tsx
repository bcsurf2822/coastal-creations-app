"use client";

import { motion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

// Animation variants
const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
};

// Mobile variants (subtler animations)
const mobileVariants = {
  fadeIn: variants.fadeIn,
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
  slideRight: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
};

type AnimationVariant = keyof typeof variants;

type PageTransitionProps = {
  children: ReactNode;
  variant?: AnimationVariant;
  duration?: number;
};

export default function PageTransition({
  children,
  variant = "fadeInUp",
  duration = 0.3,
}: PageTransitionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeVariants = isMobile ? mobileVariants : variants;

  return (
    <motion.div
      initial={false} // Skip initial animation
      animate={activeVariants[variant].animate}
      exit={activeVariants[variant].exit}
      transition={{
        duration: isMobile ? duration * 0.8 : duration,
        ease: "easeInOut",
        type: "tween",
      }}
    >
      {children}
    </motion.div>
  );
}
