import { test, expect, type Page } from "@playwright/test";
import { App } from "../pages/app";
import { ZIPS } from "../data/testData";

// Seeded demo user (always present in a freshly seeded DB)
const DEMO = { email: "alex@beetees.test", password: "beetee123" };
const PRODUCT_ID = "cheeseburguer";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function goToLogin(app: App, page: Page): Promise<void> {
  await app.gotoMenu();
  await page.getByTestId("profile-toggle").click();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
}

async function goToSignup(app: App, page: Page): Promise<void> {
  await goToLogin(app, page);
  await page.getByRole("button", { name: /sign up/i }).click();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
}

// Demo user has a BR location → locale switches to pt-BR after login
async function loginAsDemo(app: App, page: Page): Promise<void> {
  await goToLogin(app, page);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.getByTestId("product-grid").waitFor({ state: "visible", timeout: 6_000 });
}

// Dismiss the reorder-prompt dialog if present (bilingual)
async function dismissReorderPrompt(page: Page): Promise<void> {
  const btn = page.getByRole("button", { name: /maybe later|talvez depois/i });
  await btn.waitFor({ state: "visible", timeout: 2_000 }).catch(() => undefined);
  if (await btn.isVisible()) await btn.click();
}

// MUI TextField labels append " *" for required fields — match with regex
const pwd = (page: Page) => page.locator('input[type="password"]').first();
const confirmPwd = (page: Page) => page.locator('input[type="password"]').nth(1);

// Error alert (not the StoreStatus info-alert that also has role="alert")
const errorAlert = (page: Page) =>
  page.getByRole("alert").filter({ hasText: /password|passwords|don't deliver|não entregamos/i });

// ── Suite ────────────────────────────────────────────────────────────────────

test.describe("Authentication", () => {
  // TC-15-01
  test("Guest can complete full checkout without an account", async ({ page }) => {
    const app = new App(page);
    await app.gotoMenu();
    await app.saveLocation(ZIPS.newYork.zip, ZIPS.newYork.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails("Alice", "alice@example.com");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();
  });

  // TC-15-02
  test("Signup requires a deliverable location before submitting", async ({ page }) => {
    const app = new App(page);
    await goToSignup(app, page);
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("User");
    await page.getByLabel("Email").fill("test@playwright.example");
    await pwd(page).fill("Password1");
    await confirmPwd(page).fill("Password1");
    await page.getByLabel(/ZIP/i).fill("99999");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(errorAlert(page)).toContainText("We don't deliver to this address yet");
  });

  // TC-15-03
  test("Submitting empty signup form shows a password-too-short error", async ({ page }) => {
    const app = new App(page);
    await goToSignup(app, page);
    await page.getByRole("button", { name: "Create account" }).click();
    // password = "" → length 0 < 8 → first client-side error
    await expect(errorAlert(page)).toContainText("Password must be at least 8 characters");
  });

  // TC-15-04
  test("Signup password must be at least 8 characters", async ({ page }) => {
    const app = new App(page);
    await goToSignup(app, page);
    await pwd(page).fill("short");
    await confirmPwd(page).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(errorAlert(page)).toContainText("Password must be at least 8 characters");
  });

  // TC-15-05
  test("Signup password and confirm password must match", async ({ page }) => {
    const app = new App(page);
    await goToSignup(app, page);
    await pwd(page).fill("Password1");
    await confirmPwd(page).fill("Password2");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(errorAlert(page)).toContainText("Passwords do not match");
  });

  // TC-15-06
  test("Successful signup shows success overlay and redirects to profile", async ({ page }) => {
    const app = new App(page);
    const uniqueEmail = `playwright${Date.now()}@test.example`;
    await goToSignup(app, page);
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByLabel("Email").fill(uniqueEmail);
    await pwd(page).fill("Password123");
    await confirmPwd(page).fill("Password123");
    // Country defaults to US; type a valid US ZIP and look it up
    await page.getByLabel(/ZIP/i).fill(ZIPS.newYork.zip);
    await page.getByRole("button", { name: "Look up address" }).click();
    // Wait for lookup to finish (button re-enables)
    await expect(page.getByRole("button", { name: "Look up address" })).toBeEnabled({ timeout: 10_000 });
    await page.getByRole("button", { name: "Create account" }).click();
    // After 850 ms success animation the profile page is shown (h1 heading)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 6_000 });
  });

  // TC-15-07
  test("Login with valid credentials redirects to shop", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await expect(page.getByTestId("product-grid")).toBeVisible();
  });

  // TC-15-08
  test("Login hydrates the saved user delivery location", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    // Demo user has a BR location saved → location indicator badge appears
    await expect(page.getByTestId("location-set-indicator")).toBeVisible();
  });

  // TC-15-09
  test("Authenticated profile icon opens the profile page", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);
    await page.getByTestId("profile-toggle").click();
    // Profile page always has an h1 heading and a logout button
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /log out|sair/i })).toBeVisible();
  });

  // TC-15-10
  test("Guest profile icon click redirects to login", async ({ page }) => {
    const app = new App(page);
    await app.gotoMenu();
    await page.getByTestId("profile-toggle").click();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  });

  // TC-15-11
  test("Profile Account Details tab shows the user's data", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);
    await page.getByTestId("profile-toggle").click();
    // First tab = Account details — click to ensure it is active
    await page.getByRole("tab").first().click();
    // "Email" label is identical in en-US and pt-BR
    await expect(page.getByLabel("Email")).toHaveValue(DEMO.email);
  });

  // TC-15-12
  test("Previous orders tab shows order history for authenticated user", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);
    await page.getByTestId("profile-toggle").click();
    // Second tab = Previous orders
    await page.getByRole("tab").nth(1).click();
    // MUI ListItemButton renders as <li> — use class selector for reliability
    await expect(page.locator(".MuiListItemButton-root").first()).toBeVisible();
  });

  // TC-15-13
  test("Reorder from previous orders returns to shop view", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);
    await page.getByTestId("profile-toggle").click();
    await page.getByRole("tab").nth(1).click();
    await page.locator(".MuiListItemButton-root").first().click();
    // Wait for the order-details dialog to open fully
    await expect(page.getByRole("dialog")).toBeVisible();
    // Reorder button (bilingual) — clicking it calls reorder(order) → setView("shop")
    await page.getByRole("button", { name: /^reorder$|^pedir de novo$/i }).click();
    // After reorder: profile page unmounts and shop page mounts
    await expect(page.getByTestId("product-grid")).toBeVisible();
  });

  // TC-15-14
  test("Reorder prompt is shown automatically on the shop for returning users", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    // Dialog fires as soon as user + orders are loaded in the store
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("dialog")).toContainText(/Feeling hungry|Com fome/i);
  });

  // TC-15-15
  test("Logout clears session and restores guest workflow", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);
    await page.getByTestId("profile-toggle").click();
    await page.getByRole("button", { name: /log out|sair/i }).click();
    // handleLogout calls setView("shop")
    await expect(page.getByTestId("product-grid")).toBeVisible();
    // Locale stays pt-BR after logout → login button text is "Entrar"
    await page.getByTestId("profile-toggle").click();
    await expect(page.getByRole("button", { name: /^log in$|^entrar$/i })).toBeVisible();
  });

  // TC-15-16 — Rule 10.2: authenticated order is persisted and shows in previous orders
  test("Placing an authenticated order adds it to previous orders history", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);

    // Record how many orders exist before placing a new one
    await page.getByTestId("profile-toggle").click();
    await page.getByRole("tab").nth(1).click();
    const initialCount = await page.locator(".MuiListItemButton-root").count();

    // Go back to shop and place a new authenticated order
    await app.header.goHome();
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails("Alex", DEMO.email);
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();

    // Navigate back to previous orders and assert the new entry was saved
    await app.confirmation.back();
    await page.getByTestId("profile-toggle").click();
    await page.getByRole("tab").nth(1).click();
    await expect(page.locator(".MuiListItemButton-root")).toHaveCount(initialCount + 1);
  });

  // TC-15-18 — Rule 5.3: login clears any previously entered guest checkout data
  test("Login clears guest checkout form so no data carries over", async ({ page }) => {
    const app = new App(page);

    // Step 1 — guest fills checkout form
    await app.gotoMenu();
    await app.saveLocation(ZIPS.newYork.zip, ZIPS.newYork.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails("GuestUser", "guest@example.com");
    await app.checkout.fillValidCard();

    // Step 2 — navigate back to shop then log in
    await app.checkout.goBackToShop();
    await loginAsDemo(app, page);
    await dismissReorderPrompt(page);

    // Step 3 — go to checkout again (demo user has BR location already)
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();

    // Guest data must be gone
    await expect(app.checkout.name).toHaveValue("");
    await expect(app.checkout.email).toHaveValue("");
    await expect(app.checkout.cardName).toHaveValue("");
  });

  // TC-15-17 — Rule 5.8: reorder from home-screen prompt adds items to cart
  test("Reorder button on home-screen prompt adds previous order items to cart", async ({ page }) => {
    const app = new App(page);
    await loginAsDemo(app, page);

    // Prompt fires automatically for a returning user with previous orders
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    // Click the Reorder button (bilingual: "Reorder" / "Pedir de novo")
    await page.getByRole("button", { name: /^reorder$|^pedir de novo$/i }).click();

    // Dialog closes and the cart now contains the reordered items
    await expect(page.getByRole("dialog")).not.toBeVisible();
    const count = parseInt((await page.getByTestId("cart-count").textContent()) ?? "0", 10);
    expect(count).toBeGreaterThan(0);
  });
});
