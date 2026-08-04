import { describe, it, expect, beforeEach } from "vitest";
import { calculatePopoverPosition } from "@/components/calendar/EventPopover";

function rect(partial: Partial<DOMRect>): DOMRect {
  const left = partial.left ?? 0;
  const top = partial.top ?? 0;
  const width = partial.width ?? 0;
  const height = partial.height ?? 0;
  return {
    left,
    top,
    width,
    height,
    right: partial.right ?? left + width,
    bottom: partial.bottom ?? top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: height });
}

describe("calculatePopoverPosition", () => {
  beforeEach(() => {
    setViewport(1024, 768);
  });

  it("centers above the anchor when there's room above", () => {
    const anchor = rect({ left: 400, top: 300, width: 100, height: 30 });
    const popover = rect({ width: 300, height: 200 });
    const result = calculatePopoverPosition(anchor, popover);
    expect(result.transformY).toBe("-100%");
    expect(result.transformX).toBe("-50%");
    expect(result.top).toBe(anchor.top - 10);
    expect(result.left).toBe(anchor.left + anchor.width / 2);
  });

  it("flips below the anchor when there's no room above but room below", () => {
    const anchor = rect({ left: 400, top: 20, width: 100, height: 30 });
    const popover = rect({ width: 300, height: 200 });
    const result = calculatePopoverPosition(anchor, popover);
    expect(result.transformY).toBe("0%");
    expect(result.top).toBe(anchor.bottom + 10);
  });

  it("clamps to the left edge instead of running off-screen", () => {
    const anchor = rect({ left: 10, top: 300, width: 50, height: 30 });
    const popover = rect({ width: 300, height: 200 });
    const result = calculatePopoverPosition(anchor, popover);
    expect(result.transformX).toBe("0%");
    expect(result.left).toBe(16); // margin
  });

  it("clamps to the right edge instead of running off-screen", () => {
    const anchor = rect({ left: 990, top: 300, width: 30, height: 30 });
    const popover = rect({ width: 300, height: 200 });
    const result = calculatePopoverPosition(anchor, popover);
    expect(result.transformX).toBe("-100%");
    expect(result.left).toBe(1024 - 16); // viewportWidth - margin
  });

  it("centers vertically when there's no room above or below", () => {
    setViewport(1024, 220);
    const anchor = rect({ left: 400, top: 100, width: 100, height: 30 });
    const popover = rect({ width: 300, height: 200 });
    const result = calculatePopoverPosition(anchor, popover);
    expect(result.transformY).toBe("-50%");
    expect(result.top).toBe(110); // viewportHeight / 2
  });
});
