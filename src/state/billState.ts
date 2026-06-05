import { signal, computed, effect } from "@preact/signals";
import type {
  Person,
  Item,
  Currency,
  SettlementAlgorithm,
  ItemPayer,
  Adjustment,
  AdjustmentType,
  CurrencyLedger,
} from "../splitApp/split.types.ts";
import {
  calculatePersonTotalsByCurrency,
  convertWithRates,
  DEFAULT_RATES,
} from "../utils/calculations";
import { getCurrencyFromLocale } from "../utils/currency.utils.ts";
import { calculateSettlement } from "../utils/settlementAlgorithms";
import {
  clearHashShare,
  decodeSharePayload,
  itemsFromSerialized,
  readHashShare,
  type SharePayload,
} from "../utils/share.ts";

const STORAGE_KEY = "split-bill-state";

// Serializable versions for localStorage
interface SerializedItem {
  id: string;
  name: string;
  price: number;
  currency?: Currency;
  usedBy: string[];
  paidBy: [string, ItemPayer][];
  consumedBy?: [string, number][];
}

interface SerializedState {
  people: Person[];
  items: SerializedItem[];
  adjustments: Adjustment[];
  baseCurrency: Currency;
  settlementAlgorithm: SettlementAlgorithm;
  hasMultipleCurrencies: boolean;
  hasMultiplePayers: boolean;
  // Whether to convert across currencies using the rate table below. When
  // false (default), currencies are kept in separate ledgers — no exchange.
  useExchangeRates: boolean;
  // Editable exchange rates, units per 1 USD (seeded from DEFAULT_RATES).
  exchangeRates: Record<Currency, number>;
  // Legacy: pre-split flag. Read on load and migrated to the two new flags.
  isAdvancedMode?: boolean;
}

function serializeItems(items: Item[]): SerializedItem[] {
  return items.map((item) => ({
    ...item,
    usedBy: Array.from(item.usedBy),
    paidBy: Array.from(item.paidBy.entries()),
    consumedBy: Array.from(item.consumedBy.entries()),
  }));
}

function deserializeItems(items: SerializedItem[]): Item[] {
  return items.map((item) => ({
    ...item,
    usedBy: new Set(item.usedBy),
    paidBy: new Map(item.paidBy),
    consumedBy: new Map(item.consumedBy ?? []),
  }));
}

// Strip every currency override — item-level and per-payer — so all amounts
// are interpreted in the base currency. Used whenever single-currency mode is
// in effect: an override left behind from a previous multi-currency session
// (e.g. a payment still tagged "USD" on a GBP bill) would otherwise be silently
// converted and throw the settlement out of balance. Item references are
// preserved when nothing changes to avoid needless re-renders.
function clearItemCurrencyOverrides(items: Item[]): Item[] {
  return items.map((item) => {
    let changed = item.currency !== undefined;
    const paidBy = new Map<string, ItemPayer>();
    item.paidBy.forEach((payer, id) => {
      if (payer.currency === undefined) {
        paidBy.set(id, payer);
      } else {
        changed = true;
        paidBy.set(id, { ...payer, currency: undefined });
      }
    });
    return changed ? { ...item, currency: undefined, paidBy } : item;
  });
}

function loadState(): Partial<SerializedState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
  }
  return null;
}

const savedState = loadState();
const legacyAdvanced = savedState?.isAdvancedMode === true;

// Primary state signals
export const people = signal<Person[]>(
  savedState?.people ?? [{ name: "You", id: crypto.randomUUID() }],
);
export const items = signal<Item[]>(
  savedState?.items ? deserializeItems(savedState.items) : [],
);
export const adjustments = signal<Adjustment[]>(
  savedState?.adjustments ?? [
    {
      id: crypto.randomUUID(),
      label: "Tax",
      value: 0,
      isPercent: true,
      type: "tax",
    },
    {
      id: crypto.randomUUID(),
      label: "Tip",
      value: 0,
      isPercent: true,
      type: "tip",
    },
  ],
);
export const baseCurrency = signal<Currency>(
  savedState?.baseCurrency ?? getCurrencyFromLocale(),
);
export const settlementAlgorithm = signal<SettlementAlgorithm>(
  savedState?.settlementAlgorithm ?? "minimize-transactions",
);
export const hasMultipleCurrencies = signal<boolean>(
  savedState?.hasMultipleCurrencies ?? legacyAdvanced,
);
export const hasMultiplePayers = signal<boolean>(
  savedState?.hasMultiplePayers ?? legacyAdvanced,
);
export const useExchangeRates = signal<boolean>(
  savedState?.useExchangeRates ?? false,
);
export const exchangeRates = signal<Record<Currency, number>>({
  ...DEFAULT_RATES,
  ...savedState?.exchangeRates,
});

// Heal bills saved before single-currency switches cleared per-payer currency
// overrides: in single-currency mode no override should survive on load.
if (!hasMultipleCurrencies.value) {
  items.value = clearItemCurrencyOverrides(items.value);
}

// Persist state to localStorage whenever it changes
effect(() => {
  const state: SerializedState = {
    people: people.value,
    items: serializeItems(items.value),
    adjustments: adjustments.value,
    baseCurrency: baseCurrency.value,
    settlementAlgorithm: settlementAlgorithm.value,
    hasMultipleCurrencies: hasMultipleCurrencies.value,
    hasMultiplePayers: hasMultiplePayers.value,
    useExchangeRates: useExchangeRates.value,
    exchangeRates: exchangeRates.value,
  };
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
});

// Per-currency ledgers: one (base currency) for single-currency or
// exchange-enabled bills, or one per currency when multiple currencies are in
// play and exchange is disabled. Each ledger is settled independently.
export const calculatedLedgers = computed<CurrencyLedger[]>(() => {
  const byCurrency = calculatePersonTotalsByCurrency(
    people.value,
    items.value,
    adjustments.value,
    baseCurrency.value,
    useExchangeRates.value,
    exchangeRates.value,
  );
  return byCurrency.map(({ currency, totals }) => ({
    currency,
    totals,
    settlement: calculateSettlement(
      totals,
      settlementAlgorithm.value,
      currency,
    ),
  }));
});

// Person operations
export function addPerson(name: string): void {
  if (!name.trim()) return;

  const newPerson: Person = {
    id: crypto.randomUUID(),
    name: name.trim(),
  };

  people.value = [...people.value, newPerson];
}

export function updatePersonName(id: string, newName: string): void {
  if (!newName.trim()) return;

  people.value = people.value.map((p) =>
    p.id === id ? { ...p, name: newName.trim() } : p,
  );
}

export function removePerson(id: string): void {
  // Remove person from all item assignments and payments
  items.value = items.value.map((item) => {
    const newAssignedTo = new Set(item.usedBy);
    newAssignedTo.delete(id);

    const newPaidBy = new Map(item.paidBy);
    newPaidBy.delete(id);

    const newConsumedBy = new Map(item.consumedBy);
    newConsumedBy.delete(id);

    return {
      ...item,
      usedBy: newAssignedTo,
      paidBy: newPaidBy,
      consumedBy: newConsumedBy,
    };
  });

  // Remove person from list
  people.value = people.value.filter((p) => p.id !== id);
}

// Item operations
export function addItem(
  name: string,
  price: number,
  currency: Currency | undefined = undefined,
  assignees: string[] = [],
  payers: string[] = [],
): void {
  if (!name.trim() || price < 0) return;

  const newItem: Item = {
    id: crypto.randomUUID(),
    name: name.trim(),
    price,
    currency,
    usedBy: new Set<string>(assignees),
    paidBy: distributePayment(price, payers),
    consumedBy: new Map<string, number>(),
  };

  items.value = [...items.value, newItem];
}

export function removeItem(id: string): void {
  items.value = items.value.filter((item) => item.id !== id);
}

// Re-insert a previously removed item at its original position (used to undo a
// swipe-to-delete). Out-of-range indices clamp to the ends.
export function insertItemAt(index: number, item: Item): void {
  const next = [...items.value];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, item);
  items.value = next;
}

export function updateItemName(id: string, newName: string): void {
  if (!newName.trim()) return;

  items.value = items.value.map((item) =>
    item.id === id ? { ...item, name: newName.trim() } : item,
  );
}

export function updateItemPrice(id: string, newPrice: number): void {
  if (newPrice < 0) return;

  items.value = items.value.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      price: newPrice,
      paidBy: rescalePayments(item.paidBy, item.price, newPrice),
    };
  });
}

export function toggleItemAssignment(itemId: string, personId: string): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;

    const newAssignedTo = new Set(item.usedBy);
    if (newAssignedTo.has(personId)) {
      newAssignedTo.delete(personId);
    } else {
      newAssignedTo.add(personId);
    }

    return { ...item, usedBy: newAssignedTo };
  });
}

export function setItemAssignees(itemId: string, personIds: string[]): void {
  const keep = new Set(personIds);
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    // Drop exact consumed amounts for anyone no longer a consumer.
    const consumedBy = new Map(
      [...item.consumedBy].filter(([id]) => keep.has(id)),
    );
    return { ...item, usedBy: keep, consumedBy };
  });
}

// Set (or clear, when <= 0) the exact amount a consumer is responsible for.
export function setItemConsumedAmount(
  itemId: string,
  personId: string,
  amount: number,
): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    const consumedBy = new Map(item.consumedBy);
    if (amount > 0) consumedBy.set(personId, amount);
    else consumedBy.delete(personId);
    return { ...item, consumedBy };
  });
}

// Set the list of payers for an item; the item price is split equally across them.
// Pass [] to clear all payers.
export function setItemPayers(itemId: string, personIds: string[]): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      paidBy: distributePayment(item.price, personIds),
    };
  });
}

function distributePayment(
  price: number,
  personIds: string[],
): Map<string, ItemPayer> {
  if (personIds.length === 0) return new Map();
  const amount = price / personIds.length;
  return new Map(personIds.map((id) => [id, { personId: id, amount }]));
}

// Scale existing per-person payment amounts proportionally when the item price changes.
function rescalePayments(
  paidBy: Map<string, ItemPayer>,
  oldPrice: number,
  newPrice: number,
): Map<string, ItemPayer> {
  if (paidBy.size === 0) return paidBy;
  if (oldPrice === 0) {
    // No prior amounts to scale from — split the new price equally.
    const ids = [...paidBy.keys()];
    return distributePayment(newPrice, ids);
  }
  const ratio = newPrice / oldPrice;
  return new Map(
    [...paidBy.entries()].map(([id, p]) => [
      id,
      { ...p, amount: p.amount * ratio },
    ]),
  );
}

// Adjustment operations
function getDefaultLabel(type: AdjustmentType): string {
  const defaults = {
    tip: "Tip",
    tax: "Tax",
    discount: "Discount",
  };
  return defaults[type];
}

export function addAdjustment(
  label: string,
  value: number,
  isPercent: boolean,
  type: AdjustmentType,
): void {
  const newAdjustment: Adjustment = {
    id: crypto.randomUUID(),
    label: label.trim() || getDefaultLabel(type),
    value: Math.max(0, value),
    isPercent,
    type,
  };

  adjustments.value = [...adjustments.value, newAdjustment];
}

export function updateAdjustment(
  id: string,
  updates: Partial<Omit<Adjustment, "id">>,
): void {
  adjustments.value = adjustments.value.map((adj) =>
    adj.id === id ? { ...adj, ...updates } : adj,
  );
}

export function removeAdjustment(id: string): void {
  adjustments.value = adjustments.value.filter((adj) => adj.id !== id);
}

export function duplicateAdjustment(id: string): void {
  const original = adjustments.value.find((adj) => adj.id === id);
  if (!original) return;

  const duplicate: Adjustment = {
    ...original,
    id: crypto.randomUUID(),
    label: `${original.label} (copy)`,
  };

  adjustments.value = [...adjustments.value, duplicate];
}

// Payment operations
export function setItemPayer(
  itemId: string,
  personId: string,
  amount: number,
  currency?: Currency,
): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;

    const newPaidBy = new Map(item.paidBy);

    if (amount <= 0) {
      // Remove payer if amount is 0 or negative
      newPaidBy.delete(personId);
    } else {
      // Add or update payer
      newPaidBy.set(personId, {
        personId,
        amount,
        currency,
      });
    }

    return { ...item, paidBy: newPaidBy };
  });
}

export function removeItemPayer(itemId: string, personId: string): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;

    const newPaidBy = new Map(item.paidBy);
    newPaidBy.delete(personId);

    return { ...item, paidBy: newPaidBy };
  });
}

// Currency operations. When the user picks a currency equal to the current
// base currency we store undefined so the item keeps tracking the base if it
// later changes.
export function updateItemCurrency(itemId: string, currency: Currency): void {
  const normalized = currency === baseCurrency.value ? undefined : currency;
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    return { ...item, currency: normalized };
  });
}

export function updateBaseCurrency(currency: Currency): void {
  baseCurrency.value = currency;
  // In single-currency mode every item already inherits the base currency
  // (item.currency is undefined). In multi-currency mode, normalise any item
  // or payer override whose currency now matches the new base so it tracks the
  // base again rather than being pinned to a now-redundant explicit currency.
  items.value = items.value.map((item) => {
    const itemCurrency = item.currency === currency ? undefined : item.currency;
    let payersChanged = false;
    const paidBy = new Map<string, ItemPayer>();
    item.paidBy.forEach((payer, id) => {
      if (payer.currency === currency) {
        payersChanged = true;
        paidBy.set(id, { ...payer, currency: undefined });
      } else {
        paidBy.set(id, payer);
      }
    });
    if (itemCurrency === item.currency && !payersChanged) return item;
    return { ...item, currency: itemCurrency, paidBy };
  });
}

// Settlement operations
export function updateSettlementAlgorithm(
  algorithm: SettlementAlgorithm,
): void {
  settlementAlgorithm.value = algorithm;
}

// Feature toggles
export function setHasMultipleCurrencies(value: boolean): void {
  if (!value) {
    // Drop any item- or payer-level currency overrides so every amount tracks
    // the base currency.
    items.value = clearItemCurrencyOverrides(items.value);
  }
  hasMultipleCurrencies.value = value;
}

export function toggleHasMultipleCurrencies(): void {
  setHasMultipleCurrencies(!hasMultipleCurrencies.value);
}

export function setHasMultiplePayers(value: boolean): void {
  hasMultiplePayers.value = value;
}

export function toggleHasMultiplePayers(): void {
  setHasMultiplePayers(!hasMultiplePayers.value);
}

// Exchange rates. Disabled by default — currencies stay in separate ledgers.
export function setUseExchangeRates(value: boolean): void {
  useExchangeRates.value = value;
}

export function toggleUseExchangeRates(): void {
  setUseExchangeRates(!useExchangeRates.value);
}

// How many base-currency units one unit of `currency` is worth, per the
// current rate table. Used to display/seed the editable rates.
export function exchangeRateInBase(currency: Currency): number {
  return convertWithRates(1, currency, baseCurrency.value, exchangeRates.value);
}

// Set the rate from an editor value expressed as "1 `currency` = N base".
export function setExchangeRateInBase(
  currency: Currency,
  valueInBase: number,
): void {
  if (!(valueInBase > 0)) return;
  const rates = exchangeRates.value;
  const baseRate =
    rates[baseCurrency.value] ?? DEFAULT_RATES[baseCurrency.value];
  // convertWithRates(1, currency, base) = (1 / rates[currency]) * baseRate
  // => rates[currency] = baseRate / valueInBase
  exchangeRates.value = { ...rates, [currency]: baseRate / valueInBase };
}

export function resetExchangeRates(): void {
  exchangeRates.value = { ...DEFAULT_RATES };
}

// Apply a shared payload to the current signals. Replaces people, items,
// adjustments, and the preferences embedded in the payload. Callers decide
// whether to confirm with the user first.
export function applySharedPayload(payload: SharePayload): void {
  people.value = payload.people;
  const loadedItems = itemsFromSerialized(payload.items);
  // Self-heal a single-currency bill that carries stale currency overrides.
  items.value = payload.hasMultipleCurrencies
    ? loadedItems
    : clearItemCurrencyOverrides(loadedItems);
  adjustments.value = payload.adjustments;
  baseCurrency.value = payload.baseCurrency;
  settlementAlgorithm.value = payload.settlementAlgorithm;
  hasMultipleCurrencies.value = payload.hasMultipleCurrencies;
  hasMultiplePayers.value = payload.hasMultiplePayers;
  useExchangeRates.value = payload.useExchangeRates ?? false;
  exchangeRates.value = { ...DEFAULT_RATES, ...payload.exchangeRates };
}

// On boot, if the URL carries a #data=... share fragment, decode it and
// apply. When the local bill already has meaningful state we confirm first
// so a shared link can't silently overwrite a draft.
function hasMeaningfulLocalState(): boolean {
  return (
    items.value.length > 0 ||
    people.value.length > 1 ||
    adjustments.value.some((a) => a.value > 0)
  );
}

async function importHashShareIfPresent(): Promise<void> {
  const encoded = readHashShare();
  if (!encoded) return;
  try {
    const payload = await decodeSharePayload(encoded);
    if (
      hasMeaningfulLocalState() &&
      !window.confirm(
        "Open this shared bill? It will replace your current people, items, and adjustments.",
      )
    ) {
      clearHashShare();
      return;
    }
    applySharedPayload(payload);
    clearHashShare();
  } catch (e) {
    console.error("Failed to import shared bill:", e);
  }
}

if (typeof window !== "undefined") {
  // Wait until after Preact has hydrated the SSR'd DOM before mutating
  // signals — otherwise the signal updates race with hydration and cause
  // DOM-node mismatch errors.
  const run = () => void importHashShareIfPresent();
  if (document.readyState === "complete") {
    queueMicrotask(run);
  } else {
    window.addEventListener("load", run, { once: true });
  }
}

// Wipe people / items / adjustments back to a fresh starting state. Keeps
// preferences (base currency, settlement algorithm, feature toggles).
export function resetAll(): void {
  people.value = [{ id: crypto.randomUUID(), name: "You" }];
  items.value = [];
  adjustments.value = [
    {
      id: crypto.randomUUID(),
      label: "Tax",
      value: 0,
      isPercent: true,
      type: "tax",
    },
    {
      id: crypto.randomUUID(),
      label: "Tip",
      value: 0,
      isPercent: true,
      type: "tip",
    },
  ];
}
