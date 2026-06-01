import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

// US location keeps locale en-US so label text matches English selectors
const BURGER_ID = "cheeseburguer";
const TENDER_ID = "pack-tenders-spicy";
const DRINK_ID = "doctor-bt";

test.describe("Product Customizer", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.newYork.zip, ZIPS.newYork.country);
  });

  // TC-13-01
  test("Clicking Add to cart with valid location opens the customizer", async ({ app, page }) => {
    const badgeBefore = await app.header.cartCount.textContent();

    await app.menu.addProduct(BURGER_ID);

    await expect(page.getByTestId("item-customizer")).toBeVisible();
    await expect(app.header.cartCount).toHaveText(badgeBefore!);
  });

  // TC-13-02
  test("Customizer resets when a different product is opened", async ({ app, page }) => {
    const dialog = page.getByTestId("item-customizer");

    await app.menu.addProduct(BURGER_ID);
    await dialog.locator('input[type="radio"][value="2"]').click();
    await expect(dialog.locator('input[type="radio"][value="2"]')).toBeChecked();

    await page.keyboard.press("Escape");

    await app.menu.addProduct("bt-special");
    await expect(dialog.locator('input[type="radio"][value="1"]')).toBeChecked();
    await page.keyboard.press("Escape");
  });

  // TC-13-03
  test("Patty selector appears only for burger products", async ({ app, page }) => {
    const dialog = page.getByTestId("item-customizer");

    await app.menu.addProduct(BURGER_ID);
    await expect(dialog.locator('input[type="radio"][value="1"]')).toBeVisible();
    await page.keyboard.press("Escape");

    await app.menu.addProduct(TENDER_ID);
    await expect(dialog.locator('input[type="radio"][value="1"]')).not.toBeVisible();
    await page.keyboard.press("Escape");
  });

  // TC-13-04 — cheeseburguer $3.49 + 2 patties $2.00 = $5.49
  test("Selecting 2 patties adds $2.00 upcharge to the line total", async ({ app, page }) => {
    const dialog = page.getByTestId("item-customizer");

    await app.menu.addProduct(BURGER_ID);
    await dialog.locator('input[type="radio"][value="2"]').click();

    await expect(dialog).toContainText("$5.49");
  });

  // TC-13-05
  test("Add-ons are category-specific", async ({ app, page }) => {
    const dialog = page.getByTestId("item-customizer");

    await app.menu.addProduct(BURGER_ID);
    await expect(dialog.getByRole("checkbox", { name: /extra cheese/i })).toBeVisible();
    await page.keyboard.press("Escape");

    await app.menu.addProduct(DRINK_ID);
    await expect(dialog.getByRole("checkbox", { name: /no ice/i })).toBeVisible();
    await expect(dialog.getByRole("checkbox", { name: /extra cheese/i })).not.toBeVisible();
    await page.keyboard.press("Escape");
  });

  // TC-13-06 — extra cheese +$0.75 → total $3.49 + $0.75 = $4.24
  test("Line total updates when an add-on is selected", async ({ app, page }) => {
    const dialog = page.getByTestId("item-customizer");

    await app.menu.addProduct(BURGER_ID);
    await expect(dialog).toContainText("$3.49");

    await dialog.getByRole("checkbox", { name: /extra cheese/i }).click();

    await expect(dialog).toContainText("$4.24");
    await page.keyboard.press("Escape");
  });

  // TC-13-07
  test("Two customized versions of the same product create separate cart lines", async ({ app, page }) => {
    await app.menu.addProduct(BURGER_ID);
    await page.getByTestId("customizer-add-to-cart").click();

    await app.menu.addProduct(BURGER_ID);
    await page.getByTestId("item-customizer").getByRole("checkbox", { name: /extra cheese/i }).click();
    await page.getByTestId("customizer-add-to-cart").click();

    await app.header.openCart();
    await expect(app.cart.lines.locator("li")).toHaveCount(2);
  });
});
