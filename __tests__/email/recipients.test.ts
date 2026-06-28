import { describe, it, expect, afterEach, vi } from "vitest";
import {
  resolveEmailRecipients,
  FALLBACK_STUDIO_EMAIL,
} from "@/lib/email/recipients";

afterEach(() => vi.unstubAllEnvs());

describe("resolveEmailRecipients", () => {
  it("in production sends to the real customer + STUDIO_EMAIL", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("STUDIO_EMAIL", "studio@coastal.com");
    expect(resolveEmailRecipients("buyer@example.com")).toEqual({
      customer: "buyer@example.com",
      admin: "studio@coastal.com",
    });
  });

  it("in production falls back to the hardcoded studio email when STUDIO_EMAIL is unset", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("STUDIO_EMAIL", "");
    expect(resolveEmailRecipients("buyer@example.com").admin).toBe(FALLBACK_STUDIO_EMAIL);
  });

  it("in dev/stage sends the customer copy to the real address, only the admin copy to DEV_EMAIL", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("DEV_EMAIL", "dev@coastal.com");
    expect(resolveEmailRecipients("buyer@example.com")).toEqual({
      customer: "buyer@example.com",
      admin: "dev@coastal.com",
    });
  });

  it("in dev with no DEV_EMAIL falls back to the customer address for admin too", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("DEV_EMAIL", "");
    expect(resolveEmailRecipients("buyer@example.com")).toEqual({
      customer: "buyer@example.com",
      admin: "buyer@example.com",
    });
  });
});
