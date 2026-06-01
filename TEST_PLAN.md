# Burguer-Tenders — Playwright Test Plan

> **Base URL:** `http://localhost:5173`  
> **API:** `http://localhost:3001` (proxied through Vite at `/api`)  
> **Pre-requisite:** `npm run dev:all` must be running before any suite executes.  
> **Session isolation:** Each suite (or each test where noted) should start with a fresh browser context (cleared cookies/storage) so the session delivery state is clean.

> **⚠️ Locale-aware tests:** The Dynamic Translation feature (Business Rule §10) changes UI strings and currency formatting as soon as a successful address lookup resolves to a known store. Any test that saves a **Brazilian** delivery location will run in `pt-BR` locale (Portuguese text, BRL prices). Any test that saves a **US** delivery location runs in `en-US` (English, USD). Fresh-session tests — where no location is saved before the assertion — always run in the default `en-US` locale. Affected test cases are marked with **[Locale-aware]** below.

---

## Table of Contents

1. [Suite 01 — Product Catalog](#suite-01--product-catalog)
2. [Suite 02 — Category Filter](#suite-02--category-filter)
3. [Suite 03 — Delivery Location Panel](#suite-03--delivery-location-panel)
4. [Suite 04 — Address Geocoding & Store Resolution](#suite-04--address-geocoding--store-resolution)
5. [Suite 05 — Cart Behaviour](#suite-05--cart-behaviour)
6. [Suite 06 — Checkout Form Validation](#suite-06--checkout-form-validation)
7. [Suite 07 — Order Placement & Confirmation](#suite-07--order-placement--confirmation)
8. [Suite 08 — Navigation & Views](#suite-08--navigation--views)
9. [Suite 09 — UI Feedback & Panels](#suite-09--ui-feedback--panels)
10. [Suite 10 — Dynamic Translation](#suite-10--dynamic-translation)

---

## Suite 01 — Product Catalog

> **Goal:** Verify that the full catalog is rendered correctly on the shop page.

---

### TC-01-01 — All 16 products are displayed on page load

**Preconditions:** Fresh session, no delivery location set.  
**Steps:**
1. Navigate to `/`.
2. Count all `[data-testid="product-image"]` elements inside `[data-testid="product-grid"]`.

**Expected:** Exactly **16** product cards are rendered.

---

### TC-01-02 — Each product card shows name, description, price and image

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Pick any product card (e.g. Cheeseburguer).
3. Assert the card contains: a non-empty heading, a non-empty description paragraph, a price matching `$X.XX` format, and an `<img>` with a non-empty `src`.

**Expected:** All four elements are present and non-empty for every card.

---

### TC-01-03 — Spicy badge appears only on spicy products

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Collect all `.product-card__badge` elements.
3. Assert they belong to exactly: `bt-special`, `pack-tenders-spicy`, `combo-spicy-milkshake`.

**Expected:** Exactly 3 spicy badges on the correct products. Badge text is `"Spicy"` in `en-US` locale (default fresh session) and `"Picante"` in `pt-BR` locale (after a BR location is saved). Assert using a case-insensitive presence check on the badge element rather than a hardcoded English string.

---

### TC-01-04 — Non-spicy products have no badge

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. For each product card **without** `data-product-id` in `["bt-special","pack-tenders-spicy","combo-spicy-milkshake"]`, assert `.product-card__badge` is absent.

**Expected:** 13 cards have no spicy badge.

---

### TC-01-05 — Prices are formatted in USD

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Collect all `.product-card__price` text values.
3. Assert each price starts with `$`, has dollars, a decimal point, and two cents digits.

**Expected:** All 16 prices match USD currency format.

---

## Suite 02 — Category Filter

> **Goal:** Verify the category dropdown correctly filters the product grid.

---

### TC-02-01 — Default filter is "All" and shows all 16 products

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Read the value of `[data-testid="menu-category-filter"]`.
3. Count product cards.

**Expected:** Select value is `"all"`, card count is **16**.

---

### TC-02-02 — Filtering by "Burgers" shows exactly 4 products

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Select `"burger"` in `[data-testid="menu-category-filter"]`.
3. Count product cards.

**Expected:** **4** cards — Cheeseburguer, Cheeseburguer Bacon, Avocado Burguer, BT Special.

---

### TC-02-03 — Filtering by "Tenders" shows exactly 2 products

**Steps:** Select `"tenders"`. **Expected:** **2** cards.

---

### TC-02-04 — Filtering by "Combos" shows exactly 4 products

**Steps:** Select `"combo"`. **Expected:** **4** cards.

---

### TC-02-05 — Filtering by "Drinks" shows exactly 2 products

**Steps:** Select `"drink"`. **Expected:** **2** cards — Doctor BT, Guaraná.

---

### TC-02-06 — Filtering by "Sides" shows exactly 4 products

**Steps:** Select `"side"`. **Expected:** **4** cards — Plain Fries, Lemon Pepper Fries, Chocolate Milkshake, Strawberry Milkshake.

---

### TC-02-07 — Filter persists after switching back to "All"

**Steps:**
1. Select `"burger"`.
2. Select `"all"`.
3. Count cards.

**Expected:** **16** cards.

---

### TC-02-08 — Filter selection persists across cart state changes

**Preconditions:** Delivery location already saved (Londrina or SP ZIP).  
**Steps:**
1. Navigate to `/`.
2. Select `"drink"` — confirm 2 cards.
3. Open cart drawer and close it.
4. Assert filter is still `"drink"` and card count is still **2**.

**Expected:** Filter state survives panel open/close re-renders.

---

## Suite 03 — Delivery Location Panel

> **Goal:** Verify the location panel opens, closes, and handles all interaction states correctly.

---

### TC-03-01 — Location panel opens on clicking the pin icon

**Steps:**
1. Navigate to `/`.
2. Click `[data-testid="location-toggle"]`.

**Expected:** `[data-testid="location-panel"]` is visible.

---

### TC-03-02 — Location panel closes on X button

**Steps:**
1. Open location panel.
2. Click the close button (×) inside the panel.

**Expected:** Panel is hidden/removed.

---

### TC-03-03 — Location panel closes on backdrop click

**Steps:**
1. Open location panel.
2. Click `.location-backdrop`.

**Expected:** Panel is hidden.

---

### TC-03-04 — Location panel closes on Escape key

**Steps:**
1. Open location panel.
2. Press `Escape`.

**Expected:** Panel is hidden.

---

### TC-03-05 — Only one panel open at a time — cart closes when location opens

**Preconditions:** Delivery location saved.  
**Steps:**
1. Open cart drawer.
2. Click the location pin icon.

**Expected:** Cart drawer is closed; location panel is open.

---

### TC-03-06 — Only one panel open at a time — location closes when cart opens

**Preconditions:** Delivery location saved.  
**Steps:**
1. Open location panel.
2. Click the cart icon.

**Expected:** Location panel is closed; cart drawer is open.

---

### TC-03-07 — Country selector changes the store list

**Steps:**
1. Open location panel.
2. Assert store list contains "Burguer-Tenders Higienopolis" (BR default).
3. Change `[data-testid="location-country"]` to `"US"`.
4. Assert store list now contains "Burguer-Tenders Midtown".

**Expected:** Store list updates on country change.

---

### TC-03-08 — Typing in location inputs does not re-render the panel

**Steps:**
1. Open location panel.
2. Focus the ZIP input `[data-testid="location-zip"]`.
3. Type several characters.
4. Assert the ZIP input remains focused throughout (no focus loss).

**Expected:** Panel does not re-render; cursor stays in input.

---

### TC-03-09 — Cannot save location without a deliverable address

**Steps:**
1. Open location panel.
2. Manually type a ZIP (`99999`) that cannot be resolved.
3. Click `[data-testid="location-save"]`.

**Expected:** A browser alert is shown mentioning delivery areas; panel stays open; no store banner appears.

---

### TC-03-10 — Location summary appears in header after save

**Preconditions:** Use Londrina ZIP `86015280`.  
**Steps:**
1. Open location panel, select BR, type `86015280`.
2. Click `[data-testid="location-lookup"]` — wait for fields to populate. *(After a successful BR lookup the button label switches to "Buscar endereço" but the `data-testid` selector remains unchanged.)*
3. Click `[data-testid="location-save"]`. *(Button label in pt-BR locale: "Salvar localização".)*

**Expected:** `[data-testid="location-summary"]` is visible in the header with city/ZIP info.

---

## Suite 04 — Address Geocoding & Store Resolution

> **Goal:** Verify postal code lookup and store matching logic for all supported areas.

---

### TC-04-01 — Londrina BR ZIP resolves to Burguer-Tenders Higienopolis **[Locale-aware]**

**ZIP:** `86015280` | **Country:** BR  
**Steps:**
1. Open location panel, set country to BR, type ZIP, click `[data-testid="location-lookup"]`.
2. Wait for `[data-testid="location-store-status"]` to update.

**Expected:** Status text contains `"Burguer-Tenders Higienopolis"`. Because a BR store is resolved, the locale switches to `pt-BR` immediately — the full status sentence will be `"Entrega disponível por Burguer-Tenders Higienopolis"`. Assert by checking that the store name is contained in the element text (not the full English sentence).

---

### TC-04-02 — São Paulo BR ZIP resolves to Burguer-Tenders Pinheiros **[Locale-aware]**

**ZIP:** `05413010` | **Country:** BR  
**Steps:** Same as TC-04-01.

**Expected:** Status text contains `"Burguer-Tenders Pinheiros"`. Full sentence after locale switch: `"Entrega disponível por Burguer-Tenders Pinheiros"`. Assert by store name containment only.

---

### TC-04-03 — New York US ZIP resolves to Burguer-Tenders Midtown

**ZIP:** `10001` | **Country:** US  
**Steps:** Same as TC-04-01 with country set to US.

**Expected:** Status text contains "Burguer-Tenders Midtown".

---

### TC-04-04 — Unknown city ZIP shows "We don't deliver to this city yet"

**ZIP:** A valid Brazilian ZIP outside Londrina/SP (e.g. Curitiba `80010010`).  
**Steps:** Look up a ZIP for an unsupported city.

**Expected:** Status text contains `"We don't deliver to this city yet"`. Because no store is resolved, the locale does **not** change — the message stays in English regardless of the selected country.

---

### TC-04-05 — Address fields are populated after a successful lookup

**ZIP:** `86015280` | **Country:** BR  
**Steps:**
1. Look up address.
2. Assert `[data-testid="location-street"]`, `[data-testid="location-city"]`, `[data-testid="location-state"]` all have non-empty values.

**Expected:** All address fields are populated.

---

### TC-04-06 — "Look up address" button is disabled while request is in flight

**Steps:**
1. Open location panel, type a valid ZIP.
2. Click `[data-testid="location-lookup"]`.
3. Immediately assert the button is `disabled` and shows the loading spinner (`.location-lookup-btn__spinner`). The visible label (`<span class="sr-only">`) reads `"Looking up…"` in `en-US` or `"Buscando…"` in `pt-BR`; assert using the `disabled` attribute and spinner presence rather than the label text.

**Expected:** Button is disabled and the spinner is visible during the request.

---

### TC-04-07 — "Look up address" button does not cause panel re-render

**Steps:**
1. Open location panel, focus the complement field, type text.
2. Move focus back, type a valid ZIP.
3. Click "Look up address", wait for completion.
4. Assert complement field still shows the value typed in step 1.

**Expected:** Complement input value is preserved (no full re-render wiped it).

---

### TC-04-08 — Saving a valid location persists across page reload

**Steps:**
1. Save a valid location (e.g. Londrina ZIP).
2. Reload the page.
3. Assert `[data-testid="location-summary"]` is still visible.

**Expected:** Session cookie restores the saved address.

---

## Suite 05 — Cart Behaviour

> **Goal:** Verify all cart interactions, quantity rules, and the no-re-render behaviour.

---

### TC-05-01 — Clicking "Add to cart" without a location opens the location panel

**Preconditions:** Fresh session, no delivery location.  
**Steps:**
1. Navigate to `/`.
2. Click `[data-testid="add-to-cart"]` on any product.

**Expected:** `[data-testid="location-panel"]` opens; cart drawer does NOT open.

---

### TC-05-02 — After saving location, the pending product is added automatically **[Locale-aware]**

**Steps:**
1. Fresh session. Click "Add to cart" on Cheeseburguer (location panel opens).
2. Set and save a valid location.

**Expected:** Cart badge shows **1**. Toast message depends on the saved country:
- **US location:** `"Cheeseburguer was successfully added to cart!"`
- **BR location:** `"Cheeseburguer foi adicionado ao carrinho com sucesso!"`

Assert that `[data-testid="cart-toast"]` is visible and contains `"Cheeseburguer"` (locale-agnostic product name check).

---

### TC-05-03 — Cart badge shows correct item count

**Preconditions:** Location saved.  
**Steps:**
1. Add Cheeseburguer (qty 1) and Pack of tenders (qty 1).
2. Read `[data-testid="cart-count"]`.

**Expected:** Badge text is `"2"`.

---

### TC-05-04 — Cart drawer opens and closes

**Preconditions:** Location saved.  
**Steps:**
1. Click cart icon to open.
2. Assert `[data-testid="cart-drawer"]` is visible.
3. Click the × close button.
4. Assert drawer is hidden.

**Expected:** Drawer opens and closes correctly.

---

### TC-05-05 — Added products appear in the cart drawer

**Preconditions:** Location saved.  
**Steps:**
1. Add Cheeseburguer.
2. Open cart drawer.
3. Assert `[data-testid="cart-lines"]` contains "Cheeseburguer".

**Expected:** Product name appears in the cart line.

---

### TC-05-06 — Incrementing quantity updates the line count

**Preconditions:** Location saved; Cheeseburguer in cart.  
**Steps:**
1. Open cart.
2. Click `[data-action="inc-line"]` for Cheeseburguer.
3. Read `[data-testid="cart-line-qty"]`.

**Expected:** Quantity is **2**.

---

### TC-05-07 — Decrementing to zero removes the line **[Locale-aware]**

**Preconditions:** Location saved; Cheeseburguer in cart with quantity 1.  
**Steps:**
1. Open cart.
2. Click `[data-action="dec-line"]`.
3. Assert the Cheeseburguer line is gone.
4. Assert the empty-cart message is visible.

**Expected:** The Cheeseburguer line is removed. The empty-cart message reads:
- **US locale:** `"Your cart is empty."`
- **BR locale:** `"Seu carrinho está vazio."`

Assert using `.cart-drawer__empty` visibility rather than hardcoded text when the save country is BR.

---

### TC-05-08 — Remove button deletes the line immediately

**Preconditions:** Location saved; two items in cart.  
**Steps:**
1. Open cart.
2. Click `[data-action="remove-line"]` on the first item.
3. Assert that line no longer appears.

**Expected:** Line is removed; the other item remains.

---

### TC-05-09 — Subtotal is calculated correctly **[Locale-aware]**

**Preconditions:** Location saved. **Use a US location (`10001`) to run this test with USD pricing**, or read the expected value from a product card to stay locale-agnostic.  
**Steps:**
1. Add 2× Cheeseburguer and 1× Pack of tenders.
2. Open cart.
3. Read `[data-testid="cart-subtotal"]` and `[data-testid="line-total"]` for each line.

**Expected (US locale):** Subtotal = `$13.97` (2 × $3.49 + 1 × $6.99).  
**Expected (BR locale):** Subtotal = `R$\u00a079,63` (13.97 × 5.7, formatted as pt-BR BRL). The currency symbol is `R$` and the decimal separator is a comma.  
**Locale-agnostic alternative:** Assert that the subtotal value equals the sum of all individual `[data-testid="line-total"]` values — this holds regardless of currency format.

---

### TC-05-10 — "Go to checkout" is disabled when cart is empty

**Preconditions:** Location saved; cart is empty.  
**Steps:**
1. Open cart.
2. Assert `[data-testid="go-checkout"]` has `disabled` attribute.

**Expected:** Button is disabled.

---

### TC-05-11 — Cart drawer does NOT fully re-render when adding/removing items

**Preconditions:** Location saved; cart drawer open.  
**Steps:**
1. Focus the cart drawer's close button (or note the scroll position of the drawer body).
2. Click `[data-action="inc-line"]` on a cart line.
3. Assert the cart drawer `<aside>` element is the **same DOM node** (no full innerHTML replacement).

**Expected:** The drawer body updates in-place; no full re-render occurs (testable via `page.evaluate` checking element identity or absence of re-mount).

---

### TC-05-12 — Cart badge updates without full page re-render

**Preconditions:** Location saved; 1 item in cart.  
**Steps:**
1. Add another product via "Add to cart" from the product grid.
2. Immediately read `[data-testid="cart-count"]`.

**Expected:** Badge updates to the new count without a visible page flash.

---

## Suite 06 — Checkout Form Validation

> **Goal:** Verify all form field rules — required fields, format rules, and real-time formatting.

**Preconditions for all TC-06-xx:** Valid delivery location saved; at least one item in cart; user has navigated to the checkout page.

---

### TC-06-01 — Submitting with all fields empty shows errors

**Steps:**
1. Clear all fields.
2. Click `[data-testid="place-order"]`.

**Expected:** Error messages appear for: `fullName`, `email`, `cardNameOnCard`, `cardNumber`, `cardExpiry`, `cardCvc`.

---

### TC-06-02 — Full name is required

**Steps:** Leave name blank, fill all other fields correctly, submit.

**Expected:** `[data-testid="checkout-error-fullName"]` is visible.

---

### TC-06-20 — Full name with only special characters fails validation

**Steps:**
1. Fill name with `"%&%$%*&#@"`.
2. Fill email and card fields correctly.
3. Submit.

**Expected:** `[data-testid="checkout-error-fullName"]` is visible with a format-error message.

---

### TC-06-03 — Email must contain "@" and a domain with a dot

**Steps:**
1. Enter `"notanemail"` → submit → assert error.
2. Enter `"user@"` → submit → assert error.
3. Enter `"user@domain"` (no dot) → submit → assert error.
4. Enter `"user@domain.com"` → assert no email error.

**Expected:** Invalid formats produce an error; valid format clears it.

---

### TC-06-04 — Card name rejects digits

**Steps:** Type `"John123"` into name-on-card field.

**Expected:** The `"1"`, `"2"`, `"3"` characters are stripped in real-time; field shows `"John"`.

---

### TC-06-05 — Card name rejects special characters

**Steps:** Type `"John@#$"`.

**Expected:** `"@"`, `"#"`, `"$"` are stripped; field retains `"John"`.

---

### TC-06-06 — Card name allows letters, spaces, hyphens and apostrophes

**Steps:** Type `"Mary-Jane O'Brien"`.

**Expected:** Full value is preserved without any stripping.

---

### TC-06-07 — Card number auto-formats as XXXX XXXX XXXX XXXX

**Steps:** Type `"1234567890123456"` into the card number field.

**Expected:** Field value becomes `"1234 5678 9012 3456"`.

---

### TC-06-08 — Card number accepts only digits

**Steps:** Type `"1234-ABCD-5678"`.

**Expected:** Non-digit characters are stripped; value becomes `"1234 5678"`.

---

### TC-06-09 — Card number with fewer than 13 digits fails validation

**Steps:** Enter `"1234 5678"` (8 digits), submit.

**Expected:** Error on `cardNumber` field.

---

### TC-06-10 — Expiry auto-formats as MM / YY

**Steps:** Type `"1228"` into the expiry field.

**Expected:** Field value becomes `"12 / 28"`.

---

### TC-06-11 — Expiry with invalid month (e.g. 13) fails validation

**Steps:** Type `"1328"` (month 13).

**Expected:** Expiry error on submit.

---

### TC-06-12 — Expired card date fails validation

**Steps:** Enter a past date such as `"01 / 20"` (January 2020).

**Expected:** Error: "Enter a valid expiry date … that hasn't passed."

---

### TC-06-13 — CVC rejects letters and special chars

**Steps:** Type `"12A!"` into the CVC field.

**Expected:** Value becomes `"12"` (only digits retained).

---

### TC-06-14 — CVC with 2 digits fails validation

**Steps:** Enter `"12"`, submit.

**Expected:** CVC error: "Security code must be 3 or 4 digits."

---

### TC-06-15 — CVC is rendered as a password field (masked)

**Steps:** Inspect the CVC input type.

**Expected:** `input[id="checkout-card-cvc"]` has `type="password"`.

---

### TC-06-16 — Selecting "Pay in restaurant" hides card fields and skips card validation

**Steps:**
1. Select the "Pay in restaurant" radio.
2. Submit with name and email filled but all card fields empty.

**Expected:** No card field errors; order proceeds.

---

### TC-06-17 — Switching to "Pay in restaurant" clears existing card errors

**Steps:**
1. Submit with card method and empty card fields (errors appear).
2. Switch to "Pay in restaurant".

**Expected:** Card error messages disappear immediately.

---

### TC-06-18 — First invalid field receives focus on submit

**Steps:**
1. Leave all fields empty.
2. Click "Place order".

**Expected:** Focus lands on `[id="checkout-name"]` (first field in error).

---

### TC-06-19 — Errors clear field-by-field as user corrects them

**Steps:**
1. Submit empty form (errors appear).
2. Type a name into the name field.

**Expected:** `[data-testid="checkout-error-fullName"]` disappears; other errors remain.

---

## Suite 07 — Order Placement & Confirmation

---

### TC-07-01 — Valid form submission navigates to confirmation page

**Preconditions:** Location saved, items in cart.  
**Steps:**
1. Fill all checkout fields correctly (card method, future expiry, 3-digit CVC).
2. Click "Place order".

**Expected:** Confirmation page is shown (`[data-testid]` or heading "Thank you").

---

### TC-07-02 — Confirmation shows personalised greeting **[Locale-aware]**

**Steps:** After placing order with name `"Alice"`.

**Expected:** Page contains the personalised greeting:
- **US locale:** `"Thank you, Alice!"`
- **BR locale:** `"Obrigado(a), Alice!"`

The user name (`Alice`) is always rendered as entered regardless of locale. Assert that `[data-testid="confirm-title"]` contains `"Alice"` as a locale-agnostic check, or specify the country used to set up preconditions and assert the full localised string.

---

### TC-07-03 — Confirmation shows order-placed subtitle **[Locale-aware]**

**Expected:** Page contains the order-placed subtitle:
- **US locale:** `"Your order is placed!"`
- **BR locale:** `"Seu pedido foi realizado!"`

Assert using `[data-testid="confirmation-page"]` scoped text and the expected string for the locale used in the test preconditions.

---

### TC-07-04 — Confirmation shows 30-minute ETA

**Expected:** Page contains "30 min".

---

### TC-07-05 — Confirmation shows full delivery address

**Expected:** Page contains: ZIP, street address, neighborhood, city/state, country.

---

### TC-07-06 — Confirmation shows the store name

**Expected:** Page contains the store name (e.g. "Burguer-Tenders Pinheiros").

---

### TC-07-07 — Cart is empty after order placement **[Locale-aware]**

**Steps:** After confirmation, click `[data-testid="confirm-back"]` *(label: "Back to menu" in en-US, "Voltar ao menu" in pt-BR)*, then open the cart drawer.

**Expected:** Cart drawer shows the empty-cart message and the badge is hidden:
- **US locale:** `"Your cart is empty."`
- **BR locale:** `"Seu carrinho está vazio."`

Assert using `.cart-drawer__empty` visibility plus badge class absence.

---

### TC-07-08 — "Back to menu" / "Voltar ao menu" on confirmation returns to the shop view **[Locale-aware]**

**Steps:** Click `[data-testid="confirm-back"]` on the confirmation page. *(Button label: "Back to menu" in en-US; "Voltar ao menu" in pt-BR. Use the `data-testid` selector to stay locale-agnostic.)*

**Expected:** Product grid is visible; view is `shop`.

---

## Suite 08 — Navigation & Views

---

### TC-08-01 — App starts on the shop view

**Steps:** Navigate to `/`.

**Expected:** `[data-testid="product-grid"]` is visible.

---

### TC-08-02 — "Go to checkout" shows a 750ms full-screen spinner

**Preconditions:** Location saved; cart non-empty.  
**Steps:**
1. Open cart, click `[data-testid="go-checkout"]`.
2. Immediately assert `.page-spinner-overlay` is visible.
3. Wait 800ms and assert overlay is gone and checkout form is visible.

**Expected:** Spinner overlay appears then disappears; checkout page renders.

---

### TC-08-03 — Header logo returns to shop from checkout

**Steps:**
1. Navigate to checkout.
2. Click `[data-testid="site-logo"]` (or the brand button).

**Expected:** Product grid is visible; URL is `/` (or the SPA shop state is restored).

---

### TC-08-04 — Header logo returns to shop from confirmation

**Steps:**
1. Complete an order (confirmation page).
2. Click the header logo.

**Expected:** Product grid is visible.

---

### TC-08-05 — "← Back to menu" on checkout returns to shop

**Steps:**
1. Navigate to checkout.
2. Click `[data-testid="back-to-shop"]`.

**Expected:** Product grid is visible.

---

### TC-08-06 — Escape key closes the location panel

**Steps:**
1. Open location panel.
2. Press `Escape`.

**Expected:** Panel closes.

---

### TC-08-07 — Escape key closes the cart drawer

**Preconditions:** Location saved.  
**Steps:**
1. Open cart drawer.
2. Press `Escape`.

**Expected:** Cart drawer closes.

---

### TC-08-08 — Escape closes location panel before cart (priority order)

**Steps:**
1. Open location panel.
2. Press `Escape` — panel closes.
3. Press `Escape` again — cart (if open) would close, but panel was priority.

**Expected:** Location panel closes on first Escape; a second Escape closes any other open panel.

---

## Suite 09 — UI Feedback & Panels

---

### TC-09-01 — Add-to-cart toast appears with correct message **[Locale-aware]**

**Preconditions:** Location saved.  
**Steps:**
1. Click `[data-testid="add-to-cart"]` on Cheeseburguer.
2. Assert `[data-testid="cart-toast"]` is visible.
3. Assert the toast text matches the active locale:
   - **US locale:** `"Cheeseburguer was successfully added to cart!"`
   - **BR locale:** `"Cheeseburguer foi adicionado ao carrinho com sucesso!"`

**Expected:** Toast is visible and contains the product name `"Cheeseburguer"` followed by locale-appropriate text. To test both variants, run this TC once with a US location and once with a BR location.

---

### TC-09-02 — Toast auto-hides after ~2.5 seconds

**Steps:**
1. Add a product.
2. Wait 3 seconds.
3. Assert toast is no longer visible.

**Expected:** Toast is gone after 2.5s + 350ms fade.

---

### TC-09-03 — Toast resets timer if another item is added while visible

**Steps:**
1. Add Cheeseburguer — note timestamp.
2. After 1 second, add Pack of tenders.
3. Assert toast is still visible at the 3-second mark (would have hidden if timer wasn't reset).

**Expected:** Toast stays visible beyond 2.5s from first add, hiding ~2.5s after the second add.

---

### TC-09-04 — Store banner appears after a valid location is saved **[Locale-aware]**

**Preconditions:** Fresh session.  
**Steps:**
1. Save a valid location (e.g. SP ZIP `05413010` — BR).
2. Assert `[data-testid="menu-store-banner"]` is visible.
3. Assert it contains `"Burguer-Tenders Pinheiros"` (store names are never translated).

**Expected:** Banner is visible and contains the store name. After saving a BR location the banner prefix reads `"Pedindo de"` (pt-BR) instead of `"Ordering from"` — assert only on the store name, not the prefix text, to remain locale-agnostic.

---

### TC-09-05 — Store banner is not shown before a location is saved

**Preconditions:** Fresh session, no location saved.

**Expected:** `[data-testid="menu-store-banner"]` does not exist in the DOM.

---

### TC-09-06 — Location panel does not re-render while typing in address fields

**Steps:**
1. Open location panel.
2. Click into the street address field.
3. Type a long string (e.g. "123 Main Street").
4. Assert focus never left the field (no `focusout` events were fired back to the input).
5. Assert the full string is present in the input.

**Expected:** No re-render; all characters retained; focus stays in field.

---

### TC-09-07 — Location pin badge indicates location is set

**Preconditions:** Valid location saved.

**Expected:** `.header-location__badge--visible` class is present on the pin badge.

---

### TC-09-08 — Location pin badge is not shown before location is saved

**Preconditions:** Fresh session.

**Expected:** `.header-location__badge--visible` class is absent.

---

### TC-09-09 — Cart badge is hidden when cart is empty

**Preconditions:** Location saved; empty cart.

**Expected:** `[data-testid="cart-count"]` does not have class `header-cart__badge--visible` (or is visually hidden).

---

### TC-09-10 — Cart badge shows correct count after adding multiple different products

**Preconditions:** Location saved.  
**Steps:**
1. Add Cheeseburguer (1 unit).
2. Add Pack of tenders (1 unit).
3. Add Cheeseburguer again (now qty 2).

**Expected:** Badge shows `"3"` (total items, not unique lines).

---

### TC-09-11 — Checkout delivery fields are read-only

**Preconditions:** Location saved; user on checkout page.  
**Steps:**
1. Assert `[data-testid="checkout-zip"]` has `readonly` attribute.
2. Assert `[data-testid="checkout-street"]` has `readonly` attribute.

**Expected:** Delivery address inputs cannot be edited.

---

### TC-09-12 — Favicon is set to the burger SVG

**Steps:**
1. Read `document.querySelector('link[rel="icon"]').href`.

**Expected:** `href` ends with `favicon.svg`.

---

## Suite 10 — Dynamic Translation

> **Goal:** Verify that the UI switches language and currency when a successful address lookup resolves to a known store, stays in the default locale when no store is found, and restores the correct locale on session reload.  
> **Base data:** Use ZIPs from the Appendix. All fresh-session tests start in `en-US`.

---

### TC-10-01 — BR lookup switches UI to Portuguese

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Open the location panel, select `BR`, enter ZIP `86015280`, click `[data-testid="location-lookup"]`.
3. Wait for `[data-testid="location-store-status"]` to show the store name.
4. Assert the menu heading `[data-testid]` or `h2.menu__heading` (visible after closing the panel).

**Expected:** Menu heading reads `"Disponível para compra"` (Portuguese). The full re-render triggered by the locale switch applies to the entire page.

---

### TC-10-02 — US lookup keeps UI in English

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Open the location panel, select `US`, enter ZIP `10001`, click `[data-testid="location-lookup"]`.
3. Wait for `[data-testid="location-store-status"]` to show the store name.
4. Close the panel and read the menu heading.

**Expected:** Menu heading reads `"Available to buy"` (English unchanged).

---

### TC-10-03 — Prices display in BRL after BR store is resolved

**Preconditions:** Fresh session.  
**Steps:**
1. Open the location panel, look up a BR ZIP (`05413010`), wait for store resolution.
2. Close the panel.
3. Read all `.product-card__price` text values on the product grid.

**Expected:** Every price matches the BRL format — begins with `R$` and uses a comma as the decimal separator (e.g. `R$\u00a019,89`). No price starts with `$`.

---

### TC-10-04 — Prices remain in USD after US store is resolved

**Preconditions:** Fresh session.  
**Steps:**
1. Open the location panel, look up a US ZIP (`10001`), wait for store resolution.
2. Close the panel.
3. Read all `.product-card__price` text values.

**Expected:** Every price starts with `$`, includes a decimal point, and has two cents digits. No price uses `R$` or comma decimal.

---

### TC-10-05 — Locale does NOT change when lookup resolves to no store

**Preconditions:** Fresh session.  
**Steps:**
1. Open the location panel, select `BR`, enter Curitiba ZIP `80010010`, click `[data-testid="location-lookup"]`.
2. Wait for `[data-testid="location-store-status"]` to update.
3. Close the panel and read the menu heading.

**Expected:** `[data-testid="location-store-status"]` contains `"We don't deliver to this city yet"` (English — locale unchanged). Menu heading is still `"Available to buy"`.

---

### TC-10-06 — Category filter labels are translated in BR locale

**Preconditions:** BR location resolved (lookup with ZIP `05413010`).  
**Steps:**
1. Close the location panel and inspect `[data-testid="menu-category-filter"]` option elements.

**Expected:** Options read `"Tudo"`, `"Hambúrgueres"`, `"Tenders"`, `"Combos"`, `"Bebidas"`, `"Acompanhamentos"` — not the English equivalents.

---

### TC-10-07 — Spicy badge reads "Picante" in BR locale

**Preconditions:** BR location resolved.  
**Steps:**
1. Close the location panel.
2. Read the text of `.product-card__badge` on any spicy product (e.g. `[data-product-id="bt-special"]`).

**Expected:** Badge text is `"Picante"`.

---

### TC-10-08 — Cart drawer strings are translated in BR locale

**Preconditions:** BR location resolved; at least one item in cart.  
**Steps:**
1. Open the cart drawer.
2. Assert the drawer title (`h2.cart-drawer__title`).
3. Assert the "Go to checkout" button text (`[data-testid="go-checkout"]`).

**Expected:**
- Drawer title: `"Carrinho"`
- Checkout button: `"Ir para o pagamento"`

---

### TC-10-09 — Empty cart message is translated in BR locale

**Preconditions:** BR location resolved; empty cart.  
**Steps:**
1. Open the cart drawer.
2. Read the empty-state paragraph (`.cart-drawer__empty`).

**Expected:** Text is `"Seu carrinho está vazio."`.

---

### TC-10-10 — Add-to-cart toast is in Portuguese after BR store resolved

**Preconditions:** BR location resolved.  
**Steps:**
1. Click `[data-testid="add-to-cart"]` on Cheeseburguer.
2. Assert `[data-testid="cart-toast"]` text.

**Expected:** Toast reads `"Cheeseburguer foi adicionado ao carrinho com sucesso!"`.

---

### TC-10-11 — Checkout page labels are in Portuguese when BR location is active

**Preconditions:** BR location saved and synced; item in cart; user navigated to checkout.  
**Steps:**
1. Assert the checkout page title.
2. Assert the "Place order" submit button text.
3. Assert the "Back to menu" back-link text.

**Expected:**
- Page title: `"Finalizar pedido"`
- Submit button (`[data-testid="place-order"]`): `"Fazer pedido"`
- Back link (`[data-testid="back-to-shop"]`): `"← Voltar ao menu"`

---

### TC-10-12 — Confirmation page is in Portuguese when BR location is active

**Preconditions:** BR location saved; order placed with name `"Alice"`.  
**Steps:**
1. Assert `[data-testid="confirm-title"]` text.
2. Assert the subtitle below the check circle.
3. Assert the ETA line inside `[data-testid="confirm-eta"]`.
4. Assert the "Back to menu" button (`[data-testid="confirm-back"]`).

**Expected:**
- Title: `"Obrigado(a), Alice!"`
- Subtitle: `"Seu pedido foi realizado!"`
- ETA: contains `"Entrega estimada:"` and `"30 min"`
- Back button: `"Voltar ao menu"`

---

### TC-10-13 — Session restore applies the saved locale on page reload

**Preconditions:** BR location saved and confirmed (panel closed, banner visible).  
**Steps:**
1. Reload the page (`page.reload()`).
2. Wait for the app to hydrate (banner is visible again).
3. Read the menu heading and a product price.

**Expected:** On first paint after hydration the menu heading is `"Disponível para compra"` and prices are in BRL format — the locale was restored from the saved `countryCode` in the session before the first render.

---

### TC-10-14 — Switching from BR to US location reverts to English and USD

**Preconditions:** BR location already resolved and active (pt-BR locale).  
**Steps:**
1. Open the location panel.
2. Change country to `US`, enter ZIP `10001`, click `[data-testid="location-lookup"]`.
3. Wait for `[data-testid="location-store-status"]` to show `"Burguer-Tenders Midtown"`.
4. Close the panel and read the menu heading and a product price.

**Expected:** Menu heading reverts to `"Available to buy"` and prices are in USD format (`$X.XX`). The locale switched back to `en-US` on the US store resolution.

---

---

## Suite 11 — Promo Banner

> **Goal:** Verify that the rotating promo banner renders correctly and responds to user interaction (§2.3).

---

### TC-11-01 — Promo banner is visible on the shop page

**Preconditions:** Fresh session.
**Steps:**
1. Navigate to `/`.
2. Assert `[data-testid="promo-banner"]` is visible.

**Expected:** The promo banner is rendered on the shop page.

---

### TC-11-02 — All three promo slides are rendered

**Steps:**
1. Navigate to `/`.
2. Assert `[data-testid="promo-slide-combo"]`, `[data-testid="promo-slide-spicy"]`, and `[data-testid="promo-slide-delivery"]` exist in the DOM.

**Expected:** All three slides are present.

---

### TC-11-03 — Navigation dots allow manual slide selection

**Steps:**
1. Navigate to `/`.
2. Click the second navigation dot inside `[data-testid="promo-banner"]`.
3. Assert the second slide is the active/visible one.

**Expected:** Clicking a dot switches to the corresponding slide.

---

### TC-11-04 — Auto-rotation pauses on hover

**Steps:**
1. Navigate to `/`.
2. Hover over `[data-testid="promo-banner"]`.
3. Wait 6 seconds.
4. Assert the current slide has not changed.

**Expected:** The banner does not auto-advance while the user hovers over it.

---

## Suite 12 — Menu Search

> **Goal:** Verify the collapsible search input filters products correctly and integrates with the category filter (§1.6).

---

### TC-12-01 — Search icon opens the input and focuses it

**Preconditions:** Fresh session.
**Steps:**
1. Navigate to `/`.
2. Assert `[data-testid="menu-search"]` is not visible.
3. Click `[data-testid="menu-search-toggle"]`.
4. Assert `[data-testid="menu-search"]` is visible and focused.

**Expected:** Search field appears and receives focus on toggle click.

---

### TC-12-02 — Search filters products by localized name (case-insensitive)

**Preconditions:** Fresh session.
**Steps:**
1. Open search, type `"cheese"`.
2. Count visible product cards.

**Expected:** Only products whose name contains "cheese" (case-insensitive) are shown. At minimum Cheeseburguer and Cheeseburguer Bacon should appear.

---

### TC-12-03 — Search narrows results within the active category filter

**Preconditions:** Fresh session.
**Steps:**
1. Select category filter `"burger"` (4 results).
2. Open search, type `"avocado"`.
3. Count visible product cards.

**Expected:** Only burger products matching "avocado" are shown — other categories are excluded.

---

### TC-12-04 — Empty state appears when no product matches search

**Preconditions:** Fresh session.
**Steps:**
1. Open search, type `"xyznotaproduct"`.

**Expected:** The menu shows the localized empty-state message and no product cards are visible.

---

### TC-12-05 — Closing the search input clears the query

**Preconditions:** Fresh session.
**Steps:**
1. Open search, type `"cheese"` — confirm filtered results.
2. Click `[data-testid="menu-search-close"]`.
3. Count visible product cards.

**Expected:** Search is closed, query is cleared, and all 16 products are shown again.

---

## Suite 13 — Product Customizer

> **Goal:** Verify the item customizer dialog opens correctly, applies add-on pricing, and produces unique cart lines (§6).

---

### TC-13-01 — Clicking "Add to cart" with valid location opens the customizer dialog

**Preconditions:** Valid delivery location saved.
**Steps:**
1. Click `[data-testid="add-to-cart"]` on any product.
2. Assert `[data-testid="item-customizer"]` (or the customizer dialog) is visible.
3. Assert the cart count has NOT changed yet.

**Expected:** Customizer opens; product is not added until the user confirms.

---

### TC-13-02 — Customizer resets when a different product is opened

**Preconditions:** Valid location saved.
**Steps:**
1. Open customizer for Cheeseburguer. Select 2 patties.
2. Close the customizer (cancel).
3. Open customizer for another product.
4. Assert patty count is back to 1 and no extras are selected.

**Expected:** Customizer state resets for each new product.

---

### TC-13-03 — Patty selector appears only for burger products

**Preconditions:** Valid location saved.
**Steps:**
1. Open customizer for a burger (e.g. Cheeseburguer) — assert patty selector is visible.
2. Cancel. Open customizer for a non-burger product (e.g. Pack of tenders) — assert patty selector is NOT visible.

**Expected:** Patty selection is exclusive to the `"burger"` category.

---

### TC-13-04 — Selecting 2 patties adds $2.00 upcharge to displayed price

**Preconditions:** Valid location saved; open customizer for a burger.
**Steps:**
1. Note the base price shown.
2. Click the "2 patties" option.
3. Read the updated unit price in the customizer.

**Expected:** Unit price = base price + $2.00.

---

### TC-13-05 — Add-ons are category-specific

**Preconditions:** Valid location saved.
**Steps:**
1. Open customizer for a burger — assert burger add-ons appear (e.g. "Extra cheese", "Bacon").
2. Cancel. Open customizer for a drink — assert drink add-ons appear ("Large size", "No ice"), and burger add-ons are absent.

**Expected:** Add-on list matches the product category as specified in §6.4.

---

### TC-13-06 — Grand line total updates as add-ons are selected

**Preconditions:** Valid location saved; open customizer for any product.
**Steps:**
1. Note the initial line total (quantity 1).
2. Select one add-on with a non-zero upcharge.
3. Read the updated line total.

**Expected:** Line total = (base price + add-on upcharge) × quantity.

---

### TC-13-07 — Two customized versions of the same product create separate cart lines

**Preconditions:** Valid location saved.
**Steps:**
1. Add Cheeseburguer with default options.
2. Add Cheeseburguer again with "Extra cheese" selected.
3. Open cart drawer and count `[data-testid="cart-lines"] li` items.

**Expected:** Two separate lines appear even though it is the same base product.

---

## Suite 14 — Tips & Donations

> **Goal:** Verify tip and donation calculations and UI interactions on the checkout page (§9).

---

### TC-14-01 — Tip preset options are displayed on checkout

**Preconditions:** Location saved; item in cart; on checkout page.
**Steps:**
1. Assert `[data-testid="tip-option-0"]`, `[data-testid="tip-option-10"]`, `[data-testid="tip-option-15"]`, `[data-testid="tip-option-20"]` are all visible.

**Expected:** All four tip options are displayed.

---

### TC-14-02 — Selecting a tip updates the tip amount row

**Preconditions:** On checkout page.
**Steps:**
1. Click `[data-testid="tip-option-10"]`.
2. Assert `[data-testid="checkout-tip-amount"]` is visible.

**Expected:** The tip amount row appears after a non-zero tip is selected.

---

### TC-14-03 — Tip amount equals subtotal × percentage ÷ 100

**Preconditions:** On checkout page; known subtotal.
**Steps:**
1. Read the subtotal from `[data-testid="checkout-subtotal"]`.
2. Select the 15% tip.
3. Read `[data-testid="checkout-tip-amount"]`.

**Expected:** Tip = subtotal × 0.15 (formatted with `formatPrice`).

---

### TC-14-04 — Donation fixed presets are displayed

**Preconditions:** On checkout page.
**Steps:**
1. Assert `[data-testid="donation-fixed-1"]`, `[data-testid="donation-fixed-2"]`, `[data-testid="donation-fixed-5"]` are visible.

**Expected:** Fixed donation preset buttons (1, 2, 5 currency units) are shown.

---

### TC-14-05 — Donation percent presets are displayed

**Preconditions:** On checkout page.
**Steps:**
1. Assert `[data-testid="donation-percent-1"]`, `[data-testid="donation-percent-2"]`, `[data-testid="donation-percent-5"]` are visible.

**Expected:** Percent donation preset buttons (1%, 2%, 5%) are shown.

---

### TC-14-06 — Custom fixed donation amount updates the donation row

**Preconditions:** On checkout page.
**Steps:**
1. Type `"3"` into `[data-testid="donation-custom-fixed"]`.
2. Assert `[data-testid="checkout-donation-amount"]` is visible.

**Expected:** The donation amount row appears with a non-zero donation.

---

### TC-14-07 — Grand total equals subtotal + tip + donation

**Preconditions:** On checkout page; known subtotal.
**Steps:**
1. Select 10% tip.
2. Click `[data-testid="donation-fixed-1"]`.
3. Read `[data-testid="checkout-subtotal"]`, `[data-testid="checkout-tip-amount"]`, `[data-testid="checkout-donation-amount"]`, and `[data-testid="checkout-total"]`.

**Expected:** Grand total = subtotal + tip amount + $1.00 donation (all in active currency).

---

### TC-14-08 — "No donation" resets donation row to zero

**Preconditions:** On checkout page; a donation preset has been selected.
**Steps:**
1. Select `[data-testid="donation-fixed-2"]`.
2. Click `[data-testid="donation-none"]`.
3. Assert `[data-testid="checkout-donation-amount"]` is not visible.

**Expected:** Donation row disappears and grand total reverts to subtotal + tip.

---

### TC-14-09 — Donation displays in BRL when BR locale is active **[Locale-aware]**

**Preconditions:** BR location saved; on checkout page.
**Steps:**
1. Click `[data-testid="donation-fixed-1"]`.
2. Read `[data-testid="checkout-donation-amount"]`.

**Expected:** Donation amount is displayed as `R$5,70` (1 USD × 5.7 conversion formatted as BRL).

---

## Suite 15 — Authentication

> **Goal:** Verify signup, login, profile management, previous orders, reorder prompt and logout flows (§5).

---

### TC-15-01 — Guest can complete full checkout without an account

**Preconditions:** Fresh session, no signup.
**Steps:**
1. Save a valid location, add a product, navigate to checkout.
2. Fill all fields, place order.
3. Assert `[data-testid="confirmation-page"]` is visible.

**Expected:** Guest checkout succeeds and shows the confirmation page.

---

### TC-15-02 — Signup requires a valid deliverable location

**Preconditions:** Fresh session.
**Steps:**
1. Navigate to the signup page.
2. Fill all fields but enter an unresolvable ZIP (e.g. `99999`).
3. Attempt to submit.

**Expected:** Signup is blocked and an error is shown for the ZIP / store field.

---

### TC-15-03 — Signup validates all required fields

**Preconditions:** On signup page.
**Steps:**
1. Submit without filling any field.

**Expected:** Errors appear for: first name, last name, email, password, confirm password, country/ZIP.

---

### TC-15-04 — Signup password must be at least 8 characters

**Preconditions:** On signup page.
**Steps:**
1. Fill all fields correctly but set password to `"short"` (5 chars).
2. Submit.

**Expected:** Password error is shown.

---

### TC-15-05 — Signup password and confirm password must match

**Preconditions:** On signup page.
**Steps:**
1. Fill password as `"Password1"` and confirm as `"Password2"`.
2. Submit.

**Expected:** Confirm password error is shown.

---

### TC-15-06 — Successful signup shows animation and redirects to profile

**Preconditions:** Using a unique email not already registered.
**Steps:**
1. Fill all signup fields correctly, including a valid BR or US ZIP.
2. Submit.

**Expected:** A success overlay animation appears, then the user is redirected to the profile page.

---

### TC-15-07 — Login with valid credentials redirects to shop

**Preconditions:** An account exists (seed user or one created in TC-15-06).
**Steps:**
1. Navigate to the login page.
2. Fill email and password correctly. Submit.

**Expected:** Login succeeds and the shop (`[data-testid="product-grid"]`) is visible.

---

### TC-15-18 — Login clears any guest checkout form data

**Preconditions:** Guest has navigated to checkout and filled name, email, and card fields.
**Steps:**
1. Fill the checkout form with guest data and navigate back to the menu.
2. Log in with a valid account.
3. Dismiss the reorder prompt if shown.
4. Add a product to the cart and navigate to checkout.

**Expected:** The name, email, and card name fields are all empty — no guest data carries over.

---

### TC-15-08 — Login hydrates the saved user location

**Preconditions:** Authenticated user with a saved location.
**Steps:**
1. Log in.
2. Assert `[data-testid="location-summary"]` is visible in the header.

**Expected:** The user's saved delivery location is restored after login.

---

### TC-15-09 — Authenticated user's profile icon opens the profile page

**Preconditions:** User is logged in.
**Steps:**
1. Click the profile icon in the header.

**Expected:** The profile page is shown.

---

### TC-15-10 — Guest profile icon click redirects to login

**Preconditions:** Fresh session (not logged in).
**Steps:**
1. Click the profile icon in the header.

**Expected:** The login page is shown.

---

### TC-15-11 — Profile "Account Details" tab shows the user's data

**Preconditions:** Logged-in user.
**Steps:**
1. Open profile.
2. Assert the Account Details tab contains the user's name and email.

**Expected:** Profile fields are pre-filled with the authenticated user's data.

---

### TC-15-12 — Previous orders tab shows order history for authenticated user

**Preconditions:** Authenticated user with at least one placed order.
**Steps:**
1. Open profile, navigate to "Previous Orders" tab.
2. Assert at least one order entry is visible.

**Expected:** Previous orders are listed.

---

### TC-15-13 — Reorder from previous orders adds items to the cart

**Preconditions:** Authenticated user with a previous order.
**Steps:**
1. Open a previous order modal.
2. Click the reorder button.
3. Open the cart drawer.

**Expected:** The cart contains the same products from the previous order.

---

### TC-15-14 — Reorder prompt is shown on the shop page for returning authenticated users

**Preconditions:** Authenticated user with at least one previous order.
**Steps:**
1. Log in and navigate to the shop.
2. Assert the reorder prompt is visible.
3. Assert the prompt contains the text `"Feeling hungry? Reorder your favorite combo!"` (en-US) or `"Com fome? Peca seu combo favorito de novo!"` (pt-BR).

**Expected:** Reorder prompt is displayed with the correct localized text.

---

### TC-15-15 — Logout clears session and returns to guest workflow

**Preconditions:** Authenticated user on the shop page.
**Steps:**
1. Open profile, click logout.
2. Assert the product grid is visible.
3. Click the profile icon in the header.

**Expected:** After logout the shop is shown, and clicking the profile icon routes to the login page (guest workflow restored).

---

## Supplement — Additional rules not covered in original suites

---

### TC-S01 — Product card displays calories

> Covers §1.2 (`caloriesKcal` is displayed on product cards).

**Preconditions:** Fresh session.
**Steps:**
1. Navigate to `/`.
2. Pick any product card and assert it contains a calories value (e.g. text matching `\d+ kcal` or a `data-testid="product-calories"` element).

**Expected:** Each card shows the caloric value.

---

### TC-S02 — Header brand shows "BeeTee's" and tagline

> Covers §2.1.

**Preconditions:** Fresh session.
**Steps:**
1. Navigate to `/`.
2. Assert the header contains the text `"BeeTee's"`.
3. Assert the header contains the tagline `"the best of both worlds"`.

**Expected:** Both brand name and tagline are visible.

---

### TC-S03 — ZIP auto-lookup triggers on blur when BR ZIP reaches 8 digits

> Covers §4.6 (blur trigger).

**Preconditions:** Location panel open; country set to BR.
**Steps:**
1. Type 7 digits into `[data-testid="location-zip"]` and tab away — assert no lookup started.
2. Type the 8th digit and tab away — assert the address fields begin to populate (or the lookup progress indicator appears).

**Expected:** Lookup triggers automatically on blur when exactly 8 digits are present.

---

### TC-S04 — ZIP auto-lookup triggers on blur when US ZIP reaches 5 digits

> Covers §4.6 (blur trigger, US).

**Preconditions:** Location panel open; country set to US.
**Steps:**
1. Type 4 digits into `[data-testid="location-zip"]` and tab away — assert no lookup started.
2. Type the 5th digit and tab away — assert lookup starts.

**Expected:** Lookup triggers automatically on blur when exactly 5 digits are present for US.

---

### TC-S05 — Save button stays disabled for 500 ms after lookup completes

> Covers §4.7.

**Preconditions:** Location panel open.
**Steps:**
1. Type a valid ZIP and click the lookup button.
2. Immediately after the lookup progress disappears, assert `[data-testid="location-save"]` is still disabled.
3. Wait 600 ms and assert the save button is now enabled.

**Expected:** There is a brief 500 ms window after lookup where the save button remains disabled.

---

### TC-S06 — A US ZIP entered with BR country selected does not resolve to a BR store

> Covers §3.3 (no cross-country matching).

**Preconditions:** Location panel open; country selector set to BR.
**Steps:**
1. Enter a US ZIP (`10001`) while the country is set to `BR`.
2. Click lookup.
3. Assert `[data-testid="location-store-status"]` does NOT contain any BeeTee's store name.

**Expected:** No store is resolved; the "We don't deliver to this city yet" message appears.

---

### TC-S07 — US ZIP+4 is accepted and normalized to 5 digits for lookup

> Covers §12.3 (postal code normalization).

**Preconditions:** Location panel open; country set to US.
**Steps:**
1. Type `"10001-1234"` into `[data-testid="location-zip"]`.
2. Click lookup.
3. Assert that address fields populate correctly (same result as entering `"10001"`).

**Expected:** ZIP+4 format resolves correctly; the store for New York is matched.

---

### TC-S08 — Navigating to shop via header logo clears checkout validation errors

> Covers §11.2.

**Preconditions:** Location saved; item in cart; on checkout page with validation errors visible (submit empty form).
**Steps:**
1. Submit the empty checkout form to trigger errors.
2. Assert `[data-testid="checkout-error-fullName"]` is visible.
3. Click the header logo / brand.
4. Navigate back to checkout.

**Expected:** After navigating away and returning, no stale error messages are displayed.

---

## Appendix — Test ZIPs Reference

| Country | ZIP | Expected city | Expected store |
|---|---|---|---|
| BR | `86015280` | Londrina, PR | Burguer-Tenders Higienopolis |
| BR | `05413010` | São Paulo, SP | Burguer-Tenders Pinheiros |
| US | `10001` | New York, NY | Burguer-Tenders Midtown |
| BR | `80010010` | Curitiba, PR | *(no store — delivery unavailable)* |

## Appendix — Valid Card Test Data

| Field | Value |
|---|---|
| Name on card | `Test User` |
| Card number | `4111 1111 1111 1111` |
| Expiry | `12 / 28` |
| CVC | `123` |

---

*Test plan version: April 2026 — covers all business rules in `BUSINESS_RULES.md`, including §10 Dynamic Translation.*
