import { test, expect } from "@playwright/test";

// The contact form adds a stricter email check on top of the browser's native
// type="email" validation. "a@b" passes native validation (has an @) but fails
// our regex (no TLD), so it exercises the app's own inline error.
test("contact form blocks a malformed email with an inline error", async ({ page }) => {
  await page.goto("/contact-us");

  await page.locator("#name").fill("Test Person");
  await page.locator("#email").fill("a@b");
  await page.locator("#subject").fill("Hello");
  await page.locator("#description").fill("Just testing the form.");

  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
});
