# Scorecard

1. Good design is innovative — Score: 1/3
   Evidence: Editorial fashion-DTC layout (hero + dual CTA, 3-up value props, accent CTA band, dark contrast band) plus a "pattern-cutting" decorative motif (notch-corner, measure-rail, "Pattern note A-01" labels) — 01-evidence.md Visual/Structural.
   Justification: The pattern-cutting motif is a nice thematic touch but doesn't advance the form or introduce a new interaction/technology pattern — it's a tasteful reskin of an extremely common DTC-fashion template.

2. Good design makes a product useful — Score: 1/3
   Evidence: Catalog's primary discovery path breaks silently on any API error — `ProductService.getAll()` has no `catchError` (unlike `getBySlug()`), so the category bar, product grid, and the coded "No products match" fallback all fail to render, confirmed live (blank screen, unhandled `HttpErrorResponse`) — 01-evidence.md Visual §States.
   Justification: A load-bearing step of the primary task (discover) can fail with zero user-facing feedback under a realistic condition (any backend hiccup), which is worse than "unnecessary detours" but not total non-support since the success path and other screens (search) degrade gracefully.

3. Good design is aesthetic — Score: 1/3
   Evidence: Spacing scale sprawls to 23 distinct values incl. near-duplicate `py-16/18/20`; type scale sprawls to 13 sizes incl. 2 bespoke sizes duplicating existing Tailwind steps; `text-white` bypasses the `accent-foreground` token 13x; the About CTA button's border/background measured at 1.00:1 contrast against its own section (shape indistinguishable from background) — 01-evidence.md Visual.
   Justification: Multiple independent inconsistency categories plus one measured jarring violation (invisible button boundary) — matches "3–5 inconsistencies or one jarring violation," not the tighter single-system bar of a 2 or 3.

4. Good design makes a product understandable — Score: 1/3
   Evidence: "Buy Now" doesn't do what it implies (adds to cart + routes to `/cart`, identical to "Add to Bag") — `product-detail.ts:120-127`; unlabeled card-payment fields (placeholder-only, no `<label>`/aria-label) in checkout/payment; "MAISON course studio / Ho Chi Minh City" internal framing in the customer-facing header — 01-evidence.md Copy & Honesty.
   Justification: 2–3 concrete controls/labels are unclear or mismatched with real behavior, matching the "2–3 controls unclear; jargon present" anchor.

5. Good design is unobtrusive — Score: 2/3
   Evidence: Generous whitespace, quiet header chrome, zero idle/autoplay animation (01-evidence.md Weight & Friction), but recurring decorative flourishes (notch-corner cut, measure-rail dashed divider, paper-texture background) add a branding layer beyond pure function — 01-evidence.md Visual/Structural.
   Justification: Chrome is quiet and content generally leads, but the decorative motifs are additive rather than purely functional, short of the "UI as ground" bar for a 3.

6. Good design is honest — Score: 1/3
   Evidence: `size-guide.html:27`'s absolute "always free" exchange promise directly contradicts `shipping-returns.html:4,11`'s explicit "policy configured by store operator" disclaimer; `about.html:6,21` claims a "complete admin workspace"/"end-to-end management" not present or verifiable in this repo; "Buy Now" mismatch (see #4) — 01-evidence.md Copy & Honesty.
   Justification: 2+ distinct inflation/contradiction issues found (no dark patterns), matching "2+ inflations" rather than the "≤1 minor inflation" bar for a 2.

7. Good design is long-lasting — Score: 2/3
   Evidence: Self-hosted variable fonts, muted neutral palette with one saturated accent, hairline borders, no gradients/skeuomorphism/glassmorphism found in `styles.css` — but the overall look (small-caps mono labels + hairline dividers + generous whitespace + single accent) is a widely-adopted, highly recognizable current-generation DTC-editorial-minimalist convention — 01-evidence.md Visual.
   Justification: No overtly dated trend markers, but close adherence to one very identifiable contemporary convention counts as one dated-marker risk, short of the "reads as current in 3 years with zero markers" bar for a 3.

8. Good design is thorough down to the last detail — Score: 1/3
   Evidence: Zero loading skeletons/spinners exist anywhere (grep for skeleton/spinner/animate-spin: zero hits; every loading state is plain `<p>Loading…</p>` text); catalog's error state is broken, not just rough (see #2); two conflicting disabled-opacity values coexist (`button.ts` 0.40 vs `styles.css:66` global 0.52) — 01-evidence.md Visual.
   Justification: Three distinct, verified thoroughness lapses (loading, error, disabled) across the app matches "2–3 states missing," not the single-lapse bar for a 2.

9. Good design is environmentally friendly — Score: 2/3
   Evidence: Initial JS 411KB raw / ~104.56KB transfer (under the 500KB anchor for a 2, over the <100KB anchor for a 3); zero idle animation; `prefers-reduced-motion` respected globally; but `:root { color-scheme: light }` is hardcoded with no `prefers-color-scheme: dark` block anywhere in `styles.css` — dark mode is not honored — 01-evidence.md Weight & Friction / Visual.
   Justification: Meets the "<500KB, motion gated" bar for a 2, but explicitly fails the "dark mode honored" clause required for a 3.

10. Good design is as little design as possible — Score: 1/3
    Evidence: Quantity stepper independently reimplemented 3x, wishlist-heart SVG copy-pasted 2–3x, close/X icon reimplemented 3x with different SVG paths each time — all with no shared component despite `app-button` proving the codebase already knows how to share components (37 reuses) — plus two near-identical CTAs ("Add to Bag" / "Buy Now") on the same screen — 01-evidence.md Structural.
    Justification: Four distinct categories of duplicated affordance that should be one component each matches "3–5 removable elements," not the "≤2" bar for a 2.

**Total: 14/30**
