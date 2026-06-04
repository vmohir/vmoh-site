import type {
  PersonTotal,
  Transfer,
  SettlementResult,
  SettlementAlgorithm,
  Currency,
} from "../splitApp/split.types.ts";

/**
 * A person's balance rounded to whole cents. Settlement runs entirely in
 * integer cents so transfers sum exactly and rounding never strands money.
 */
interface CentBalance {
  personId: string;
  personName: string;
  cents: number; // positive = owes (debtor), negative = is owed (creditor)
}

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
 * Round each person's balance to whole cents while preserving the total.
 *
 * Balances are floats that (for a well-formed bill) net to ~0, but rounding
 * each one independently can leave a few stray cents — e.g. a $100 item split
 * 7 ways gives shares of 14.2857 that each round up, so the debtors total a
 * few cents more than the single payer is owed. That residual gets stranded in
 * settlement and trips a false "not balanced" warning.
 *
 * Largest-remainder rounding fixes this: floor every value, then hand the
 * leftover cents to the entries with the largest fractional parts. The rounded
 * cents then sum to `round(Σ balances)` exactly — 0 for a balanced bill, or the
 * genuine imbalance otherwise.
 */
function toCentBalances(personTotals: PersonTotal[]): CentBalance[] {
  const scaled = personTotals.map((p) => {
    const exact = p.balance * 100;
    const floor = Math.floor(exact);
    return {
      personId: p.personId,
      personName: p.personName,
      floor,
      frac: exact - floor, // always in [0, 1)
    };
  });

  const sumFrac = scaled.reduce((sum, b) => sum + b.frac, 0);
  // Each value was floored down, so we add back `round(Σ frac)` whole cents to
  // recover the true rounded total.
  const bumps = Math.round(sumFrac);

  // Indices ordered by descending fractional part — these get the +1 cents.
  const order = scaled
    .map((_, i) => i)
    .sort((a, b) => scaled[b]!.frac - scaled[a]!.frac);

  const cents = scaled.map((b) => b.floor);
  for (let k = 0; k < bumps; k++) {
    cents[order[k]!]! += 1;
  }

  return scaled.map((b, i) => ({
    personId: b.personId,
    personName: b.personName,
    cents: cents[i]!,
  }));
}

function makeTransfer(
  debtor: CentBalance,
  creditor: CentBalance,
  amountCents: number,
  currency: Currency,
): Transfer {
  return {
    fromPersonId: debtor.personId,
    fromPersonName: debtor.personName,
    toPersonId: creditor.personId,
    toPersonName: creditor.personName,
    amount: amountCents / 100,
    currency,
  };
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
  const centBalances = toCentBalances(personTotals);
  const transfers: Transfer[] = [];

  // Separate into debtors (owe money) and creditors (are owed money).
  const debtors = centBalances
    .filter((p) => p.cents > 0)
    .map((p) => ({ ...p, remaining: p.cents }));

  const creditors = centBalances
    .filter((p) => p.cents < 0)
    .map((p) => ({ ...p, remaining: -p.cents })); // Make positive for easier math

  // Each debtor pays each creditor proportionally
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (debtor.remaining <= 0 || creditor.remaining <= 0) continue;

      const amountCents = Math.min(debtor.remaining, creditor.remaining);

      transfers.push(makeTransfer(debtor, creditor, amountCents, baseCurrency));

      debtor.remaining -= amountCents;
      creditor.remaining -= amountCents;
    }
  }

  return {
    transfers,
    totalTransactions: transfers.length,
    isBalanced: checkBalance(centBalances, transfers),
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
  const centBalances = toCentBalances(personTotals);
  const transfers: Transfer[] = [];

  // Mutable working copy operated on in integer cents.
  const balances = centBalances.map((p) => ({ ...p }));

  while (true) {
    // Find max debtor (positive balance)
    const maxDebtor = balances.reduce(
      (max, p) => (p.cents > max.cents ? p : max),
      { personId: "", personName: "", cents: 0 },
    );

    // Find max creditor (negative balance)
    const maxCreditor = balances.reduce(
      (max, p) => (p.cents < max.cents ? p : max),
      { personId: "", personName: "", cents: 0 },
    );

    // Stop once no debts (or no one left to receive) remain.
    if (maxDebtor.cents <= 0 || maxCreditor.cents >= 0) {
      break;
    }

    const amountCents = Math.min(maxDebtor.cents, -maxCreditor.cents);

    transfers.push(
      makeTransfer(maxDebtor, maxCreditor, amountCents, baseCurrency),
    );

    // Update balances
    maxDebtor.cents -= amountCents;
    maxCreditor.cents += amountCents;
  }

  return {
    transfers,
    totalTransactions: transfers.length,
    isBalanced: checkBalance(centBalances, transfers),
  };
}

/**
 * Verify that the settlement is balanced (sanity check).
 *
 * Operates in integer cents on the already-rounded balances, so this is an
 * exact comparison: it only reports "unbalanced" when the bill genuinely does
 * not reconcile (e.g. recorded payments don't add up to the item prices), not
 * because of sub-cent floating-point drift.
 */
function checkBalance(
  centBalances: CentBalance[],
  transfers: Transfer[],
): boolean {
  const totalDebt = centBalances
    .filter((p) => p.cents > 0)
    .reduce((sum, p) => sum + p.cents, 0);

  const totalCredit = centBalances
    .filter((p) => p.cents < 0)
    .reduce((sum, p) => sum - p.cents, 0);

  const totalTransferred = transfers.reduce(
    (sum, t) => sum + Math.round(t.amount * 100),
    0,
  );

  return totalDebt === totalCredit && totalDebt === totalTransferred;
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
      name: "Fewest transactions",
      description: "Fewer transfers overall",
    },
    {
      id: "simple-pairwise",
      name: "Direct pairs",
      description: "Each debtor pays each creditor",
    },
  ];
}
