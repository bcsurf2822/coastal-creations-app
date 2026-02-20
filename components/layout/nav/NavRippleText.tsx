"use client";

import type { ReactElement } from "react";
import { useEffect, useRef, useCallback } from "react";

interface NavRippleTextProps {
  text: string;
}

const BASE_COLOR = "#0f172a";
const RIPPLE_COLORS = ["#0369a1", "#0369a1", "#1e6fa1"];
const RIPPLE_OFFSETS = [-3, -1.5, -0.5];
const TRANSITION = "0.25s color, 0.25s transform";

const NavRippleText = ({ text }: NavRippleTextProps): ReactElement => {
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = Array.from(text);
  const total = chars.length;

  const resetSpan = useCallback((span: HTMLSpanElement): void => {
    span.style.color = BASE_COLOR;
    span.style.transform = "translateY(0px)";
  }, []);

  const applyRipple = useCallback(
    (index: number): void => {
      const spans = spansRef.current;
      for (let ring = 0; ring < RIPPLE_COLORS.length; ring++) {
        const targets = ring === 0 ? [index] : [index - ring, index + ring];
        targets.forEach((i) => {
          if (i >= 0 && i < total) {
            const span = spans[i];
            if (span) {
              span.style.color = RIPPLE_COLORS[ring];
              span.style.transform = `translateY(${RIPPLE_OFFSETS[ring]}px)`;
            }
          }
        });
      }
    },
    [total],
  );

  const clearRipple = useCallback(
    (index: number): void => {
      const spans = spansRef.current;
      const range = RIPPLE_COLORS.length;
      for (let i = index - range; i <= index + range; i++) {
        if (i >= 0 && i < total) {
          const span = spans[i];
          if (span) resetSpan(span);
        }
      }
    },
    [total, resetSpan],
  );

  useEffect(() => {
    const spans = spansRef.current;
    const enterHandlers: (() => void)[] = [];
    const leaveHandlers: (() => void)[] = [];

    spans.forEach((span, i) => {
      if (!span) return;
      span.style.transition = TRANSITION;

      const onEnter = (): void => applyRipple(i);
      const onLeave = (): void => clearRipple(i);

      enterHandlers[i] = onEnter;
      leaveHandlers[i] = onLeave;
      span.addEventListener("mouseenter", onEnter);
      span.addEventListener("mouseleave", onLeave);
    });

    return () => {
      spans.forEach((span, i) => {
        if (!span) return;
        if (enterHandlers[i]) span.removeEventListener("mouseenter", enterHandlers[i]);
        if (leaveHandlers[i]) span.removeEventListener("mouseleave", leaveHandlers[i]);
      });
    };
  }, [applyRipple, clearRipple]);

  return (
    <span className="inline-flex">
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            spansRef.current[i] = el;
          }}
          className="inline-block"
          style={{
            color: BASE_COLOR,
            willChange: "transform, color",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

export default NavRippleText;
