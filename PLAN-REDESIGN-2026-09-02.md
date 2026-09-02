# Plan: Redesign fixes for MAISON guest storefront

Source: `DESIGN-IS-2026-09-02/04-handoff-prompt.md` (Dieter Rams audit, verdict REDESIGN, 14/30). This plan turns that handoff's 5 moves into phases. Each phase is self-contained — it can be picked up in a fresh chat with no other context than this file and the repo.

Repo: `/mnt/Data/Projects/e-commerce/guest-fe-angular` (Angular 22, standalone components, Tailwind v4 `@theme` tokens in `src/styles.css`, signals-based stores, `toSignal`/`rxjs`).

**Do not invent new APIs or patterns.** Every phase below says exactly which existing file to copy a pattern from. If a phase needs something not covered here, stop and re-read the cited file rather than guessing.

---

## Phase 0: Documentation Discovery (facts, read this before touching anything)

**The "documentation" for this codebase is its own existing patterns — there is no external library to look up.** These are the exact, verified-current APIs/patterns every later phase must copy from:

- **RxJS error-handling pattern already correct in this codebase**: `src/app/services/product.service.ts:56-61`, `getBySlug()`:
  ```ts
  getBySlug(slug: string): Observable<Product | undefined> {
    return this.http.get<ApiProduct>(`${this.baseUrl}/${slug}`).pipe(
      map(mapProduct),
      catchError(() => of(undefined)),
    );
  }
  ```
  `catchError` and `of` are already imported at `product.service.ts:3`. The broken sibling is `getAll()` at `product.service.ts:52-54`, which has no `catchError`.

- **Button component contract**: `src/app/components/button/button.ts` — `ButtonVariant = 'primary' | 'secondary' | 'ghost'` (line 5), `VARIANT_CLASS` record (lines 10-17), `BASE_CLASS` (line 8, includes `disabled:opacity-40`). Global conflicting rule: `src/styles.css:66` — `button:disabled { cursor: not-allowed; opacity: 0.52; }`.

- **Design tokens**: `src/styles.css:6-17`, the `@theme` block. 12 tokens: `background, foreground, muted, muted-foreground, accent, accent-secondary, accent-foreground, accent-muted, border, border-hover, card, ring`. `ring` (line 17) is defined but never referenced anywhere in `src/app` — confirm with `grep -rn "ring-" src/app --include=*.html` before reusing or removing it.

- **Duplicated affordances to consolidate** (exact current locations, verified this session):
  - Quantity stepper (−/+ buttons), 3 independent copies:
    - `src/app/pages/product-detail/product-detail.html:69-87` (has `aria-label="Decrease/Increase quantity"`, buttons are `h-9 w-9`)
    - `src/app/pages/cart/cart.html:25-29` (**no `aria-label`**, buttons are `h-9 w-9`)
    - `src/app/components/cart-drawer/cart-drawer.html:63-80` (has `aria-label`, buttons are `h-11 w-11`)
    - Handler method `setQuantity` duplicated independently in `product-detail.ts:106-108`, `cart.ts` (`setQuantity(item, n)`), `cart-drawer.ts` (`setQuantity(item, n)`).
  - Wishlist-heart toggle, same SVG path `M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z` copy-pasted:
    - `src/app/components/product-card/product-card.html:19-21` (18×18 icon, `saved()` signal from `WishlistStore`)
    - `src/app/pages/product-detail/product-detail.html:93-115` (20×20 icon, same `saved()`/`toggleWishlist()` pattern)
  - Close/X icon, 3 different hand-rolled SVGs:
    - `src/app/components/cart-drawer/cart-drawer.html:2-9` (backdrop button, `tabindex="-1"`, no visible icon — just a click target)
    - `src/app/components/cart-drawer/cart-drawer.html:22-31` (explicit X button, path `M6 6l12 12M18 6 6 18`)
    - `src/app/components/header/header.html:12-14` (mobile-nav toggle X state, path `M5 5l14 14M19 5 5 19`)

- **Return-policy contradiction** (exact quotes, current):
  - `src/app/pages/size-guide/size-guide.html:27`: "...and sizing exchanges are always free either way."
  - `src/app/pages/shipping-returns/shipping-returns.html:4`: "Delivery pricing, lead times and return windows must be configured by the store operator before a real deployment."
  - `src/app/pages/shipping-returns/shipping-returns.html:11`: "The configured store policy—not this demonstration copy—determines eligibility and next steps."

- **"Buy Now" mismatch** (exact current code):
  - Label: `src/app/pages/product-detail/product-detail.html:118-120` — `<app-button variant="secondary" [fullWidth]="true" (clicked)="buyNow(product)">Buy Now</app-button>`
  - Handler: `src/app/pages/product-detail/product-detail.ts:120-127`:
    ```ts
    protected buyNow(product: Product): void {
      if (!this.validateSize(product) || !this.auth.requireAuth()) return;
      this.sizeError.set(false);
      this.cart.add(this.buildCartInput(product)).subscribe(() => {
        this.cart.close();
        this.router.navigateByUrl('/cart');
      });
    }
    ```
    This is identical to `addToCart()` (`product-detail.ts:114-118`) except it navigates to `/cart` instead of setting `justAdded`. It does NOT go to `/checkout`.

- **Loading-state plain-text locations** (all identical pattern, `<p class="text-muted-foreground">Loading …&hellip;</p>`):
  - `src/app/pages/account/account.html:14`
  - `src/app/pages/orders/orders.html:5`
  - `src/app/pages/orders/order-detail/order-detail.html:12`
  - Note: `product-detail.html:1-9` already has a **real** skeleton pattern (`animate-pulse` blocks) — this is the pattern to extend/reuse, not invent from scratch.

- **Contrast-failing spots** (exact current CSS):
  - `src/app/components/footer/footer.html:31` — `placeholder:text-background/45` on a `bg-foreground` footer → 4.22:1, fails AA (needs 4.5:1).
  - `src/styles.css:139` — `.field-input { border: 1px solid var(--color-border-hover); ... }` → `--color-border-hover` (`#a99a9c`) against `--color-background`/`--color-card` = 2.6:1, fails the 3:1 non-text/UI-boundary threshold.
  - `src/app/pages/about/about.html:29` (already patched this session to `variant="primary"` for the hover-invisibility bug) — idle-state box on the `bg-accent` section (`about.html:26`) still has no visible boundary since `primary`'s idle `border-accent`/`bg-accent` matches the section background exactly.
  - `src/app/pages/home/home.html:42` (also already patched to `variant="primary"`) — same idle-boundary gap on its `bg-foreground` section (`home.html:32`).

- **`text-white` bypass locations** (should be `text-accent-foreground` — same hex `#ffffff`, but goes through the token):
  ```
  grep -rn "text-white" src/app --include=*.html
  ```
  Run this at the start of Phase 3 to get the current authoritative list (13 were found during the audit; re-verify count before editing since files have changed since).

**Known gap carried into this plan**: the backend API is not running in this dev environment, so every fix below must be verified by reading code + forcing the relevant state (e.g., temporarily throwing in a mocked observable, or using browser devtools to block the network request), not by a normal happy-path click-through.

---

## Phase 1: Fix the broken catalog error path (#2 useful, #8 thorough)

**What to implement**: Copy the exact `catchError`/`of` pattern from `product.service.ts:56-61` (`getBySlug`) into `getAll()`.

```ts
// src/app/services/product.service.ts — getAll(), currently lines 52-54
getAll(): Observable<Product[]> {
  return this.http.get<ApiProduct[]>(this.baseUrl).pipe(
    map((list) => list.map(mapProduct)),
    catchError(() => of([] as Product[])),
  );
}
```
`catchError` and `of` are already imported at the top of the file (line 3) — no new import needed.

**Verification checklist**:
- `grep -n "catchError" src/app/services/product.service.ts` shows it in both `getAll()` and `getBySlug()`.
- With the backend down (current dev state), reload `/products` — the page must show the existing "No products match these filters." fallback (`src/app/pages/catalog/catalog.html:42-43`), not a blank screen. Confirm via browser console: no uncaught `HttpErrorResponse`.
- Confirm `product-detail.ts:64-66`'s `allProducts` signal (which also calls `getAll()`) no longer breaks the "You May Also Like" section on a product-detail page when the backend is down — it should just render zero related items (`related()` computed already guards with `? getRelatedProducts(...) : []`).
- Run existing unit tests: `npm test` — no regressions expected since this only adds error handling, doesn't change the success path's shape (`Observable<Product[]>` unchanged).

**Anti-pattern guards**: Do not add a `retry()` or loading-spinner here — that's Phase 5's job and a separate concern. Do not change `getAll()`'s return type (must stay `Observable<Product[]>`, not `Product[] | undefined`, so existing callers (`product-detail.ts:64`, catalog, search, wishlist, home) don't need changes.

---

## Phase 2: Copy honesty fixes (#6 honest, #4 understandable)

**What to implement** — two independent, small copy/behavior fixes:

**2a. Return-policy contradiction.** Pick ONE true statement and make both pages agree. Recommended (matches the rest of the app's honest "this is a course project, policy is configurable" framing already established in `shipping-returns.html`): change `size-guide.html:27` to stop promising a fixed policy.

Current (`src/app/pages/size-guide/size-guide.html:20-28`):
```html
<p class="mt-10 text-sm text-muted-foreground">
  Still unsure?
  <a routerLink="/contact" class="text-accent underline decoration-1 underline-offset-4 hover:text-accent-secondary">Ask us</a>
  before you order &mdash; and sizing exchanges are always free either way.
</p>
```
Replace the trailing clause so it defers to the same "configured store policy" language already used in `shipping-returns.html:11`, e.g.:
```html
before you order &mdash; exchange eligibility follows the store's configured return policy.
```
(Exact wording is a copy decision — the requirement is: no absolute "always free" claim that contradicts `shipping-returns.html`.)

**2b. "Buy Now" mismatch.** Two valid fixes — pick based on product intent, don't invent a third:
- **Option A (relabel to match behavior — smaller change)**: rename the button text at `product-detail.html:119` from `Buy Now` to `Add & View Bag` (or similar honest label), keep `buyNow()` unchanged.
- **Option B (make behavior match the label — bigger change)**: change `buyNow()` (`product-detail.ts:120-127`) to navigate to `/checkout` instead of `/cart`:
  ```ts
  protected buyNow(product: Product): void {
    if (!this.validateSize(product) || !this.auth.requireAuth()) return;
    this.sizeError.set(false);
    this.cart.add(this.buildCartInput(product)).subscribe(() => {
      this.cart.close();
      this.router.navigateByUrl('/checkout');
    });
  }
  ```
  Verify `/checkout` (`src/app/pages/checkout/checkout.html`) correctly handles arriving with exactly one item just added — it already reads from `CartStore` reactively, so no special-casing should be needed, but check `checkout.ts` doesn't assume the cart was already reviewed.

Default to **Option B** unless the team decides "Buy Now" should stay a cart-first flow — Option B is what the label already promises to a shopper.

**Verification checklist**:
- Both pages' copy no longer contradict each other — read both files side by side.
- Click "Buy Now" (or unit-test `buyNow()`) and confirm the resulting route matches whichever option was chosen.
- `npm test` — check `product-detail.spec.ts` (if it asserts on `buyNow`'s navigation target) is updated to match.

**Anti-pattern guards**: Don't leave both pages disagreeing "for now." Don't add a third checkout-adjacent CTA — this fixes the existing two ("Add to Bag" / "Buy Now"), it doesn't add a third.

---

## Phase 3: Design-token consolidation + contrast + colored-band button variant (#3 aesthetic, #10 as little design as possible, accessibility floor)

**What to implement**:

**3a. Curate the spacing scale.** Run `grep -rhoE '\b(gap|p[xytrbl]?|m[xytrbl]?|space-[xy])-[0-9.]+\b' src/app --include=*.html | sort | uniq -c | sort -rn` to get the current authoritative list (23 distinct values were found during the audit; re-verify since files changed). Pick a curated subset — e.g. `{1, 2, 3, 4, 6, 8, 9, 12, 14, 16, 20, 24}` (12 steps covering 4px–96px) — and replace near-duplicate section paddings (`py-16`/`py-18`/`py-20` are the flagged offenders) with one consistent value app-wide for "large section padding." Do this file-by-file with `Edit`, not a blind sed — check each usage's visual context first.

**3b. Curate the type scale.** Same approach for `text-*` classes. The two flagged bespoke sizes duplicating existing Tailwind steps: `.skip-link` at `src/styles.css:101` (`font-size: 0.875rem` = 14px, same as Tailwind's `text-sm`) and `.maison-brand__word` at `src/styles.css:127` (`font-size: 1.125rem` = 18px, same as Tailwind's `text-lg`) — these are custom CSS classes, not Tailwind utilities, so they can't be trivially replaced with a utility class, but confirm they're intentionally custom (e.g. needed for the `letter-spacing`/`font-weight` combination) rather than an accidental duplicate scale step.

**3c. Replace `text-white` with the `accent-foreground` token.**
```
grep -rn "text-white" src/app --include=*.html
```
For each hit, confirm the surrounding background is `bg-accent`/`bg-foreground` (i.e., `#ffffff` is correct there) and change `text-white` → `text-accent-foreground`. Do NOT do a blind find-replace — some `text-white` usages might be on a background where white isn't actually `accent-foreground`'s intended semantic (check each one).

**3d. Fix contrast**:
- `footer.html:31`: change `placeholder:text-background/45` to a less-transparent opacity that clears 4.5:1 against `--color-foreground` (`#272126`) — `/55` measured at 5.55:1 in the audit (`footer.html:8,16,24` already use `/55` for labels on the same background), so reuse that same opacity value for consistency: `placeholder:text-background/55`.
- `src/styles.css:139`: `.field-input`'s border currently uses `--color-border-hover` (`#a99a9c`, 2.6:1). Either darken the border token for this specific use or introduce a dedicated slightly-darker border variable for interactive-control boundaries — verify the new value against `--color-background` (`#fffaf4`) and `--color-card` (`#fffdf9`) clears 3:1 before committing (use the WCAG relative-luminance formula, or `npx wcag-contrast` if available).

**3e. New button variant for colored bands.** Add a 4th `ButtonVariant` to `src/app/components/button/button.ts` (currently `'primary' | 'secondary' | 'ghost'`, line 5) — e.g. `'inverse'` — designed to keep a visible boundary in both idle and hover states regardless of the section's background color:
```ts
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'inverse';
// ...
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: '...', // unchanged
  secondary: '...', // unchanged
  ghost: '...', // unchanged
  inverse:
    'border border-background bg-transparent text-background hover:bg-background hover:text-foreground',
};
```
(Exact hover-fill color should be verified against both use sites below — `background` inverting to `foreground` text works on both an accent band and a dark band since `background`/`foreground` are the two ends of the app's core contrast pair.)
Then switch the two sites patched earlier this session to use it:
- `src/app/pages/about/about.html:29` — `variant="primary"` → `variant="inverse"`.
- `src/app/pages/home/home.html:42` — `variant="primary"` → `variant="inverse"`.

**Verification checklist**:
- `npx tsc -p tsconfig.app.json --noEmit` — no type errors after adding the `inverse` variant.
- Screenshot (via the `playwright` skill CLI, save to `/tmp/`, delete after) both idle and hover states of the About and Home CTA buttons — confirm a visible border/box in BOTH states this time, not just hover.
- Recompute contrast for the new `footer.html:31` placeholder value and the new `.field-input` border value — both must clear their respective WCAG thresholds (4.5:1 text, 3:1 non-text).
- Visual diff pass on 2-3 representative pages (Home, About, Product listing) to confirm the spacing/type curation didn't visibly break any layout — compare against the screenshots taken during the design-is audit if still available, otherwise take fresh ones.

**Anti-pattern guards**: Don't rename/remove the existing `ring` token without confirming zero usages first (`grep -rn "ring-" src/app --include=*.html`) — if truly unused, removing it is fine and even matches #10, but verify first. Don't introduce a 5th variant "just in case" — `inverse` covers both flagged sites; don't speculatively add more.

---

## Phase 4: Extract shared components (#10 as little design as possible)

**What to implement** — three new small standalone components, modeled directly on how `src/app/components/button/button.ts` is structured (a small standalone component with `input()`/`output()` signals, no external dependencies beyond Angular core):

**4a. `QuantityStepper` component** (new file `src/app/components/quantity-stepper/quantity-stepper.ts` + `.html`):
- Inputs: `quantity = input.required<number>()`, optional `size = input<'sm' | 'md'>('sm')` (to cover the `h-9 w-9` vs `h-11 w-11` difference found between product-detail/cart vs cart-drawer).
- Output: `quantityChange = output<number>()`.
- Template: copy the exact markup from `product-detail.html:69-87` (it already has the correct `aria-label`s) as the base, parameterize the button size class.
- Replace all 3 call sites: `product-detail.html:69-87`, `cart.html:25-29` (this one gains the missing `aria-label`s as a side effect — good, closes a Copy&Honesty finding too), `cart-drawer.html:63-80`.
- Delete the now-redundant `setQuantity` methods from `cart.ts`/`cart-drawer.ts`/`product-detail.ts` ONLY if they become pure pass-throughs to a store method — check each one; `product-detail.ts:106-108`'s `setQuantity` clamps to `Math.max(1, quantity)`, so keep that clamping logic (either in the component or the parent, pick one place, don't duplicate the clamp).

**4b. `WishlistToggle` component** (new file `src/app/components/wishlist-toggle/wishlist-toggle.ts` + `.html`):
- Inputs: `productId = input.required<string>()`, `productName = input.required<string>()`, optional `size = input<number>(18)`.
- Reads `WishlistStore` internally (inject it directly, same as `product-card.ts`/`product-detail.ts` already do) rather than passing `saved`/`toggle` through — simpler call sites.
- Template: copy the exact SVG (`path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z"`) and `aria-label`/`aria-pressed` pattern from `product-detail.html:93-115`.
- Replace call sites: `product-card.html:19-21`, `product-detail.html:93-115`. (Leave `header.html:24`'s heart icon alone — it's a plain nav link to `/wishlist`, not a toggle, so it's a different affordance despite the shared icon; don't force it into this component.)

**4c. `IconButton`/close-icon component** — lower priority than 4a/4b since the 3 close-icon instances have genuinely different roles (backdrop click-target vs. explicit close vs. nav-toggle state icon). Minimum viable consolidation: extract just the two truly-identical close semantics — `cart-drawer.html:22-31`'s explicit close button — into a small `CloseButton` component (`aria-label` input, click output, the `M6 6l12 12M18 6 6 18` SVG baked in), and leave `header.html`'s hamburger/X toggle as-is (it's a two-state icon tied to `mobileMenuOpen()`, not a generic close action — different enough to not force-fit).

**Verification checklist**:
- `npx tsc -p tsconfig.app.json --noEmit` clean.
- `npm test` — update/add specs for the 3 new components (check existing `cart-drawer.spec.ts`, `cart.spec.ts` still pass after their templates change).
- `grep -rn "M12 20s-7-4.5-9.5-9A5" src/app --include=*.html` should return exactly 1 hit now (inside `WishlistToggle`'s own template) instead of 2.
- `grep -rn "Decrease quantity\|Increase quantity" src/app --include=*.html` should show the aria-labels present at all 3 former call sites (now inherited from the shared component).
- Visual screenshot check (playwright skill, delete after) that cart, cart-drawer, and product-detail still render and function identically to before (increment/decrement/remove, wishlist heart fill state).

**Anti-pattern guards**: Don't force `header.html`'s hamburger icon into `CloseButton` — it's genuinely a different affordance (two-state toggle icon, not a dismiss action). Don't over-generalize `QuantityStepper` with props nothing currently needs (e.g. a `min`/`max` input) — only add the `size` variance that's actually observed (`h-9 w-9` vs `h-11 w-11`).

---

## Phase 5: Loading states + disabled-opacity unification (#8 thorough)

**What to implement**:

**5a. Real loading indicator.** `product-detail.html:1-9` already has the correct pattern to copy (Tailwind `animate-pulse` blocks sized to match the content they replace) — this is NOT a new library or component to invent, just apply the same technique to the 3 flat-text loading spots:
- `src/app/pages/account/account.html:14` — replace `<p class="text-muted-foreground">Loading your profile&hellip;</p>` with `animate-pulse` blocks shaped like the profile form fields below it.
- `src/app/pages/orders/orders.html:5` — replace with `animate-pulse` blocks shaped like an order-list-item row.
- `src/app/pages/orders/order-detail/order-detail.html:12` — replace with `animate-pulse` blocks shaped like the order-detail layout.

Optionally extract a tiny reusable `SkeletonBlock` component (`<div class="animate-pulse rounded bg-muted" [style.width]="..." [style.height]="...">`) if the same block shapes repeat — check after implementing the 3 above whether that's warranted; don't build it speculatively first.

**5b. Unify disabled opacity.** Two current values: `src/app/components/button/button.ts:8`'s `disabled:opacity-40` (Tailwind utility, applies only to `app-button`) and `src/styles.css:66`'s global `button:disabled { opacity: 0.52; }` (applies to every native `<button>` including ones NOT wrapped in `app-button`, e.g. the quantity-stepper buttons, color-swatch buttons, accordion toggles). Pick one value and apply it consistently — recommended: keep `0.52` as the single source of truth in `styles.css:66` (it's already the broader, catch-all rule) and remove the redundant `disabled:opacity-40` from `button.ts:8`'s `BASE_CLASS`, since `app-button`'s inner `<button>`/`<a>` is a native element the global rule already covers... **except** the global rule is `button:disabled`, which does not match the `<a routerLink>` render path (`button.ts:27-29`) since disabled routerLinks aren't a real disabled state on an `<a>` — check whether any `app-button` usage combines `[disabled]` with `[routerLink]` (`grep -n "routerLink" src/app/components/button/button.ts` shows routerLink buttons don't bind `[disabled]` at all in the template, line 27) — if not, this is moot for the `<a>` path and the fix only needs to reconcile the `<button>` path's two competing values.

**Verification checklist**:
- Screenshot (playwright skill, delete after) the account/orders/order-detail pages' loading state — confirm skeleton blocks render instead of plain text, roughly matching the loaded layout's proportions.
- `grep -n "opacity-40\|opacity: 0.52\|opacity:0.52" src/app/components/button/button.ts src/styles.css` — confirm only one disabled-opacity value remains for native buttons.
- Manually disable a button in devtools (`disabled` attribute) on both an `app-button` and a plain quantity-stepper button, confirm they now render the same dimmed opacity.

**Anti-pattern guards**: Don't add a spinner library (no such dependency exists in `package.json` and none should be added) — Tailwind's built-in `animate-pulse` utility is sufficient and already proven in the codebase. Don't change the disabled *behavior* (pointer-events, cursor) — only the opacity *value* is inconsistent; the surrounding rules (`disabled:pointer-events-none`, `cursor: not-allowed`) are fine as-is.

---

## Final Phase: Verification

1. `npx tsc -p tsconfig.app.json --noEmit` and `npx tsc -p tsconfig.spec.json --noEmit` — both clean.
2. `npm test` — full suite passes, including any specs added/updated in Phases 1, 2, 4.
3. `npm run build` — production build succeeds; note the new initial bundle size and compare to the audit's baseline (411.25 kB raw / ~104.56 kB transfer, `01-evidence.md` Weight & Friction) — the 3 new small components (Phase 4) should add negligible weight; flag if it grows past ~450KB raw.
4. Grep-based anti-pattern check:
   - `grep -rn "M12 20s-7-4.5-9.5-9A5" src/app --include=*.html | wc -l` → should be 1 (was 2).
   - `grep -rn "text-white" src/app --include=*.html` → should be empty or only cases deliberately confirmed NOT to map to `accent-foreground` in Phase 3c.
   - `grep -n "catchError" src/app/services/product.service.ts | wc -l` → should be 2 (both `getAll` and `getBySlug`).
5. Re-screenshot (playwright skill, delete after use per this session's convention) Home, About, Products/catalog (with backend still down, to confirm Phase 1's fix), Cart, Cart drawer, Product detail — visually confirm nothing regressed and the two colored-band CTA buttons now show a visible boundary in both idle and hover states.
6. Re-run the specific WCAG contrast checks from `01-evidence.md` for the two changed pairs (footer placeholder, field-input border) and confirm both now pass their threshold.
7. Update or close out the copy contradiction: read `size-guide.html` and `shipping-returns.html` side by side one more time to confirm they no longer disagree.
