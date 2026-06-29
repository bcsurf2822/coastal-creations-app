import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — follows the Next.js E2E guide
 * (https://nextjs.org/docs/app/guides/testing/playwright).
 *
 * Runs the specs against a PRODUCTION build (`next build && next start`) via the
 * webServer block, which is what the guide recommends to mirror real behavior.
 * Locally it reuses an already-running dev server if you have one.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
