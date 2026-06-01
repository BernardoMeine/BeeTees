import { test, expect } from "../helpers/fixtures";

test.describe("Menu Search", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  // TC-12-01
  test("Search icon opens the input and focuses it", async ({ app }) => {
    await expect(app.menu.searchInput).not.toBeVisible();

    await app.menu.searchToggle.click();

    await expect(app.menu.searchInput).toBeVisible();
    await expect(app.menu.searchInput).toBeFocused();
  });

  // TC-12-02
  test("Search filters products by name (case-insensitive)", async ({ app }) => {
    await app.menu.searchFor("cheese");

    const count = await app.menu.productCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(16);
  });

  // TC-12-03
  test("Search narrows results within the active category filter", async ({ app }) => {
    await app.menu.filterBy("burger");
    await app.menu.searchFor("avocado");

    expect(await app.menu.productCards.count()).toBe(1);
  });

  // TC-12-04
  test("Empty state appears when no product matches the query", async ({ app }) => {
    await app.menu.searchFor("xyznotaproduct");

    expect(await app.menu.productCards.count()).toBe(0);
  });

  // TC-12-05
  test("Closing the search clears the query and restores all products", async ({ app }) => {
    await app.menu.searchFor("cheese");
    expect(await app.menu.productCards.count()).toBeLessThan(16);

    await app.menu.searchClose.click();

    await expect(app.menu.searchInput).not.toBeVisible();
    expect(await app.menu.productCards.count()).toBe(16);
  });
});
