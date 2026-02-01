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

// Primary state signals
export const people = signal<Person[]>([
  { name: "You", id: crypto.randomUUID() },
]);
export const items = signal<Item[]>([]);
export const adjustments = signal<Adjustment[]>([
  { id: crypto.randomUUID(), label: "Tax", value: 0, isPercent: true, type: "tax" },
  { id: crypto.randomUUID(), label: "Tip", value: 0, isPercent: true, type: "tip" },
]);
export const baseCurrency = signal<Currency>("USD");
export const settlementAlgorithm = signal<SettlementAlgorithm>(
  "minimize-transactions",
);
export const hasMultipleCurrencies = signal<boolean>(false);

// Persist state to localStorage whenever it changes
effect(() => {
  const state: SerializedState = {
    people: people.value,
    items: serializeItems(items.value),
    tax: tax.value,
    taxIsPercent: taxIsPercent.value,
    tip: tip.value,
    tipIsPercent: tipIsPercent.value,
    baseCurrency: baseCurrency.value,
    settlementAlgorithm: settlementAlgorithm.value,
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
  currency: Currency = "USD",
): void {
  if (!name.trim() || price < 0) return;

  const newItem: Item = {
    id: crypto.randomUUID(),
    name: name.trim(),
    price,
    currency,
    usedBy: new Set<string>(),
    paidBy: new Map<string, ItemPayer>(),
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

  items.value = items.value.map((item) =>
    item.id === id ? { ...item, price: newPrice } : item,
  );
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
