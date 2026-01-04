import { signal, computed } from "@preact/signals";
import type {
  Person,
  Item,
  PersonTotal,
  Currency,
  SettlementAlgorithm,
  ItemPayer,
  SettlementResult,
} from "../SplitApp/split.types.ts";
import { calculatePersonTotals } from "../utils/calculations";
import { calculateSettlement } from "../utils/settlementAlgorithms";

// Primary state signals
export const people = signal<Person[]>([
  { name: "You", id: crypto.randomUUID() },
]);
export const items = signal<Item[]>([]);
export const tax = signal<number>(0);
export const taxIsPercent = signal<boolean>(true);
export const tip = signal<number>(0);
export const tipIsPercent = signal<boolean>(true);
export const baseCurrency = signal<Currency>("USD");
export const settlementAlgorithm = signal<SettlementAlgorithm>(
  "minimize-transactions",
);

// Computed signal for calculated totals
export const calculatedTotals = computed<PersonTotal[]>(() => {
  return calculatePersonTotals(
    people.value,
    items.value,
    tax.value,
    taxIsPercent.value,
    tip.value,
    tipIsPercent.value,
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

// Tax/Tip operations
export function updateTax(value: number, isPercent: boolean): void {
  tax.value = Math.max(0, value);
  taxIsPercent.value = isPercent;
}

export function updateTip(value: number, isPercent: boolean): void {
  tip.value = Math.max(0, value);
  tipIsPercent.value = isPercent;
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
