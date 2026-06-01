import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";

test.describe("Tips & Donations", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.newYork.zip, ZIPS.newYork.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
  });

  // TC-14-01
  test("All four tip preset options are visible on checkout", async ({ page }) => {
    await expect(page.getByTestId("tip-option-0")).toBeVisible();
    await expect(page.getByTestId("tip-option-10")).toBeVisible();
    await expect(page.getByTestId("tip-option-15")).toBeVisible();
    await expect(page.getByTestId("tip-option-20")).toBeVisible();
  });

  // TC-14-02
  test("Selecting a non-zero tip shows the tip amount row", async ({ page }) => {
    await page.getByTestId("tip-option-10").click();
    await expect(page.getByTestId("checkout-tip-amount")).toBeVisible();
  });

  // TC-14-03
  test("Tip amount equals subtotal × percentage ÷ 100", async ({ page }) => {
    await page.getByTestId("tip-option-15").click();

    const rawSubtotal = await page.getByTestId("checkout-subtotal").innerText();
    const subtotal = parseFloat(rawSubtotal.replace(/[^0-9.]/g, ""));
    const expected = (Math.round(subtotal * 15) / 100).toFixed(2);

    await expect(page.getByTestId("checkout-tip-amount")).toContainText(`$${expected}`);
  });

  // TC-14-04
  test("Fixed donation preset buttons are displayed", async ({ page }) => {
    await expect(page.getByTestId("donation-fixed-1")).toBeVisible();
    await expect(page.getByTestId("donation-fixed-2")).toBeVisible();
    await expect(page.getByTestId("donation-fixed-5")).toBeVisible();
  });

  // TC-14-05
  test("Percent donation preset buttons are displayed", async ({ page }) => {
    await expect(page.getByTestId("donation-percent-1")).toBeVisible();
    await expect(page.getByTestId("donation-percent-2")).toBeVisible();
    await expect(page.getByTestId("donation-percent-5")).toBeVisible();
  });

  // TC-14-06
  test("Typing a custom fixed donation shows the donation amount row", async ({ page }) => {
    await page.getByTestId("donation-custom-fixed").fill("3");
    await expect(page.getByTestId("checkout-donation-amount")).toBeVisible();
  });

  // TC-14-07
  test("Grand total equals subtotal + tip + donation", async ({ page }) => {
    await page.getByTestId("tip-option-10").click();
    await page.getByTestId("donation-fixed-1").click();

    const rawSubtotal = await page.getByTestId("checkout-subtotal").innerText();
    const rawTip = await page.getByTestId("checkout-tip-amount").innerText();
    const rawDonation = await page.getByTestId("checkout-donation-amount").innerText();

    // Extract the price value that follows a $ sign (avoids picking up digits from labels like "Tip (10%)")
    const parse = (text: string) => {
      const match = text.match(/\$([\d,]+\.?\d*)/);
      return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
    };
    const subtotal = parse(rawSubtotal);
    const tip = parse(rawTip);
    const donation = parse(rawDonation);
    const expectedTotal = (subtotal + tip + donation).toFixed(2);

    await expect(page.getByTestId("checkout-total")).toContainText(`$${expectedTotal}`);
  });

  // TC-14-08
  test("Selecting no-donation hides the donation row", async ({ page }) => {
    await page.getByTestId("donation-fixed-2").click();
    await expect(page.getByTestId("checkout-donation-amount")).toBeVisible();

    await page.getByTestId("donation-none").click();
    await expect(page.getByTestId("checkout-donation-amount")).not.toBeVisible();
  });

  // TC-14-09 — BR locale: $1 USD fixed donation → R$5,70
  test("Donation displays in BRL when BR locale is active", async ({ app, page }) => {
    await app.clearSessionAndReloadToMenu();
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();

    await page.getByTestId("donation-fixed-1").click();

    await expect(page.getByTestId("checkout-donation-amount")).toContainText("R$");
    await expect(page.getByTestId("checkout-donation-amount")).toContainText("5,70");
  });
});
