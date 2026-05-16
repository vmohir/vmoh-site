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
  CSS Modules (`*.module.css`) alongside global styles in `src/styles/global.css`.
- **TypeScript strict** with `noUncheckedIndexedAccess`, JSX → `preact`,
  `baseUrl: src` (so imports like `styles/global.css` resolve from `src/`).
- **pnpm** workspace, formatted with Prettier (`proseWrap: always`).
- Deployed to **Netlify** as a static build (`dist/`).

## Commands

| Command            | What it does                          |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Astro dev server at `localhost:4321`  |
| `pnpm build`       | Production build to `dist/`           |
| `pnpm preview`     | Preview built site                    |
| `pnpm format:write`| Prettier write                        |
| `pnpm format:check`| Prettier check                        |
| `npx tsc --noEmit` | Type-check (no `astro check` script)  |

## Architecture

State is centralized in `src/state/billState.ts` as module-scoped
`@preact/signals` signals (`people`, `items`, `adjustments`, `baseCurrency`,
`settlementAlgorithm`, `hasMultipleCurrencies`). All mutations go through
exported helpers (`addPerson`, `addItem`, `toggleItemAssignment`,
`setItemPayer`, etc.) — components import those rather than mutating signals
directly.

Persistence: an `effect()` in `billState.ts` serialises state to
`localStorage` under the key `split-bill-state` on every change. `Set` and
`Map` fields on `Item` are converted to arrays for storage and rehydrated on
load — preserve that serialisation contract if you add new non-JSON-safe
fields.

Derived data uses `computed`:
- `calculatedTotals` → `calculatePersonTotals()` in `src/utils/calculations.ts`
- `calculatedSettlement` → `calculateSettlement()` in
  `src/utils/settlementAlgorithms.ts`

`calculatePersonTotals` converts each amount to `baseCurrency` via a
hardcoded rate table (`convertCurrency` in `calculations.ts`) — no live FX
yet. Discounts are capped to `billSubtotal`; adjustments are distributed pro
rata by each person's consumption ratio.

### Domain model (`src/splitApp/split.types.ts`)

- `Person { id, name }`
- `Item { id, name, price, currency, usedBy: Set<personId>, paidBy: Map<personId, ItemPayer> }`
  — `usedBy` is who consumes the item, `paidBy` is who actually paid.
- `Adjustment { id, label, value, isPercent, type: "tip" | "tax" | "discount" }`
- `PersonTotal` is the per-person rollup; `Transfer` + `SettlementResult` are
  settlement output.

### Folder layout

```
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
`pages/index.astro`; the `.tsx` sibling is a Preact-only variant. If you
change one, decide whether the other still has a reason to exist.

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`. Keep CSS Modules
  for component styles; use Tailwind utility classes for one-offs.
- Import paths use the `src/` baseUrl alias (`import 'styles/global.css'`)
  for top-level dirs, and relative paths within a feature folder.
- IDs are generated with `crypto.randomUUID()`.
- Signals are imported and read via `.value` in components; never destructure
  them.
- Prettier wraps prose at default width — keep markdown comfortable to read.

## Roadmap

`TODO.md` tracks open ideas: quick-entry natural-language parsing,
adjustment limits, localised currency, people-grouping (couples sharing
expenses), restricting who can owe whom, offline PWA, live currency
exchange, and URL- or peer-to-peer share/sync.

## Open observations

- `convertCurrency` in `calculations.ts` uses **hardcoded** USD rates — any
  multi-currency feature work needs to address this.
- No test suite yet.
- `SplitBillApp.tsx` and `.astro` both exist; clarify intent before adding
  to either.
