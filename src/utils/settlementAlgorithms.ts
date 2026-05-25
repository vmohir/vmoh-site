import type {
  PersonTotal,
  Transfer,
  SettlementResult,
  SettlementAlgorithm,
  Currency,
} from "../splitApp/split.types.ts";

/**
 * Calculate settlement transfers using the specified algorithm
 */
export function calculateSettlement(
  personTotals: PersonTotal[],
  algorithm: SettlementAlgorithm,
  baseCurrency: Currency,
): SettlementResult {
  switch (algorithm) {
    case "minimize-transactions":
      return minimizeTransactionsSettlement(personTotals, baseCurrency);
    case "simple-pairwise":
      return simplePairwiseSettlement(personTotals, baseCurrency);
    default:
      return {
        transfers: [],
        totalTransactions: 0,
        isBalanced: true,
      };
  }
}

/**
 * Simple pairwise settlement: Each debtor pays each creditor directly
 * Pros: Easy to understand, direct relationships
 * Cons: May result in many transactions
 */
function simplePairwiseSettlement(
  personTotals: PersonTotal[],
  baseCurrency: Currency,
): SettlementResult {
  const transfers: Transfer[] = [];

  // Separate into debtors (balance > 0) and creditors (balance < 0)
  const debtors = personTotals
    .filter((p) => p.balance > 0.01) // Small epsilon for floating point
    .map((p) => ({ ...p, remaining: p.balance }));

  const creditors = personTotals
    .filter((p) => p.balance < -0.01)
    .map((p) => ({ ...p, remaining: -p.balance })); // Make positive for easier math

  // Each debtor pays each creditor proportionally
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (debtor.remaining < 0.01 || creditor.remaining < 0.01) continue;

      const amount = Math.min(debtor.remaining, creditor.remaining);

      transfers.push({
        fromPersonId: debtor.personId,
        fromPersonName: debtor.personName,
        toPersonId: creditor.personId,
        toPersonName: creditor.personName,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimals
        currency: baseCurrency,
      });

      debtor.remaining -= amount;
      creditor.remaining -= amount;
    }
  }

  const isBalanced = checkBalance(personTotals, transfers);

  return {
    transfers,
    totalTransactions: transfers.length,
    isBalanced,
  };
}

/**
 * Minimize transactions using greedy algorithm
 * Pros: Fewer transactions, optimal for large groups
 * Cons: Less intuitive relationships
 *
 * Algorithm:
 * 1. Find person who owes the most (max debtor)
 * 2. Find person who is owed the most (max creditor)
 * 3. Transfer min(debt, credit) from debtor to creditor
 * 4. Repeat until all balanced
 */
function minimizeTransactionsSettlement(
  personTotals: PersonTotal[],
  baseCurrency: Currency,
): SettlementResult {
  const transfers: Transfer[] = [];

  // Create mutable balance array
  const balances = personTotals.map((p) => ({
    personId: p.personId,
    personName: p.personName,
    balance: p.balance,
  }));

  while (true) {
    // Find max debtor (positive balance)
    const maxDebtor = balances.reduce(
      (max, p) => (p.balance > max.balance ? p : max),
      { personId: "", personName: "", balance: 0 },
    );

    // Find max creditor (negative balance)
    const maxCreditor = balances.reduce(
      (max, p) => (p.balance < max.balance ? p : max),
      { personId: "", personName: "", balance: 0 },
    );

    // Stop if no significant debts remain
    if (maxDebtor.balance < 0.01 || maxCreditor.balance > -0.01) {
      break;
    }

    // Calculate transfer amount
    const amount = Math.min(maxDebtor.balance, -maxCreditor.balance);

    transfers.push({
      fromPersonId: maxDebtor.personId,
      fromPersonName: maxDebtor.personName,
      toPersonId: maxCreditor.personId,
      toPersonName: maxCreditor.personName,
      amount: Math.round(amount * 100) / 100,
      currency: baseCurrency,
    });

    // Update balances
    maxDebtor.balance -= amount;
    maxCreditor.balance += amount;
  }

  const isBalanced = checkBalance(personTotals, transfers);

  return {
    transfers,
    totalTransactions: transfers.length,
    isBalanced,
  };
}

/**
 * Verify that the settlement is balanced (sanity check)
 */
function checkBalance(
  personTotals: PersonTotal[],
  transfers: Transfer[],
): boolean {
  const totalDebt = personTotals
    .filter((p) => p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);

  const totalCredit = personTotals
    .filter((p) => p.balance < 0)
    .reduce((sum, p) => sum + Math.abs(p.balance), 0);

  const totalTransferred = transfers.reduce((sum, t) => sum + t.amount, 0);

  // Allow small floating point differences
  const epsilon = 0.01;
  return (
    Math.abs(totalDebt - totalCredit) < epsilon &&
    Math.abs(totalDebt - totalTransferred) < epsilon
  );
}

/**
 * Get available settlement algorithms
 */
export function getAvailableAlgorithms(): Array<{
  id: SettlementAlgorithm;
  name: string;
  description: string;
}> {
  return [
    {
      id: "minimize-transactions",
      name: "Minimize Transactions",
      description: "Reduces the number of transfers needed",
    },
    {
      id: "simple-pairwise",
      name: "Simple Pairwise",
      description: "Direct settlement between each pair of people",
    },
  ];
}
