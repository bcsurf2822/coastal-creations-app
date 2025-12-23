import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Reset fetch mock before each test
beforeEach(() => {
  global.fetch = vi.fn();
});

// Reset all mocks after each test
afterEach(() => {
  vi.resetAllMocks();
});
