import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";
const CUSTOMER = "Alice";
const EMAIL = "alice@example.com";

test.describe("Order Placement & Confirmation Page", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails(CUSTOMER, EMAIL);
    await app.checkout.fillValidCard();
  });

  test("Submitting valid form navigates to confirmation page", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();
  });

  test("Confirmation page shows customer name in greeting [Locale-aware]", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.title).toContainText(CUSTOMER);
  });

  test("Confirmation page shows ETA of 30 min [Locale-aware]", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.eta).toContainText("30 min");
  });

  test("Back to menu button returns to product grid [Locale-aware]", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();

    await app.confirmation.back();
    await expect(app.menu.productGrid).toBeVisible();
  });

  // Rule 7.7 — cart is cleared after a valid order submission
  test("Cart is cleared after successful order submission", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();

    await app.confirmation.back();
    await expect(app.header.cartCount).toHaveText("0");
  });

  // Rules 10.1 + 7.5 — delivery fields are read-only display elements; saved ZIP shown
  test("Delivery section shows saved address read-only and ZIP matches saved location", async ({ app, page }) => {
    // checkout-zip shows the saved delivery ZIP (not an editable input)
    await expect(page.getByTestId("checkout-zip")).toContainText("05413");

    // Delivery rows are Typography <p> elements, not TextField inputs
    for (const id of ["checkout-zip", "checkout-city-state", "checkout-country"]) {
      const el = page.getByTestId(id);
      await expect(el).toBeVisible();
      const tag = await el.evaluate((e) => e.tagName.toLowerCase());
      expect(tag).not.toBe("input");
    }
  });
});
