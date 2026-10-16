# Architecture decisions

## Layers

- `src/app/Pages.tsx`: route-level UI and user flows.
- `src/components`: reusable layout, NFT card and shadcn-style UI primitives.
- `src/lib/api.ts`: Axios client, authorization header and common transport errors.
- `src/lib/hooks.ts`: TanStack Query queries/mutations and cache invalidation.
- `src/lib/money.ts`: exact fixed-point ETH calculations using 8 decimal places and `BigInt`.
- `src/mocks/handlers.ts`: REST mock contracts and scenario responses. Components and query hooks do not contain mock response data.
- `src/mocks/socket.ts`: Socket.IO protocol mock using `@mswjs/socket.io-binding` and MSW WebSocket interception.
- `src/mocks/data.ts`: shared fixtures plus browser storage persistence.
- `src/lib/realtime.ts`: Socket.IO client lifecycle, session isolation and query reconciliation.

## Query/cache policy

- Catalog query keys include search, category, sort and page, so distinct URL states do not share results.
- NFT detail is keyed by stable NFT ID; cart, session, favorites, wallets and orders have separate query keys.
- Queries use a 15-second stale time, five-minute garbage collection, one retry and focus revalidation. Mutations are not retried automatically because a retry can duplicate writes.
- Favorites use an optimistic cache update and roll back to the previous value on failure.
- Successful cart/profile/wallet/order mutations invalidate the affected query keys. Socket events invalidate active catalog/detail/cart/quote/order queries, followed by REST reconciliation on connection.
- A session change clears the QueryClient cache and reconnects the socket with the new user ID. Socket listeners are removed before disconnecting.

## Session and data isolation

The mock API identifies the active fictional user from `sessionStorage`. Private data keys include the user ID: favorites, wallets, orders and authenticated carts. Guest cart contents are merged into the authenticated cart at login/registration and are then cleared from the guest key. Logout clears the session and the client query cache. This is test infrastructure only, not a secure authentication mechanism.

## Cart and checkout

- Cart quantities are integers and checked against the current fixture availability.
- ETH is represented as decimal strings at REST boundaries; all subtotals, discounts, fees and totals are calculated with fixed-point `BigInt` helpers, not floating-point addition.
- The checkout requests a quote, then sends its expected total when creating an order. A changed total or unavailable item returns a conflict, requiring a fresh quote and another explicit confirmation.
- `Idempotency-Key` is stored for the in-flight attempt in session storage. The mock keeps an idempotency record containing a request fingerprint and the immutable order snapshot. A matching retry recovers the same order; a different fingerprint with the same key conflicts.
- Confirmed orders remove only purchased quantities. Rejected or pending orders retain the cart. Receipt item and price fields are copied at creation time.

## Real-time event contract

`nft.updated` contains the stable NFT ID, version and updated resource; the client ignores versions older than the cached version and invalidates the catalog/detail/cart/quote queries. `order.updated` contains the stable order ID and version; the client invalidates the order query. Duplicate and old events do not roll the query cache back. On reconnect, active resources are reconciled from REST. The MSW Socket.IO binding handles only the two challenge-specific events and is documented as a constrained mock transport.

## Responsive UI and accessibility

The layout uses responsive CSS breakpoints and is intended to be checked at 390, 768 and 1440 pixels. Forms have labels and browser validation, async errors use `role="alert"`, operation messages use status regions, controls have accessible names, focus-visible outlines are preserved and reduced-motion preferences disable shimmer/transition motion. Skeleton blocks preserve the rough dimensions of loaded content.

## Deviations / follow-up work

- The Figma file should be used for a final visual pass: the current design establishes a coherent dark marketplace visual system and local generated artwork, but exact pixel parity has not been verified against the Figma frames in this environment.
- Password change is implemented through `PATCH /api/profile/password`, with current-password validation and minimum-length checks. Add a dedicated Playwright test for this flow.
- Playwright coverage is an executable starter suite for catalog/history, detail/cart, login/checkout success, invalid login and missing NFT. Expand it to cover all 12 required scenarios before presenting the challenge as fully verified.
- The Lighthouse configuration is provided, but scores/reports must be generated in a local or CI environment after dependency installation.
