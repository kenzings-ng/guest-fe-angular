# Scope

**Audited:** MAISON guest storefront (Angular 22) — repo `guest-fe-angular`, live dev build at http://localhost:4300 (backend API at :3000 not running, so all data-dependent views render in their empty/error states).

**Screens in scope:** Home (`/`), About (`/about`), Catalog (`/products`), Product Detail (`/products/:slug`), FAQ (`/faq`), Contact (`/contact`), Login (`/login`), Register (`/register`), Cart (`/cart`), Cart drawer (global), Wishlist (`/wishlist`), Search (`/search`), Shipping & Returns (`/shipping-returns`), Checkout (`/checkout`, `/checkout/payment`), Account (`/account`), Orders (`/orders`, order detail). Shared chrome: header (desktop nav + mobile menu + account menu), footer.

**Primary user:** a guest shopper browsing a unisex contemporary-clothing storefront — the primary task is discover → view product → add to cart → check out.

**Constraints:** Angular 22 + Tailwind v4 (`@theme` tokens in `src/styles.css`), self-hosted fonts (Archivo Variable + IBM Plex Mono), this is a university course project (per footer copy), brand name "MAISON".

**Reference materials:** none supplied by user — no competitor benchmark given. Prior session already found and fixed two contrast/visibility bugs (button text/border color matching its own section background on `bg-accent` and `bg-foreground` bands) — those are fixed and out of scope for this audit's findings, though the underlying design-system gap (no button variant designed for colored bands) is fair game for #8/#10.

**Verdict note:** a real, shipping design exists (not a stub) — Phases 1–3 apply in full.
