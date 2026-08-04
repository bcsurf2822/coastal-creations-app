"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { createPortal } from "react-dom";

export interface PopoverEvent {
  title: string;
  eventType: string;
  timeDisplay: string;
  price?: number;
  isFree?: boolean;
  description?: string;
  currentSignups: number;
  isRecurring?: boolean;
  recurringPattern?: string;
  recurringEndDate?: string | Date;
  _id: string;
  isSoldOut: boolean;
}

export type PopoverMode = "hover" | "pinned";

const COMPACT_QUERY = "(hover: none), (pointer: coarse), (max-width: 640px)";

interface EventPopoverProps {
  event: PopoverEvent;
  anchorRect: DOMRect;
  mode: PopoverMode;
  eventColor: string;
  onRequestClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onSignUp: () => void;
  onViewDetails: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  artist: "Live Demo",
  camp: "Art Camp",
  workshop: "Workshop",
  event: "Workshop",
};

function typeLabel(eventType: string): string {
  return TYPE_LABELS[eventType] ?? "Class";
}

/** Anchor the popover near the event chip, flipping above/below and clamping
 * horizontally so it never runs off-screen. Positioned once on open — the
 * caller closes the popover on scroll/resize/navigation rather than trying
 * to keep a live position in sync with a moving anchor. */
export function calculatePopoverPosition(
  anchorRect: DOMRect,
  popoverRect: DOMRect
): { left: number; top: number; transformX: string; transformY: string } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 16;

  let left = anchorRect.left + anchorRect.width / 2;
  let top = anchorRect.top - 10;
  let transformX = "-50%";
  let transformY = "-100%";

  const halfWidth = popoverRect.width / 2;
  if (left - halfWidth < margin) {
    left = margin;
    transformX = "0%";
  } else if (left + halfWidth > viewportWidth - margin) {
    left = viewportWidth - margin;
    transformX = "-100%";
  }

  const spaceAbove = anchorRect.top;
  const spaceBelow = viewportHeight - anchorRect.bottom;
  const height = popoverRect.height;

  if (spaceAbove < height + margin && spaceBelow > height + margin) {
    top = anchorRect.bottom + 10;
    transformY = "0%";
  } else if (spaceAbove < height + margin && spaceBelow < height + margin) {
    top = viewportHeight / 2;
    transformY = "-50%";
    if (left < viewportWidth / 2) {
      left = Math.max(margin, anchorRect.right + 10);
      transformX = "0%";
    } else {
      left = Math.min(viewportWidth - margin, anchorRect.left - 10);
      transformX = "-100%";
    }
  }

  return { left, top, transformX, transformY };
}

export default function EventPopover({
  event,
  anchorRect,
  mode,
  eventColor,
  onRequestClose,
  onPointerEnter,
  onPointerLeave,
  onSignUp,
  onViewDetails,
}: EventPopoverProps): ReactElement | null {
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden" });
  // Compact (fixed bottom sheet) below the same breakpoint the rest of the
  // calendar already treats as mobile — matches calendar.css's 640px/768px cuts.
  const [isCompact, setIsCompact] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(COMPACT_QUERY).matches
  );

  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const listener = (e: MediaQueryListEvent): void => setIsCompact(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  useLayoutEffect(() => {
    if (isCompact || !popoverRef.current) {
      setStyle({});
      return;
    }
    const rect = popoverRef.current.getBoundingClientRect();
    const { left, top, transformX, transformY } = calculatePopoverPosition(
      anchorRect,
      rect
    );
    setStyle({
      position: "fixed",
      left,
      top,
      transform: `translate(${transformX}, ${transformY})`,
    });
  }, [anchorRect, isCompact]);

  // Escape always closes. Outside click only closes a pinned popover — a
  // hover popover is already dismissed by the pointer-leave timer.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onRequestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onRequestClose]);

  useEffect(() => {
    if (mode !== "pinned") return;
    const onPointerDown = (e: PointerEvent): void => {
      if (!popoverRef.current?.contains(e.target as Node)) {
        onRequestClose();
      }
    };
    // Delay one tick so the click that opened this popover doesn't also close it.
    const id = window.setTimeout(
      () => document.addEventListener("pointerdown", onPointerDown),
      0
    );
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mode, onRequestClose]);

  useEffect(() => {
    if (mode === "pinned") closeButtonRef.current?.focus();
  }, [mode]);

  const currentSignups = event.currentSignups;
  const showParticipants = currentSignups > 5 && event.eventType !== "artist";

  const content = (
    <>
      {mode === "pinned" && isCompact && (
        <div
          className="event-popover-backdrop"
          onClick={onRequestClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={event.title}
        className={`event-popover ${mode === "hover" ? "event-popover--hover" : "event-popover--pinned"} ${isCompact ? "event-popover--compact" : ""}`}
        style={style}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === "pinned" && (
          <button
            ref={closeButtonRef}
            type="button"
            className="event-popover-close"
            onClick={onRequestClose}
            aria-label="Close"
          >
            &times;
          </button>
        )}

        <span
          className="event-popover-type"
          style={{ backgroundColor: eventColor }}
        >
          {typeLabel(event.eventType)}
        </span>

        <div className="event-popover-title">{event.title}</div>

        {event.timeDisplay && (
          <div className="event-popover-time">{event.timeDisplay}</div>
        )}

        <div className="event-popover-body">
          {typeof event.price === "number" && event.price > 0 && (
            <div className="event-popover-price">Price: ${event.price}</div>
          )}
          {(event.isFree || event.price === 0) && (
            <div className="event-popover-price">Free</div>
          )}

          {showParticipants && (
            <div className="event-popover-participants">
              {currentSignups} / 20 signed up
            </div>
          )}

          {event.isRecurring && (
            <div className="event-popover-recurring">
              Recurring {event.recurringPattern}
              {event.recurringEndDate
                ? ` until ${new Date(event.recurringEndDate).toLocaleDateString()}`
                : ""}
            </div>
          )}

          {event.description && (
            <div className="event-popover-description">
              {event.description}
            </div>
          )}
        </div>

        <div className="event-popover-actions">
          {event.eventType === "artist" ? (
            <button
              type="button"
              className="event-popover-cta"
              onClick={onViewDetails}
            >
              View Details
            </button>
          ) : event.isSoldOut ? (
            <div className="event-popover-soldout">Sold Out</div>
          ) : (
            <button
              type="button"
              className="event-popover-cta"
              onClick={onSignUp}
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
