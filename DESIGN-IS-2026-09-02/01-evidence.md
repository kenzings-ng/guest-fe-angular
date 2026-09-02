# Evidence

Consolidated from 5 parallel subagent reports (Structural, Visual, Copy & Honesty, Weight & Friction, Accessibility). Facts only; scoring happens in `02-scorecard.md`.

## Structural

- **Interactive elements** on discover→cart→checkout surface: 82 total (header 23, home 5, product-card 3, product-detail 10, cart 8, cart-drawer 9, checkout 11, payment 13).
- **Max component nesting depth: 4** — `App → ProductDetail → AccordionItem → SizeChart` (content-projected), `product-detail.html:133-134`.
- **Repeated patterns NOT shared via a component** (raw copy-paste instead of reuse):
  - "View product" link: 1 shared (`product-card.html:2`) + 4 raw inline duplicates (`cart.html:13,19`, `cart-drawer.html:47,55`).
  - Quantity stepper: 3 independent inline implementations, no shared component — `product-detail.html:70-86` (has aria-label), `cart.html:26-28` (**no aria-label**), `cart-drawer.html:64-79` (has aria-label). Method `setQuantity` duplicated in 3 component classes.
  - Wishlist heart toggle: same SVG path copy-pasted 2x (`product-card.html:19-21`, `product-detail.html:93-115`) + a 3rd non-toggle copy in `header.html:24` — no shared component.
  - Close/X affordance: 3 raw, non-shared SVG implementations with different paths (`cart-drawer.html:2-9`, `cart-drawer.html:22-31`, `header.html:12-14`).
  - Two distinct "add to cart" CTAs on the same product-detail page: "Add to Bag" (`product-detail.html:89-91`) and "Buy Now" (`product-detail.html:118-120`) — see Copy section for the Buy Now behavior mismatch.
  - `app-button` itself IS well-reused: 37 usages app-wide.
- **Dead props/imports** (verified via grep, no other reference found): `BrandMark.compact` input (`brand-mark.ts:12`, unreachable — neither of its 2 call sites binds it); unused `RouterLink` import in `home.ts:4,15` (all 5 `routerLink` occurrences in `home.html` are `app-button`'s own input property, not the directive on a raw `<a>`).

## Visual

- **Spacing scale**: 23 distinct px values in active use (0–128px), including near-duplicate section paddings `py-16`(64px)/`py-18`(72px)/`py-20`(80px) and half-steps (`mt-1.5`, `px-2.5`, `gap-0.5`). Sprawling, not curated.
- **Type scale**: 13 distinct px sizes (9,11,12,14,16,18,20,24,30,36,48,60,72), including 2 bespoke custom sizes (14px `.skip-link`, 18px `.maison-brand__word`) that duplicate existing Tailwind steps instead of reusing them.
- **Color tokens**: 12 defined in `styles.css:6-17`; 1 (`ring`) defined but never referenced anywhere in `src/app`. `text-white` (Tailwind built-in) used 13x where it resolves to the exact same hex as the `accent-foreground` token — a token-system bypass, not a raw/arbitrary color (no raw hex/arbitrary-value colors found at all — good).
- **Contrast — lowest ratios found**:
  - Footer placeholder text `placeholder:text-background/45` (`footer.html:31`): **4.22:1 — fails WCAG AA** (needs 4.5:1 for body text).
  - `.field-input` border (`--color-border-hover`, `styles.css:132`) against background: **2.6:1 — fails** the 3:1 non-text/UI-component threshold (WCAG 1.4.11).
  - Divider `--color-border` against background: 1.43:1 (decorative, not a hard requirement, but a real fact).
  - `about.html:26-29` CTA button (before the earlier fix pass): `border-accent`/`bg-accent` identical hex to the section's `bg-accent` background → **1.00:1**, i.e. the button's shape is not distinguishable from its surroundings by color. (Text-color fix already applied this session; the underlying "boundary invisible on a color-matching band" pattern is a design-system gap, not fully resolved — see verdict.)
  - `--color-accent-secondary` on background (hover-only text, `login.html:75`-style usage): 3.63:1 — fails body-text AA, passes large-text.
  - All other checked pairs (body/background 15.19:1, muted-fg/background 5.84:1, accent-foreground/accent button text 6.54:1, background/foreground dark-section text 15.19–15.77:1, footer text at /70 and /55 opacity) pass AA.
- **States present**:
  - Empty states: present and screenshot-confirmed for cart, wishlist, search (prompt state).
  - **Catalog error state is broken, not just untested**: `ProductService.getAll()` has no `catchError` (unlike `getBySlug()`, which does) — an API failure throws unhandled inside the `toSignal`-derived computeds, so the category filter bar, product grid, AND the coded "No products match these filters." fallback (`catalog.html:42-43`) all silently fail to render. Screenshot shows a blank area with zero user-facing message. Confirmed live via console `ERROR HttpErrorResponse`.
  - Form validation + server-error states: present and screenshot-confirmed on login (empty-field validation, and a server-error banner on submit against the down backend); register/contact use the identical pattern.
  - Disabled-while-submitting: coded correctly (`[disabled]="submitting()"`) but too fast to screenshot; confirmed via source.
  - Focus-visible: global 2px outline ring (`styles.css:69-72`), verified live on skip-link and header icons; `.field-input` instead uses a border+inset-shadow treatment — two different (but consistently applied per component type) focus treatments coexist.
  - **No loading skeleton/spinner exists anywhere in the codebase** — grep for `loading|skeleton|spinner|animate-spin` across `src/app` found zero animated/skeleton indicators; every "loading" state is a single plain-text `<p>Loading…</p>` line (account, orders, order-detail, payment-return, verify-email all use this pattern).
  - **Disabled opacity inconsistency**: `button.ts:8` sets `disabled:opacity-40` (Tailwind utility) while `styles.css:66` sets a global native `button:disabled { opacity: 0.52 }` — two different values coexist depending on which rule wins for a given disabled button.

## Copy & Honesty

- Full string inventory taken across all 25+ page/component templates (see subagent transcript for the complete per-file list — headings, CTAs, aria-labels, empty/error copy all captured).
- **Flagged inflations / contradictions**:
  - `about.html:6` "complete admin workspace" and `about.html:21` "End-to-end management" — claims about a system (admin app) not present or verifiable anywhere in this guest-storefront repo.
  - `contact.html:6` — same unverifiable admin-workspace reference, more mildly framed.
  - **Direct self-contradiction**: `size-guide.html:27` promises "sizing exchanges are always free either way" (absolute guarantee) while `shipping-returns.html:4,11` explicitly states "return windows must be configured by the store operator" and "the configured store policy—not this demonstration copy—determines eligibility." Two pages make opposite claims about the same policy.
  - `checkout.html:15` / `payment.html:4` — "never stored by our server" is a security claim not verifiable from the frontend template.
- **Dark patterns**: none found. No forced continuity, no hidden fees (cart shows "Shipping — Free" before checkout), no fake scarcity/urgency copy anywhere, no confirmshaming, no pre-checked opt-ins ("Keep me signed in" defaults false per `login.ts:28`).
- **Jargon / unclear labels**:
  - `header.html:4` "MAISON course studio / Ho Chi Minh City" — internal/thesis framing leaking into customer-facing chrome on every page.
  - Card-payment fields (`payment.html:20-21`, `checkout.html:16`, `order-detail.html:137-142`) are placeholder-only with no `<label>`/`aria-label`, unlike the correctly-labeled fields elsewhere (`contact.html:37-45`, `login.html:25-39`).
  - `cart.html:26,28` quantity +/− buttons have no `aria-label` (bare "−"/"+" glyphs), while the equivalent buttons in `cart-drawer.html:67,76` and `product-detail.html:73,82` do.
- **Label→behavior mismatch**: "Buy Now" (`product-detail.html:118-120`) implies a direct/expedited purchase, but `buyNow()` (`product-detail.ts:120-127`) does the same cart-add as "Add to Bag" then routes to `/cart` — the user still has to click "Proceed to checkout" afterward. Functionally identical to "Add to Bag" despite a label implying otherwise.

## Weight & Friction

- **Initial JS**: production build (`npm run build`) reports **411.25 kB raw / ~104.56 kB transfer** initial (main + one small eager chunk); 20+ lazy chunks not counted in initial.
- **Network requests**: 45 resource entries on dev-server home-page load (Vite unbundled ESM — not representative of production, which bundles to far fewer requests). Caveat: measured against a partially-failed page load (products fetch returned `ERR_CONNECTION_REFUSED`).
- **TTI**: dev-server only, `domInteractive` 168–298ms, `loadEventEnd` ~1.07–1.25s — explicitly caveated as non-representative of production/network conditions.
- **Idle/autoplay animation: zero found.** Every transition/animation in the codebase (button hover, cart-drawer open/close, image crossfade on hover, field-input focus, mobile-nav toggle) is user-triggered (hover/focus/click). No `@keyframes`, no carousel/autoplay/slider code anywhere. The two `setInterval` usages (email-verification resend cooldown, verify-email redirect countdown) both only run after a user-initiated action.
- **`prefers-reduced-motion`**: handled globally at `styles.css:200-207` — a universal selector forces all animation/transition durations to 0.01ms site-wide, not scoped to a subset.
- **Notifications/badges/modals on first paint** (guest, empty cart/wishlist): net **1** visible element — the cart count "0" text next to the cart icon (desktop only, hidden on mobile). Wishlist badge and email-verification banner are absent from the DOM entirely (not just hidden) when their conditions are false. Cart drawer exists in DOM but is inert/hidden by default. No cookie-consent modal, no newsletter popup, no toast system exists anywhere (grepped, zero hits).

## Accessibility

- **Contrast** (WCAG relative-luminance, computed): body/background 15.19:1, muted-fg/background 5.84:1, muted-fg/muted 5.13:1, accent/background 6.30:1, accent-foreground/accent 6.54:1, background/foreground (dark sections) 15.19–15.77:1, footer text at /70 and /55 opacity 8.11:1 and 5.55:1 — all pass AA. `accent-secondary`/background 3.63:1 fails body-text AA (passes large-text only). `border-hover` as a UI-component border against background: 2.60:1, fails the 3:1 non-text threshold.
- **Focus order**: skip-link confirmed as the literal first Tab stop; subsequent order through the header (Support → Track order → logo → Collection → New arrivals → Our studio → Search → Wishlist → Sign in → Cart) matches visual left-to-right order exactly, live-verified via Playwright keyboard Tab. Full-page order beyond the header could not be live-verified (tooling contention) but is expected from DOM order to continue Hero CTAs → product grid → footer → newsletter form, per static source. One noted structural risk (not live-confirmed): `home.html:1-19` uses CSS `order-2 lg:order-1`/`order-1 lg:order-2` to visually reorder the hero text/image — this changes visual order but not DOM/tab order, a potential visual-vs-keyboard-order mismatch at mobile widths.
- **Keyboard reachability**: every checked primary action (nav links, search/wishlist/account/cart icons, quantity steppers, remove-item, checkout CTA) is a real `<a href>`/`<button>`, confirmed keyboard-reachable and activatable. A repo-wide grep for `<div ...(click)="...">` (non-interactive elements with click handlers) returned **zero matches** anywhere in `src/app`. One reachability caveat: wishlist/account/sign-in icons carry `hidden ... sm:flex`, removing them from the tab order below the `sm` breakpoint (their functions move into the mobile hamburger menu instead, per earlier session's mobile-menu screenshot, which does list Wishlist and Sign in).
- **ARIA landmarks** (home page): banner=1, navigation=2 ("Customer support", "Primary navigation"; mobile nav landmark not in DOM when closed), main=1, contentinfo=1, dialog=1 (cart drawer, present but `aria-hidden`/`inert` when closed). No `search` or `form` landmark present anywhere on the home page.
- **Skip-link**: present at `app.html:15`, confirmed first focusable element live, confirmed to visually reveal on `:focus-visible` (`styles.css:96-104`) and to move focus into `<main id="main-content">` on activation.

## Known gaps (from all subagents, consolidated)

- Backend API (`:3000`) was not running for the entire audit (per scope) — every data-dependent "success" state (populated catalog/cart/wishlist/orders, populated account) was verified from source only, not rendered live.
- Production network-request count and TTI were not measured (dev-server Vite serving only); production would show materially fewer requests.
- No screen-reader testing was performed — only the Chromium accessibility-tree snapshot.
- Full-page keyboard tab order beyond the header (hero → product grid → footer) was not live-verified due to a contended shared browser session; reasoned from static DOM order instead.
- Mobile-viewport tab order and the `hidden sm:flex` icon removal were reasoned from source, not live-tested at a narrow viewport.
