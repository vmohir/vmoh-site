export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface Person {
  id: string;
  name: string;
}

export interface ItemPayer {
  personId: string;
  amount: number;
  currency: Currency;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  assignedTo: Set<string>; // person IDs - who consumes the item
  paidBy: Map<string, ItemPayer>; // personId -> ItemPayer - who paid for the item
}

export interface PersonTotal {
  personId: string;
  personName: string;
  itemsSubtotal: number;
  taxAmount: number;
  tipAmount: number;
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

export type SettlementAlgorithm = 'minimize-transactions' | 'simple-pairwise';
