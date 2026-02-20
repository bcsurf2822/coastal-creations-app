"use client";

import {
  useContext,
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

function usePreviousValue<T>(value: T): T | undefined {
  const prevValue = useRef<T>(undefined);

  useEffect(() => {
    prevValue.current = value;
    return () => {
      prevValue.current = undefined;
    };
  });

  return prevValue.current;
}

function FrozenRouter({ children }: { children: ReactNode }): ReactElement {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) || null;
  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);

  const changed =
    segment !== prevSegment &&
    segment !== undefined &&
    prevSegment !== undefined;

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext : context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

interface LayoutTransitionProps {
  children: ReactNode;
  className?: string;
}

const LayoutTransition = ({
  children,
  className,
}: LayoutTransitionProps): ReactElement => {
  const segment = useSelectedLayoutSegment();
  const shouldReduceMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [segment]);

  // Respect prefers-reduced-motion
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const enterY = isMobile ? 4 : 8;
  const exitDuration = isMobile ? 0.15 : 0.2;
  const enterDuration = isMobile ? 0.25 : 0.3;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        className={`min-h-screen ${className || ""}`}
        initial={{ opacity: 0, y: enterY }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: enterDuration, ease: "easeOut" },
        }}
        exit={{
          opacity: 0,
          transition: { duration: exitDuration, ease: "easeIn" },
        }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
};

export default LayoutTransition;
