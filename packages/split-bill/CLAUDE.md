# split-bill

Bill-splitting web app (PWA-in-progress) built with Astro + Preact. Lets users
add people, line-item receipts with multi-currency support, payers, and
tax/tip/discount adjustments, then computes per-person balances and minimal
settlement transfers.

## Stack

- **Astro 5** with the `@astrojs/preact` integration. Pages live in
  `src/pages/`, interactive islands are Preact components mounted with
  `client:load`.
- **Preact + @preact/signals** for state and reactivity. No React.
- **Tailwind v4** via `@tailwindcss/vite` plugin. Component-scoped styles use
  CSS Modules (`*.module.css`) alongside global styles in
  `src/styles/global.css`.
- **TypeScript strict** with `noUncheckedIndexedAccess`, JSX → `preact`,
  `baseUrl: src` (so imports like `styles/global.css` resolve from `src/`).
- **pnpm** workspace, formatted with Prettier (`proseWrap: always`).
- Deployed to **Netlify** as a static build (`dist/`), plus one Netlify Function
  (`netlify/functions/share.ts`) for share-link storage.

## Commands

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Astro dev server at `localhost:4321` |
| `pnpm build`        | Production build to `dist/`          |
| `pnpm preview`      | Preview built site                   |
| `pnpm format:write` | Prettier write                       |
| `pnpm format:check` | Prettier check                       |
| `npx tsc --noEmit`  | Type-check (no `astro check` script) |

## Architecture

State is centralized in `src/state/billState.ts` as module-scoped
`@preact/signals` signals (`people`, `items`, `adjustments`, `baseCurrency`,
`settlementAlgorithm`, `hasMultipleCurrencies`, `hasMultiplePayers`,
`useExchangeRates`, `exchangeRates`). All mutations go through exported helpers
(`addPerson`, `addItem`, `toggleItemAssignment`, `setItemPayer`, etc.) —
components import those rather than mutating signals directly.

Persistence: an `effect()` in `billState.ts` serialises state to `localStorage`
under the key `split-bill-state` on every change. `Set` and `Map` fields on
`Item` are converted to arrays for storage and rehydrated on load — preserve
that serialisation contract if you add new non-JSON-safe fields.

Derived data uses `computed`:

- `calculatedLedgers` → `calculatePersonTotalsByCurrency()` in
  `src/utils/calculations.ts`, then `calculateSettlement()` per ledger in
  `src/utils/settlementAlgorithms.ts`.

A `CurrencyLedger` is one currency's per-person totals plus its settlement. By
default currencies are **not exchanged**: a bill using more than one currency
produces one ledger per currency, each settled independently. When the
`useExchangeRates` toggle is on, every amount is converted into `baseCurrency`
via the editable `exchangeRates` table (units per USD, seeded from
`DEFAULT_RATES`) and a single combined ledger is produced. There is no live FX.
Discounts are capped to `billSubtotal`; adjustments are distributed pro rata by
each person's consumption ratio, and each payer is credited with the adjustment
share riding on what they paid so balances net to zero.

### Sharing (`src/utils/share.ts`, `netlify/functions/share.ts`)

The share button (`AppHeader.tsx`) first tries a **remote** share: POSTs the
serialized bill to `/api/share`, a Netlify Function that stores it in Upstash
Redis (`share:<id>`, 30-day TTL) and returns a short id, producing a link like
`.../#s=<id>`. On load, `billState.ts` fetches that id back from the function.
If the function is unreachable or `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` aren't configured (e.g. plain `astro dev`, which
doesn't run Netlify Functions), it falls back to the original **inline** link —
the whole payload gzipped + base64url-encoded directly into the hash
(`.../#data=<encoded>`), which never expires but is long. Both link formats are
recognised by `readHashShare()`/`clearHashShare()`. A link that fails to resolve
(expired or unknown id) surfaces as a `ShareNotFoundError` which `billState.ts`
shows to the user via `window.alert`.

Once a bill has been shared remotely at least once, its share id is persisted
to `localStorage` (`split-bill-share-id`, exposed as the `shareId` signal) and
every further edit is auto-synced back to that same id — an `effect()` in
`billState.ts` debounces changes by `SYNC_THROTTLE_MS` (8s) and `POST`s to
`/api/share?id=<id>`, which the function upserts in place instead of minting a
new id. A `pagehide` listener does a best-effort immediate flush (`keepalive`
fetch) so the last few seconds of edits aren't lost on tab close. Opening a
remote share link also adopts its id as the local `shareId`, so the opener's
own subsequent edits sync back to the same link too — this makes a share link
a live, two-way-editable bill rather than a one-time snapshot. There's no pull
side yet (no polling/websocket to see others' changes without reloading); that
remains a future improvement.

### Domain model (`src/splitApp/split.types.ts`)

- `Person { id, name }`
- `Item { id, name, price, currency, usedBy: Set<personId>, paidBy: Map<personId, ItemPayer>, consumedBy: Map<personId, number> }`
  — `usedBy` is who consumes the item, `paidBy` is who actually paid.
  `consumedBy` holds optional exact per-consumer amounts: empty → split `price`
  equally across `usedBy`; non-empty → use those exact amounts (which should sum
  to `price`). All three (`Set`/`Map`s) are serialised as arrays. Items also
  carry `splitMode` and their own `adjustments` (per-item tip/tax/discount,
  split across consumers pro rata and credited to the item's payer).
- `Adjustment { id, label, value, isPercent, type: "tip" | "tax" | "discount" }`
- `PersonTotal` is the per-person rollup; `Transfer` + `SettlementResult` are
  settlement output.

### Folder layout

```
netlify/functions/share.ts       # share-link store/fetch backend (Upstash Redis)
src/
├── pages/index.astro            # entry, renders Layout > SplitBillApp
├── layouts/Layout.astro
├── splitApp/                    # top-level app shell + sections
│   ├── SplitBillApp.astro       # the canonical shell (with client:load islands)
│   ├── SplitBillApp.tsx         # alt Preact-only shell (currently unused by index)
│   ├── AdjustmentsSection.tsx / AdjustmentCard.tsx
│   ├── ResultsSection.tsx
│   └── split.types.ts
├── people/                      # PeopleSection, PersonItem, PersonItemAdder
├── receiptItems/                # ItemsSection, ItemCard, ItemAssignments, ItemPayers
├── domains/
│   ├── currencies/              # CurrencySelector + currency list
│   └── receiptItems/AddItemForm
├── state/billState.ts           # signals + mutations + persistence
├── utils/                       # calculations, settlement, currency, person
├── ui/                          # EditableText, PersonAvatar
└── styles/global.css
```

Note the duplication: `splitApp/SplitBillApp.astro` is the one wired into
`pages/index.astro`; the `.tsx` sibling is a Preact-only variant. If you change
one, decide whether the other still has a reason to exist.

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`. Keep CSS Modules for
  component styles; use Tailwind utility classes for one-offs.
- Import paths use the `src/` baseUrl alias (`import 'styles/global.css'`) for
  top-level dirs, and relative paths within a feature folder.
- IDs are generated with `crypto.randomUUID()`.
- Signals are imported and read via `.value` in components; never destructure
  them.
- Prettier wraps prose at default width — keep markdown comfortable to read.

## Roadmap

`TODO.md` tracks open ideas: quick-entry natural-language parsing, adjustment
limits, localised currency, people-grouping (couples sharing expenses),
restricting who can owe whom, offline PWA, live currency exchange, and
peer-to-peer share/sync (URL- and backend-based share links are both done — see
Sharing above).

## Open observations

- `convertWithRates` in `calculations.ts` uses the user-editable `exchangeRates`
  table (seeded from `DEFAULT_RATES`), and only when `useExchangeRates` is on —
  there is still no live FX.
- No test suite yet.
- `SplitBillApp.tsx` and `.astro` both exist; clarify intent before adding to
  either.
