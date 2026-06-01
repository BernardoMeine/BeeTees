import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";

test.describe("Checkout Form Validation", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
  });

  // ── Personal details ──────────────────────────────────────────────────────

  // TC-06-01
  test("Submitting with all fields empty shows all validation errors", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("fullName")).toBeVisible();
    await expect(app.checkout.error("email")).toBeVisible();
    await expect(app.checkout.error("cardNameOnCard")).toBeVisible();
    await expect(app.checkout.error("cardNumber")).toBeVisible();
    await expect(app.checkout.error("cardExpiry")).toBeVisible();
    await expect(app.checkout.error("cardCvc")).toBeVisible();
  });

  // TC-06-02
  test("Missing name shows error", async ({ app }) => {
    await app.checkout.email.fill("a@b.com");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("fullName")).toBeVisible();
  });

  // TC-06-02 (email)
  test("Missing email shows error", async ({ app }) => {
    await app.checkout.name.fill("Alice");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  // TC-06-20
  test("Full name with only special characters fails format validation", async ({ app }) => {
    await app.checkout.name.fill("%&%$%*&#@");
    await app.checkout.email.fill("alice@ex.com");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("fullName")).toBeVisible();
  });

  // TC-06-03 — step 1
  test("Email with no @ shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "nodomain");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  // TC-06-03 — step 2
  test("Email with @ but no domain shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "user@");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  // TC-06-03 — step 3
  test("Email with @ but no domain dot shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@nodot");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  // ── Card name real-time formatting ────────────────────────────────────────

  // TC-06-04
  test("Card name rejects digits in real-time", async ({ app }) => {
    await app.checkout.cardName.fill("John123");
    await expect(app.checkout.cardName).toHaveValue("John");
  });

  // TC-06-05
  test("Card name rejects special characters in real-time", async ({ app }) => {
    await app.checkout.cardName.fill("John@#$");
    await expect(app.checkout.cardName).toHaveValue("John");
  });

  // TC-06-06
  test("Card name allows letters, spaces, hyphens and apostrophes", async ({ app }) => {
    await app.checkout.cardName.fill("Mary-Jane O'Brien");
    await expect(app.checkout.cardName).toHaveValue("Mary-Jane O'Brien");
  });

  // ── Card number real-time formatting ──────────────────────────────────────

  // TC-06-07
  test("Card number auto-formats as XXXX XXXX XXXX XXXX", async ({ app }) => {
    await app.checkout.cardNumber.fill("1234567890123456");
    await expect(app.checkout.cardNumber).toHaveValue("1234 5678 9012 3456");
  });

  // TC-06-08
  test("Card number accepts only digits", async ({ app }) => {
    await app.checkout.cardNumber.fill("1234-ABCD-5678");
    await expect(app.checkout.cardNumber).toHaveValue("1234 5678");
  });

  // TC-06-09
  test("Card number with fewer than 13 digits shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "411111",
      expiry: "1228",
      cvc: "123",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardNumber")).toBeVisible();
  });

  // ── Expiry real-time formatting ───────────────────────────────────────────

  // TC-06-10
  test("Expiry auto-formats as MM / YY", async ({ app }) => {
    await app.checkout.cardExpiry.fill("1228");
    await expect(app.checkout.cardExpiry).toHaveValue("12 / 28");
  });

  // TC-06-11
  test("Expiry with invalid month (13) fails validation", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "4111111111111111",
      expiry: "1328",
      cvc: "123",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardExpiry")).toBeVisible();
  });

  // TC-06-12
  test("Past expiry date shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "4111111111111111",
      expiry: "0120",
      cvc: "123",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardExpiry")).toBeVisible();
  });

  // ── CVC real-time formatting and validation ───────────────────────────────

  // TC-06-13
  test("CVC rejects letters and special characters in real-time", async ({ app }) => {
    await app.checkout.cardCvc.fill("12A!");
    await expect(app.checkout.cardCvc).toHaveValue("12");
  });

  // TC-06-14
  test("CVC with fewer than 3 digits fails validation", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "4111111111111111",
      expiry: "1228",
      cvc: "12",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardCvc")).toBeVisible();
  });

  // TC-06-15
  test("CVC field is rendered as a password input", async ({ app }) => {
    await expect(app.checkout.cardCvc).toHaveAttribute("type", "password");
  });

  // ── Payment method ────────────────────────────────────────────────────────

  // TC-06-16
  test("Pay in restaurant skips card validation and places order", async ({ app }) => {
    await app.checkout.selectPaymentMethod("pay-in-restaurant");
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();
  });

  // TC-06-17
  test("Switching to pay in restaurant clears existing card errors", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardNameOnCard")).toBeVisible();

    await app.checkout.selectPaymentMethod("pay-in-restaurant");
    await expect(app.checkout.error("cardNameOnCard")).not.toBeVisible();
    await expect(app.checkout.error("cardNumber")).not.toBeVisible();
    await expect(app.checkout.error("cardExpiry")).not.toBeVisible();
    await expect(app.checkout.error("cardCvc")).not.toBeVisible();
  });

  // ── Focus and error UX ────────────────────────────────────────────────────

  // TC-06-18
  test("First invalid field receives focus on submit", async ({ app, page }) => {
    await app.checkout.placeOrderNow();
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe("checkout-name");
  });

  // TC-06-19
  test("Correcting a field clears its error while others remain", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("fullName")).toBeVisible();
    await expect(app.checkout.error("email")).toBeVisible();

    await app.checkout.name.fill("Alice");
    await expect(app.checkout.error("fullName")).not.toBeVisible();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  // ── Empty-cart guard ──────────────────────────────────────────────────────

  // Bug #2: removing all items from the cart while on checkout must block the order
  test("Emptying cart from checkout disables Place Order, tips and donations", async ({ app, page }) => {
    // Open the cart drawer from checkout and remove the only item
    await app.header.openCart();
    await app.cart.decrementFirstLine();
    await app.cart.close();

    // Place Order button must be disabled
    await expect(page.getByTestId("place-order")).toBeDisabled();

    // All tip preset buttons must be disabled
    for (const pct of [0, 10, 15, 20]) {
      await expect(page.getByTestId(`tip-option-${pct}`)).toBeDisabled();
    }

    // All donation preset buttons must be disabled
    for (const amt of [1, 2, 5]) {
      await expect(page.getByTestId(`donation-fixed-${amt}`)).toBeDisabled();
      await expect(page.getByTestId(`donation-percent-${amt}`)).toBeDisabled();
    }
    await expect(page.getByTestId("donation-none")).toBeDisabled();
  });

  // ── Store display ─────────────────────────────────────────────────────────

  test("Store name is shown on checkout page", async ({ app }) => {
    await expect(app.checkout.storeName).toContainText(ZIPS.saoPaulo.store);
  });
});
