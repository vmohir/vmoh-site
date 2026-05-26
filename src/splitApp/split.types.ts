export type { Currency } from "../utils/currency.utils.ts";

export type AdjustmentType = "tip" | "tax" | "discount";

export interface Adjustment {
  id: string;
  label: string;
  value: number;
  isPercent: boolean;
  type: AdjustmentType;
}

export interface Person {
  id: string;
  name: string;
}

export interface ItemPayer {
  personId: string;
  amount: number;
  // Currency the payer paid in. Undefined means inherit from the item.
  currency?: Currency;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  // Undefined means "use the global base currency". A concrete currency
  // is only stored when the user explicitly picks one that differs from
  // the global default and multi-currency mode is on.
  currency?: Currency;
  usedBy: Set<string>; // person IDs - who consumes the item
  paidBy: Map<string, ItemPayer>; // personId -> ItemPayer - who paid for the item
}

export interface PersonTotal {
  personId: string;
  personName: string;
  itemsSubtotal: number;
  adjustments: Array<{
    id: string;
    label: string;
    type: AdjustmentType;
    amount: number;
  }>;
  total: number;
  totalPaid: number;
  balance: number;
  assignedItems: Array<{
    name: string;
    share: number;
    currency: Currency;
  }>;
  paidItems: Array<{
    name: string;
    amount: number;
    currency: Currency;
  }>;
}

export interface Transfer {
  fromPersonId: string;
  fromPersonName: string;
  toPersonId: string;
  toPersonName: string;
  amount: number;
  currency: Currency;
}

export interface SettlementResult {
  transfers: Transfer[];
  totalTransactions: number;
  isBalanced: boolean;
}

export type SettlementAlgorithm = "minimize-transactions" | "simple-pairwise";
