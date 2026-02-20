"use client";

import type { ReactElement } from "react";
import { useEffect, useRef, useCallback } from "react";
import { Abril_Fatface } from "next/font/google";

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
});

interface ThreeHeroTextProps {
  text: string;
  className?: string;
}

const BASE_COLOR = "#0f4f70";
const HOVER_COLORS = [
  "#38bdf8", // center     - sky-400
  "#0ea5e9", // 1st ring   - sky-500
  "#0284c7", // 2nd ring   - sky-600
];
const HOVER_OFFSETS = [-6, -3, -1];
const HOVER_SHADOWS = [
  "0 0 18px rgba(56,189,248,0.45), 0 0 6px rgba(56,189,248,0.25)",
  "0 0 8px rgba(14,165,233,0.2)",
  "none",
];

const TRANSITION_STYLE = "0.3s color, 0.3s transform, 0.3s text-shadow";

// Wave auto-ripple timing
const WAVE_PAUSE_MIN = 2500;
const WAVE_PAUSE_MAX = 5000;
const WAVE_STEP_MS = 60;
const WAVE_HOLD_MS = 350;

const ThreeHeroText = ({ text, className = "" }: ThreeHeroTextProps): ReactElement => {
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const isHoveringRef = useRef(false);
  const mountedRef = useRef(true);

  const words = text.trim().split(/\s+/);

  const totalChars = words.reduce(
    (sum, word, i) => sum + word.length + (i < words.length - 1 ? 1 : 0),
    0,
  );

  const resetSpan = useCallback((span: HTMLSpanElement): void => {
    span.style.color = BASE_COLOR;
    span.style.transform = "translateY(0px)";
    span.style.textShadow = "none";
  }, []);

  const applyRipple = useCallback(
    (index: number): void => {
      const spans = spansRef.current;
      for (let ring = 0; ring < HOVER_COLORS.length; ring++) {
        const targets = ring === 0 ? [index] : [index - ring, index + ring];
        targets.forEach((i) => {
          if (i >= 0 && i < totalChars) {
            const span = spans[i];
            if (span) {
              span.style.color = HOVER_COLORS[ring];
              span.style.transform = `translateY(${HOVER_OFFSETS[ring]}px)`;
              span.style.textShadow = HOVER_SHADOWS[ring];
            }
          }
        });
      }
    },
    [totalChars],
  );

  const clearRipple = useCallback(
    (index: number): void => {
      const spans = spansRef.current;
      const range = HOVER_COLORS.length;
      for (let i = index - range; i <= index + range; i++) {
        if (i >= 0 && i < totalChars) {
          const span = spans[i];
          if (span) resetSpan(span);
        }
      }
    },
    [totalChars, resetSpan],
  );

  // Set transitions + hover listeners on mount
  useEffect(() => {
    mountedRef.current = true;
    const spans = spansRef.current;
    const enterHandlers: (() => void)[] = [];
    const leaveHandlers: (() => void)[] = [];

    spans.forEach((span, i) => {
      if (!span) return;
      span.style.transition = TRANSITION_STYLE;

      const onEnter = (): void => {
        isHoveringRef.current = true;
        applyRipple(i);
      };
      const onLeave = (): void => {
        isHoveringRef.current = false;
        clearRipple(i);
      };

      enterHandlers[i] = onEnter;
      leaveHandlers[i] = onLeave;
      span.addEventListener("mouseenter", onEnter);
      span.addEventListener("mouseleave", onLeave);
    });

    return () => {
      mountedRef.current = false;
      spans.forEach((span, i) => {
        if (!span) return;
        if (enterHandlers[i]) span.removeEventListener("mouseenter", enterHandlers[i]);
        if (leaveHandlers[i]) span.removeEventListener("mouseleave", leaveHandlers[i]);
      });
    };
  }, [applyRipple, clearRipple]);

  // Auto wave: sweeps a ripple across a random stretch of letters
  useEffect(() => {
    if (totalChars === 0) return;

    let timeoutId: number;
    let cancelled = false;

    const runWave = (): void => {
      if (cancelled) return;

      // Pick a random start position and wave length (6-14 chars)
      const waveLen = 6 + Math.floor(Math.random() * 9);
      const start = Math.floor(Math.random() * totalChars);
      // Randomly go left-to-right or right-to-left
      const direction = Math.random() > 0.5 ? 1 : -1;

      let step = 0;

      const tick = (): void => {
        if (cancelled || isHoveringRef.current) {
          scheduleNext();
          return;
        }

        const idx = start + step * direction;
        if (idx >= 0 && idx < totalChars) {
          applyRipple(idx);

          // Clear this letter after the hold duration
          window.setTimeout(() => {
            if (!isHoveringRef.current && mountedRef.current) {
              clearRipple(idx);
            }
          }, WAVE_HOLD_MS);
        }

        step++;
        if (step < waveLen) {
          timeoutId = window.setTimeout(tick, WAVE_STEP_MS);
        } else {
          scheduleNext();
        }
      };

      tick();
    };

    const scheduleNext = (): void => {
      if (cancelled) return;
      const pause = WAVE_PAUSE_MIN + Math.random() * (WAVE_PAUSE_MAX - WAVE_PAUSE_MIN);
      timeoutId = window.setTimeout(runWave, pause);
    };

    // Initial delay before first wave
    timeoutId = window.setTimeout(runWave, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [totalChars, applyRipple, clearRipple]);

  // Pre-compute word groups with stable global indices
  const wordGroups: { chars: { char: string; idx: number }[]; spaceIdx: number | null }[] = [];
  let idx = 0;
  words.forEach((word, wordIdx) => {
    const group: { chars: { char: string; idx: number }[]; spaceIdx: number | null } = {
      chars: [],
      spaceIdx: null,
    };
    Array.from(word).forEach((char) => {
      group.chars.push({ char, idx: idx++ });
    });
    if (wordIdx < words.length - 1) {
      group.spaceIdx = idx++;
    }
    wordGroups.push(group);
  });

  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className}`}>
      <h1
        className={`${abrilFatface.className} flex flex-wrap items-center justify-center px-4 text-center text-4xl leading-tight sm:text-5xl md:text-6xl`}
        style={{ color: BASE_COLOR }}
        aria-label={text}
      >
        {wordGroups.map((group, wordIdx) => (
          <span
            key={wordIdx}
            className="inline-flex"
            style={{ whiteSpace: "nowrap" }}
          >
            {group.chars.map(({ char, idx: charIdx }) => (
              <span
                key={charIdx}
                ref={(el) => {
                  spansRef.current[charIdx] = el;
                }}
                className="inline-block cursor-default"
                style={{
                  display: "inline-block",
                  willChange: "transform, color",
                }}
              >
                {char}
              </span>
            ))}
            {group.spaceIdx !== null && (
              <span
                key={`space-${wordIdx}`}
                ref={(el) => {
                  spansRef.current[group.spaceIdx!] = el;
                }}
                className="inline-block"
                style={{ minWidth: "0.6em", display: "inline-block" }}
              >
                {"\u00A0"}
              </span>
            )}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default ThreeHeroText;
