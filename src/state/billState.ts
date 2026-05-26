import { signal, computed, effect } from "@preact/signals";
import type {
  Person,
  Item,
  PersonTotal,
  Currency,
  SettlementAlgorithm,
  ItemPayer,
  SettlementResult,
  Adjustment,
  AdjustmentType,
} from "../splitApp/split.types.ts";
import { calculatePersonTotals } from "../utils/calculations";
import { getCurrencyFromLocale } from "../utils/currency.utils.ts";
import { calculateSettlement } from "../utils/settlementAlgorithms";

const STORAGE_KEY = "split-bill-state";

// Serializable versions for localStorage
interface SerializedItem {
  id: string;
  name: string;
  price: number;
  currency?: Currency;
  usedBy: string[];
  paidBy: [string, ItemPayer][];
}

interface SerializedState {
  people: Person[];
  items: SerializedItem[];
  adjustments: Adjustment[];
  baseCurrency: Currency;
  settlementAlgorithm: SettlementAlgorithm;
  hasMultipleCurrencies: boolean;
  hasMultiplePayers: boolean;
  // Legacy: pre-split flag. Read on load and migrated to the two new flags.
  isAdvancedMode?: boolean;
}

function serializeItems(items: Item[]): SerializedItem[] {
  return items.map((item) => ({
    ...item,
    usedBy: Array.from(item.usedBy),
    paidBy: Array.from(item.paidBy.entries()),
  }));
}

function deserializeItems(items: SerializedItem[]): Item[] {
  return items.map((item) => ({
    ...item,
    usedBy: new Set(item.usedBy),
    paidBy: new Map(item.paidBy),
  }));
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
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
});

// Computed signal for calculated totals
export const calculatedTotals = computed<PersonTotal[]>(() => {
  return calculatePersonTotals(
    people.value,
    items.value,
    adjustments.value,
    baseCurrency.value,
  );
});

// Computed signal for settlement
export const calculatedSettlement = computed<SettlementResult>(() => {
  return calculateSettlement(
    calculatedTotals.value,
    settlementAlgorithm.value,
    baseCurrency.value,
  );
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

    return { ...item, usedBy: newAssignedTo, paidBy: newPaidBy };
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
  };

  items.value = [...items.value, newItem];
}

export function removeItem(id: string): void {
  items.value = items.value.filter((item) => item.id !== id);
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
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    return { ...item, usedBy: new Set(personIds) };
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
  // (item.currency is undefined). In multi-currency mode, normalise items
  // whose currency now matches the new base.
  items.value = items.value.map((item) =>
    item.currency === currency ? { ...item, currency: undefined } : item,
  );
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
    // Drop any per-item currency overrides so every item tracks the base.
    items.value = items.value.map((item) =>
      item.currency === undefined ? item : { ...item, currency: undefined },
    );
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
