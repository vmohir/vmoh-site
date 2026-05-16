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
import { calculateSettlement } from "../utils/settlementAlgorithms";

const STORAGE_KEY = "split-bill-state";

// Serializable versions for localStorage
interface SerializedItem {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  usedBy: string[];
  paidBy: [string, ItemPayer][];
}

interface SerializedState {
  people: Person[];
  items: SerializedItem[];
  adjustments: Adjustment[];
  baseCurrency: Currency;
  settlementAlgorithm: SettlementAlgorithm;
  isAdvancedMode: boolean;
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

// Primary state signals
export const people = signal<Person[]>(
  savedState?.people ?? [{ name: "You", id: crypto.randomUUID() }],
);
export const items = signal<Item[]>(
  savedState?.items ? deserializeItems(savedState.items) : [],
);
export const adjustments = signal<Adjustment[]>(
  savedState?.adjustments ?? [
    { id: crypto.randomUUID(), label: "Tax", value: 0, isPercent: true, type: "tax" },
    { id: crypto.randomUUID(), label: "Tip", value: 0, isPercent: true, type: "tip" },
  ],
);
export const baseCurrency = signal<Currency>(savedState?.baseCurrency ?? "USD");
export const settlementAlgorithm = signal<SettlementAlgorithm>(
  savedState?.settlementAlgorithm ?? "minimize-transactions",
);
export const isAdvancedMode = signal<boolean>(
  savedState?.isAdvancedMode ?? false,
);

// Persist state to localStorage whenever it changes
effect(() => {
  const state: SerializedState = {
    people: people.value,
    items: serializeItems(items.value),
    adjustments: adjustments.value,
    baseCurrency: baseCurrency.value,
    settlementAlgorithm: settlementAlgorithm.value,
    isAdvancedMode: isAdvancedMode.value,
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
  currency: Currency = baseCurrency.value,
  assignees: string[] = [],
): void {
  if (!name.trim() || price < 0) return;

  const usedBy = new Set<string>(assignees);
  const paidBy =
    usedBy.size === 1
      ? new Map<string, ItemPayer>([
          [assignees[0]!, { personId: assignees[0]!, amount: price, currency }],
        ])
      : new Map<string, ItemPayer>();

  const newItem: Item = {
    id: crypto.randomUUID(),
    name: name.trim(),
    price,
    currency,
    usedBy,
    paidBy,
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
    return { ...item, price: newPrice, paidBy: autoPaidBy(item, item.usedBy, newPrice) };
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

    return { ...item, usedBy: newAssignedTo, paidBy: autoPaidBy(item, newAssignedTo) };
  });
}

export function setItemAssignees(itemId: string, personIds: string[]): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    const newAssignedTo = new Set(personIds);
    return { ...item, usedBy: newAssignedTo, paidBy: autoPaidBy(item, newAssignedTo) };
  });
}

// When exactly one person is assigned, they automatically pay the full amount.
// When nobody is assigned, clear payments. Otherwise leave them alone (user picks in advanced mode).
function autoPaidBy(
  item: Item,
  usedBy: Set<string>,
  price = item.price,
): Map<string, ItemPayer> {
  if (usedBy.size === 1) {
    const only = usedBy.values().next().value!;
    return new Map([[only, { personId: only, amount: price, currency: item.currency }]]);
  }
  if (usedBy.size === 0) {
    return new Map();
  }
  return item.paidBy;
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
  updates: Partial<Omit<Adjustment, 'id'>>,
): void {
  adjustments.value = adjustments.value.map((adj) =>
    adj.id === id ? { ...adj, ...updates } : adj
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
        currency: currency || item.currency,
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

// Currency operations
export function updateItemCurrency(itemId: string, currency: Currency): void {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) return item;
    return { ...item, currency };
  });
}

export function updateBaseCurrency(currency: Currency): void {
  baseCurrency.value = currency;
}

// Settlement operations
export function updateSettlementAlgorithm(
  algorithm: SettlementAlgorithm,
): void {
  settlementAlgorithm.value = algorithm;
}

// Advanced mode
export function toggleAdvancedMode(): void {
  isAdvancedMode.value = !isAdvancedMode.value;
}
