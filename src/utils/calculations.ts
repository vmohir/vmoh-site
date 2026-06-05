import type {
  Person,
  Item,
  ItemPayer,
  PersonTotal,
  Currency,
  Adjustment,
} from "../splitApp/split.types.ts";

// Default exchange rates expressed as units of the currency per 1 USD. Used to
// seed the editable rate table and as a fallback. There is no live FX — these
// are only applied when the user explicitly enables exchange rates.
export const DEFAULT_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.52,
};

// Convert `amount` from one currency to another using a units-per-USD table.
export function convertWithRates(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number>,
): number {
  const fromRate = rates[from] ?? DEFAULT_RATES[from] ?? 1;
  const toRate = rates[to] ?? DEFAULT_RATES[to] ?? 1;
  return (amount / fromRate) * toRate;
}

// Resolve how much (in the item's own currency) each consumer owes for an item,
// according to its split mode. Shared by the calculations and the editor UI so
// the on-screen placeholders match what actually gets charged.
//
// All modes sum exactly to `price` except "amounts" when every consumer has a
// value and those don't add up — that genuine mismatch is surfaced as an
// unbalanced settlement.
export function resolveItemShares(item: Item): Map<string, number> {
  const ids = [...item.usedBy];
  const shares = new Map<string, number>();
  if (ids.length === 0) return shares;

  const { price, consumedBy, splitMode } = item;

  if (splitMode === "shares") {
    const weightOf = (id: string) => {
      const w = consumedBy.get(id);
      return w && w > 0 ? w : 1;
    };
    const totalWeight = ids.reduce((sum, id) => sum + weightOf(id), 0);
    ids.forEach((id) =>
      shares.set(
        id,
        totalWeight > 0 ? (price * weightOf(id)) / totalWeight : 0,
      ),
    );
    return shares;
  }

  // Amount modes. "Entered" = has an explicit value (0 is stored as absent).
  const entered = ids.filter((id) => consumedBy.has(id));
  const enteredTotal = entered.reduce(
    (sum, id) => sum + (consumedBy.get(id) ?? 0),
    0,
  );

  if (splitMode === "amounts-even") {
    const perHead = (price - enteredTotal) / ids.length;
    ids.forEach((id) => shares.set(id, (consumedBy.get(id) ?? 0) + perHead));
    return shares;
  }

  // "amounts": blanks share the remainder equally; if none are blank, each owes
  // exactly what was entered (which may not sum to price → unbalanced).
  const blanks = ids.filter((id) => !consumedBy.has(id));
  if (blanks.length > 0) {
    const perBlank = (price - enteredTotal) / blanks.length;
    ids.forEach((id) =>
      shares.set(id, consumedBy.has(id) ? (consumedBy.get(id) ?? 0) : perBlank),
    );
  } else {
    ids.forEach((id) => shares.set(id, consumedBy.get(id) ?? 0));
  }
  return shares;
}

// Effective currency of an item / payment. Undefined inherits the base.
const effItemCurrency = (item: Item, base: Currency): Currency =>
  item.currency ?? base;
const effPayerCurrency = (
  item: Item,
  payer: ItemPayer,
  base: Currency,
): Currency => payer.currency ?? item.currency ?? base;

// How amounts are folded into a single ledger.
type LedgerMode =
  // Convert every amount into the ledger currency via the rate table.
  | { kind: "convert"; rates: Record<Currency, number> }
  // Keep currencies apart: only amounts already in the ledger currency count.
  | { kind: "separate" };

interface PersonAccumulator {
  itemsSubtotal: number;
  totalPaid: number;
  assignedItems: PersonTotal["assignedItems"];
  paidItems: PersonTotal["paidItems"];
}

/**
 * Compute per-person totals for a single ledger (one currency).
 *
 * In "convert" mode every amount is converted into `ledgerCurrency`; in
 * "separate" mode only amounts whose effective currency already equals
 * `ledgerCurrency` are counted (nothing is exchanged).
 */
function buildLedgerTotals(
  people: Person[],
  items: Item[],
  adjustments: Adjustment[],
  ledgerCurrency: Currency,
  baseCurrency: Currency,
  mode: LedgerMode,
): PersonTotal[] {
  // Map an amount in `from` into the ledger currency, or null if it does not
  // belong to this ledger (separate mode, different currency).
  const toLedger = (amount: number, from: Currency): number | null => {
    if (mode.kind === "convert") {
      return convertWithRates(amount, from, ledgerCurrency, mode.rates);
    }
    return from === ledgerCurrency ? amount : null;
  };

  const personData = new Map<string, PersonAccumulator>();
  people.forEach((person) => {
    personData.set(person.id, {
      itemsSubtotal: 0,
      totalPaid: 0,
      assignedItems: [],
      paidItems: [],
    });
  });

  let billSubtotal = 0;

  items.forEach((item) => {
    const itemCurrency = effItemCurrency(item, baseCurrency);

    const ledgerPrice = toLedger(item.price, itemCurrency);
    if (ledgerPrice !== null) billSubtotal += ledgerPrice;

    // Consumption (usedBy), divided per the item's split mode.
    if (item.usedBy.size > 0) {
      const shares = resolveItemShares(item);
      item.usedBy.forEach((personId) => {
        const rawShare = shares.get(personId) ?? 0;
        const ledgerShare = toLedger(rawShare, itemCurrency);
        if (ledgerShare === null) return;
        const data = personData.get(personId);
        if (data) {
          data.itemsSubtotal += ledgerShare;
          data.assignedItems.push({
            name: item.name,
            share: rawShare,
            currency: itemCurrency,
          });
        }
      });
    }

    // Payments (paidBy)
    item.paidBy.forEach((payer, personId) => {
      const payerCurrency = effPayerCurrency(item, payer, baseCurrency);
      const ledgerPaid = toLedger(payer.amount, payerCurrency);
      if (ledgerPaid !== null) {
        const data = personData.get(personId);
        if (data) {
          data.totalPaid += ledgerPaid;
          data.paidItems.push({
            name: item.name,
            amount: payer.amount,
            currency: payerCurrency,
          });
        }
      }
    });
  });

  // Which adjustments apply to this ledger. When converting, all adjustments
  // land on the single base ledger. When keeping currencies separate,
  // percentage adjustments apply within each ledger (relative to its own
  // subtotal), while fixed-amount adjustments — which carry no currency — are
  // assumed to be in the base currency and only apply to the base ledger.
  const applicable = adjustments.filter((adj) =>
    mode.kind === "convert"
      ? true
      : adj.isPercent || ledgerCurrency === baseCurrency,
  );

  const adjustmentResults = applicable.map((adjustment) => {
    let totalAmount: number;
    if (adjustment.isPercent) {
      totalAmount = (billSubtotal * adjustment.value) / 100;
    } else if (mode.kind === "convert") {
      // Fixed amounts are entered in the base currency.
      totalAmount = convertWithRates(
        adjustment.value,
        baseCurrency,
        ledgerCurrency,
        mode.rates,
      );
    } else {
      totalAmount = adjustment.value;
    }

    if (adjustment.type === "discount") {
      totalAmount = Math.min(totalAmount, billSubtotal);
    }

    return { ...adjustment, totalAmount };
  });

  return people.map((person) => {
    const data = personData.get(person.id)!;

    const personRatio =
      billSubtotal > 0 ? data.itemsSubtotal / billSubtotal : 0;

    const personAdjustments = adjustmentResults.map((adjResult) => ({
      id: adjResult.id,
      label: adjResult.label,
      type: adjResult.type,
      amount: adjResult.totalAmount * personRatio,
    }));

    const adjustmentsTotal = personAdjustments.reduce(
      (sum, adj) =>
        adj.type === "discount" ? sum - adj.amount : sum + adj.amount,
      0,
    );

    const totalOwed = data.itemsSubtotal + adjustmentsTotal;

    // Credit each payer with the adjustments riding on the items they paid for,
    // proportional to the share of the subtotal they fronted, so balances net
    // to zero (mirrors the consumption-based distribution on the owed side).
    const paidRatio = billSubtotal > 0 ? data.totalPaid / billSubtotal : 0;
    const adjustmentsTotalForLedger = adjustmentResults.reduce(
      (sum, adj) =>
        adj.type === "discount" ? sum - adj.totalAmount : sum + adj.totalAmount,
      0,
    );
    const totalPaid = data.totalPaid + adjustmentsTotalForLedger * paidRatio;

    const balance = totalOwed - totalPaid;

    return {
      personId: person.id,
      personName: person.name,
      itemsSubtotal: data.itemsSubtotal,
      adjustments: personAdjustments,
      total: totalOwed,
      totalPaid,
      balance,
      assignedItems: data.assignedItems,
      paidItems: data.paidItems,
    };
  });
}

/**
 * Compute per-person totals grouped into one or more currency ledgers.
 *
 * - Single currency (or only one currency actually used): one base-currency
 *   ledger, no conversion.
 * - Multiple currencies with exchange disabled: one ledger per currency, each
 *   settled on its own — nothing is exchanged.
 * - Exchange enabled: everything converted into the base currency via `rates`,
 *   producing a single combined ledger.
 */
export function calculatePersonTotalsByCurrency(
  people: Person[],
  items: Item[],
  adjustments: Adjustment[],
  baseCurrency: Currency = "USD",
  useExchangeRates = false,
  rates: Record<Currency, number> = DEFAULT_RATES,
): Array<{ currency: Currency; totals: PersonTotal[] }> {
  // Distinct currencies that actually appear in the bill.
  const used = new Set<Currency>();
  items.forEach((item) => {
    if (item.usedBy.size > 0) used.add(effItemCurrency(item, baseCurrency));
    item.paidBy.forEach((payer) =>
      used.add(effPayerCurrency(item, payer, baseCurrency)),
    );
  });

  const isMultiCurrency = used.size > 1;

  if (useExchangeRates || !isMultiCurrency) {
    return [
      {
        currency: baseCurrency,
        totals: buildLedgerTotals(
          people,
          items,
          adjustments,
          baseCurrency,
          baseCurrency,
          { kind: "convert", rates },
        ),
      },
    ];
  }

  // Separate ledgers, base currency first then alphabetical for stable order.
  const ledgerCurrencies = [...used].sort((a, b) => {
    if (a === baseCurrency) return -1;
    if (b === baseCurrency) return 1;
    return a.localeCompare(b);
  });

  return ledgerCurrencies.map((currency) => ({
    currency,
    totals: buildLedgerTotals(
      people,
      items,
      adjustments,
      currency,
      baseCurrency,
      { kind: "separate" },
    ),
  }));
}

/**
 * Single-ledger convenience used where a flat per-person list is expected.
 * Converts everything into the base currency using the default rate table.
 */
export function calculatePersonTotals(
  people: Person[],
  items: Item[],
  adjustments: Adjustment[],
  baseCurrency: Currency = "USD",
): PersonTotal[] {
  return buildLedgerTotals(
    people,
    items,
    adjustments,
    baseCurrency,
    baseCurrency,
    { kind: "convert", rates: DEFAULT_RATES },
  );
}
