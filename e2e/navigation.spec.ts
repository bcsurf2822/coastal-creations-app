import { test, expect } from "@playwright/test";

// Smoke test: the key public pages render and the nav works.
test("home page renders and key pages are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Coastal Creations/i);

  for (const path of ["/about", "/shop", "/gift-cards", "/calendar"]) {
    const res = await page.goto(path);
    expect(res?.status(), `${path} should respond OK`).toBeLessThan(400);
    // Each page has a visible <h1>/<h2> heading once rendered.
    await expect(page.locator("h1, h2").first()).toBeVisible();
  }
});
