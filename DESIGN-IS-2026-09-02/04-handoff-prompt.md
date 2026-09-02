```
/make-plan Redesign the MAISON guest storefront's design system and its weakest user-facing flows (guest-fe-angular). Current design failed audit at 14/30 with critical gaps in principles #2 (useful), #4 (understandable), and #6 (honest).

Verdict paragraph (quoted from 03-verdict.md):
> Total score 14/30 (below the 20-point REFINE threshold), driven by cross-cutting, verified gaps in the load-bearing principles #2 (useful — the catalog's discovery path fails silently on any API error), #4 (understandable — a mislabeled primary CTA and unlabeled payment fields), and #6 (honest — two pages make directly contradictory claims about the return policy) — not by one ugly screen or a large-codebase sunk-cost read. The visual skin itself is competent and the brand voice is coherent (restrained palette, self-hosted variable type, a genuine pattern-cutting motif tying decoration to concept, zero dark patterns, zero idle animation, no autoplay/cookie-banner/toast clutter). That's real strength worth carrying forward. But the design system underneath it is inconsistent (23-value spacing scale, 13-value type scale, a bypassed color token, three separately-hand-rolled versions of the same close-icon/quantity-stepper/wishlist-heart affordance instead of shared components) and several user-facing decisions don't hold up under Rams' bar for honesty and thoroughness.

Why redesign and not refine: Total (14/30) is below the 20-point threshold and three load-bearing principles (#2 useful, #4 understandable, #6 honest) each scored 1/3 with verified, cross-cutting evidence — not isolated to one screen.

Preserve from current design:
- Color tokens in `src/styles.css:6-17` (`@theme` block) — the palette itself (background/foreground/accent/muted) is not the problem, its inconsistent application is.
- Self-hosted variable type: Archivo Variable (display/sans) + IBM Plex Mono (small-caps labels) — already imported in `src/styles.css:1-2`.
- The `app-button` component (`src/app/components/button/button.ts`) as the reuse pattern to extend, not replace — it's the one place the codebase already does component consolidation right (37 reuses app-wide).
- The "pattern-cutting" decorative motif concept (notch-corner cut, measure-rail dashed divider, "Pattern note A–01" labels) as the brand's thematic identity layer — keep the concept, but audit each instance against #5 unobtrusive before reuse.
- The honesty baseline already in place: zero dark patterns found (no forced continuity, hidden fees, fake scarcity, confirmshaming, or pre-checked opt-ins) — do not introduce any while redesigning.

Discard (structural patterns causing the failures):
- Untamed spacing/type scales. Evidence: 23 distinct spacing values including near-duplicate `py-16/18/20`, and 13 distinct type sizes including 2 bespoke sizes duplicating existing Tailwind steps (`src/app` grep, see 01-evidence.md Visual). Caused failure on principle #3 and #10.
- Copy-pasted, non-shared implementations of repeated affordances: quantity stepper (3x independently reimplemented — `product-detail.html:70-86`, `cart.html:26-28`, `cart-drawer.html:64-79`), wishlist-heart toggle (SVG copy-pasted 2-3x — `product-card.html:19-21`, `product-detail.html:93-115`, `header.html:24`), close/X icon (3x, each with a different SVG path — `cart-drawer.html:2-9`, `cart-drawer.html:22-31`, `header.html:12-14`). Caused failure on principle #10.
- `ProductService.getAll()` missing `catchError` (unlike the correctly-guarded `getBySlug()`), which lets an API failure throw unhandled and blank the entire catalog page — filter bar, product grid, and the coded empty-state fallback all fail to render. Caused failure on principle #2 and #8.
- Contradictory return-policy copy across `size-guide.html:27` ("always free either way") and `shipping-returns.html:4,11` ("must be configured by the store operator... not this demonstration copy"). Caused failure on principle #6.
- "Buy Now" CTA (`product-detail.html:118-120`) whose handler (`product-detail.ts:120-127`) is functionally identical to "Add to Bag" (adds to cart, routes to `/cart`, still requires a separate "Proceed to checkout" click) — the label promises a shortcut that doesn't exist. Caused failure on principle #4 and #6.
- Zero loading skeleton/spinner anywhere (every loading state is plain `<p>Loading…</p>` text) and two conflicting disabled-button opacity values (`button.ts` 0.40 vs global `styles.css:66` 0.52). Caused failure on principle #8.

Top 5 moves from the audit (verbatim):
1. #2 useful / #8 thorough — Add `catchError` to `ProductService.getAll()` (mirror the pattern in `getBySlug()`) so an API failure degrades to the existing "No products match these filters." empty state instead of throwing and blanking the catalog page. Evidence: 01-evidence.md Visual §States, live-confirmed blank screen + unhandled `HttpErrorResponse`.
2. #6 honest / #4 understandable — Reconcile the return-policy contradiction between `size-guide.html:27` and `shipping-returns.html:4,11`; pick one true statement. Fix "Buy Now" (`product-detail.html:118-120`) to either really skip to checkout or be relabeled to match its actual behavior.
3. #3 aesthetic / #10 as little design as possible — Collapse the spacing scale (23→a curated set, remove `py-16/18/20` near-duplication) and type scale (13→a curated set, remove the 2 bespoke sizes duplicating Tailwind steps); replace all 13 raw `text-white` usages with the `accent-foreground` token; extract the quantity stepper, wishlist-heart toggle, and close/X icon into shared components the way `app-button` already models.
4. #8 thorough — Add a real loading skeleton/spinner (currently zero exist anywhere) and reconcile the two disabled-opacity values (`button.ts` 0.40 vs `styles.css:66` 0.52) to one.
5. #3 aesthetic / accessibility floor — Fix footer placeholder-text contrast (4.22:1, fails AA), form-field border contrast (`--color-border-hover` at 2.6:1, below the 3:1 non-text threshold), and design an actual button variant for colored/dark bands — the About/Home CTA hover-invisibility bug was patched this session, but the idle-state button on `about.html`'s accent band still has no visible boundary since its border color still matches the section background.

Redesign principles in priority order:
1. #2 Useful — every data-fetch on the primary discover→cart→checkout path must have a real error state; no primary-task screen may render blank on failure.
2. #6 Honest — every user-facing claim (policy, feature, CTA label) must be checked against the other pages that reference the same fact and against what the button/link/handler actually does, before ship.
3. #10 As little design as possible — before adding a new affordance implementation, check whether the pattern already exists elsewhere in the app; if so, extract a shared component instead of copy-pasting markup/SVG.

Deliverables for the plan:
- New/curated design tokens: one spacing scale (document the exact allowed step list), one type scale (document the exact allowed size list), and confirmation every raw `text-white`/arbitrary color is replaced with a token.
- Three new shared components (quantity stepper, wishlist-heart toggle, icon-button/close) with a single call site each, replacing all the duplicated instances cited above.
- A fixed `ProductService.getAll()` with `catchError`, verified by manually forcing a backend failure and confirming the catalog shows its empty/error state instead of a blank screen.
- A copy pass reconciling every cross-page factual claim (starting with the return-policy contradiction) and every CTA label against its real handler behavior (starting with "Buy Now").
- States checklist (empty, loading, error, success, focus, disabled) applied uniformly across account/orders/order-detail/payment-return/verify-email, replacing plain-text loading with a real skeleton/spinner, and unifying the two disabled-opacity values into one.
- A button variant designed for use on colored/dark section backgrounds (About's accent band, Home's dark band), verified against both idle and hover states for contrast.
- Migration path: this is a design-system tightening + targeted-flow fix, not a visual rebrand — no user-facing migration/cutover is needed; ship incrementally per move above without a flag.
- Cutover criteria: each of the 5 moves above ships and is verified independently; no need to hold them behind a single big-bang release.

Anti-patterns to guard against (specific to REDESIGN):
- Porting the old spacing/type sprawl under new component names — the scales themselves must shrink, not just get wrapped.
- Keeping both "Add to Bag" and "Buy Now" as-is behind a flag indefinitely — resolve the mismatch, don't hide it.
- Redesigning the visual skin (palette, type choice, pattern-cutting motif) just to follow a trend — those scored fine; the failures are in consistency, honesty, and robustness, not the aesthetic direction itself.
- Treating the Preserve list as optional — the color tokens, type choices, `app-button` pattern, and dark-pattern-free baseline must survive this pass unchanged.
```
