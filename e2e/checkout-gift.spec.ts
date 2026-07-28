import { test, expect } from "@playwright/test";

// Seed a cart in localStorage (key cc_cart) before the app hydrates, then reach
// checkout via the cart's "Proceed to Checkout" link (client nav keeps cart
// state — a hard nav to /checkout can bounce to /cart before hydration).
const CART_ITEM = {
  squareCatalogItemId: "item_e2e",
  squareVariationId: "var_e2e",
  productName: "Test Art Kit",
  variationName: "Regular",
  priceCents: 5000,
  imageUrl: "",
  imageAlt: "Test Art Kit",
  slug: "test-art-kit-item_e2e",
  quantity: 1,
  maxQuantity: 5,
};

test.describe("store checkout — gift shipping", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((item) => {
      window.localStorage.setItem("cc_cart", JSON.stringify([item]));
    }, CART_ITEM);
  });

  test("gift toggle reveals recipient fields and switches the heading", async ({ page }) => {
    await page.goto("/cart");
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);

    await expect(page.getByRole("heading", { name: "Your contact details" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();
    await expect(page.getByText("Recipient First Name")).toHaveCount(0);

    await page.getByRole("checkbox", { name: /ship to a different address/i }).check();

    await expect(page.getByRole("heading", { name: "Ship to recipient" })).toBeVisible();
    await expect(page.getByText("Recipient First Name")).toBeVisible();
    await expect(page.getByText("Recipient Last Name")).toBeVisible();
  });
});
