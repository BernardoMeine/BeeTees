import { test, expect } from "../helpers/fixtures";

test.describe("Promo Banner", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  // TC-11-01
  test("Banner is visible on the shop page", async ({ app }) => {
    await expect(app.menu.promoBanner).toBeVisible();
  });

  // TC-11-02
  test("All three promo slides are rendered in the DOM", async ({ app }) => {
    await expect(app.menu.promoSlide("combo")).toBeAttached();
    await expect(app.menu.promoSlide("spicy")).toBeAttached();
    await expect(app.menu.promoSlide("delivery")).toBeAttached();
  });

  // TC-11-03
  test("Navigation dot switches the active slide", async ({ app, page }) => {
    // First slide (index 0) should be active by default
    await expect(page.getByTestId("promo-dot-0")).toHaveAttribute("aria-current", "true");

    // Click second dot
    await page.getByTestId("promo-dot-1").click();

    await expect(page.getByTestId("promo-dot-1")).toHaveAttribute("aria-current", "true");
    await expect(app.menu.promoSlide("spicy")).toHaveAttribute("aria-hidden", "false");
  });

  // TC-11-04
  test("Auto-rotation pauses while hovering over the banner", async ({ app, page }) => {
    // Confirm starting on slide 0
    await expect(page.getByTestId("promo-dot-0")).toHaveAttribute("aria-current", "true");

    // Hover to pause rotation
    await app.menu.promoBanner.hover();

    // Wait beyond the 5 500 ms rotation interval
    await page.waitForTimeout(6000);

    // Slide must not have advanced
    await expect(page.getByTestId("promo-dot-0")).toHaveAttribute("aria-current", "true");
  });
});
