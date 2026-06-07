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

// A group bundles two or more people whose balances are netted together
// before settlement, so transfers within the group disappear and external
// transfers reference the group as one party (e.g. "Alice & Bob → Carol").
// Items still belong to individuals; only the settlement view collapses.
export interface Group {
  id: string;
  name: string;
  memberIds: string[];
}

export interface ItemPayer {
  personId: string;
  amount: number;
  // Currency the payer paid in. Undefined means inherit from the item.
  currency?: Currency;
}

// How an item's price is divided across its consumers (`usedBy`):
// - "amounts": exact amounts; people left blank share the remainder equally.
// - "amounts-even": exact amounts plus the leftover split equally across all.
// - "shares": per-person weights; price split proportionally (blank = 1).
export type SplitMode = "amounts" | "amounts-even" | "shares";

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
  // How the price is divided across `usedBy` (see SplitMode).
  splitMode: SplitMode;
  // Per-consumer value whose meaning depends on `splitMode`: an exact amount
  // for "amounts"/"amounts-even", or a weight for "shares". A missing entry
  // means "unspecified" (shares the remainder, or weight 1 for shares).
  consumedBy: Map<string, number>;
  // Per-item tip/tax/discount applied to this item's price, split across its
  // consumers in proportion to what they consumed.
  adjustments: Adjustment[];
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
  // Net of this person's share of per-item adjustments (signed).
  itemAdjustments: number;
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

// One self-contained ledger. In single-currency or exchange-enabled mode there
// is exactly one (in the base currency); with multiple currencies and exchange
// disabled there is one per currency, each settled independently.
export interface CurrencyLedger {
  currency: Currency;
  totals: PersonTotal[];
  settlement: SettlementResult;
}

export type SettlementAlgorithm = "minimize-transactions" | "simple-pairwise";
