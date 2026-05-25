import {
  calculatedTotals,
  calculatedSettlement,
  settlementAlgorithm,
  updateSettlementAlgorithm,
} from "../state/billState";
import { getAvailableAlgorithms } from "../utils/settlementAlgorithms";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import styles from "./ResultsSection.module.css";

export default function ResultsSection() {
  const totals = calculatedTotals.value;
  const settlement = calculatedSettlement.value;
  const algorithms = getAvailableAlgorithms();

  if (totals.length === 0) {
    return (
      <p class={styles.emptyMessage}>Add people and items to see results</p>
    );
  }

  return (
    <div class={styles.resultsSection}>
      <div class={styles.personResults}>
        <h3>Per-Person Breakdown</h3>
        {totals.map((personTotal) => {
          const balanceState =
            personTotal.balance > 0.01
              ? "underpaid"
              : personTotal.balance < -0.01
                ? "overpaid"
                : "settled";
          const balanceText =
            balanceState === "underpaid"
              ? `Owes $${personTotal.balance.toFixed(2)}`
              : balanceState === "overpaid"
                ? `Should receive $${Math.abs(personTotal.balance).toFixed(2)}`
                : "Settled";

          return (
            <details key={personTotal.personId} class={styles.personResult}>
              <summary class={styles.personSummary}>
                <span class={styles.personName}>{personTotal.personName}</span>
                <span
                  class={`${styles.summaryBalance} ${styles[balanceState]}`}
                >
                  {balanceText}
                </span>
              </summary>

              <div class={styles.breakdown}>
                {personTotal.assignedItems.length > 0 && (
                  <div class={styles.breakdownSection}>
                    <span class={styles.sectionLabel}>Consumed Items</span>
                    <ul>
                      {personTotal.assignedItems.map((item, index) => (
                        <li key={index}>
                          {item.name}: {getCurrencySymbol(item.currency)}
                          {item.share.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {personTotal.paidItems.length > 0 && (
                  <div class={styles.breakdownSection}>
                    <span class={styles.sectionLabel}>Paid Items</span>
                    <ul>
                      {personTotal.paidItems.map((item, index) => (
                        <li key={index}>
                          {item.name}: {getCurrencySymbol(item.currency)}
                          {item.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div class={styles.breakdownRow}>
                  <span>Subtotal (owed)</span>
                  <span>${personTotal.itemsSubtotal.toFixed(2)}</span>
                </div>

                {personTotal.adjustments.map((adj) => (
                  <div
                    key={adj.id}
                    class={`${styles.breakdownRow} ${styles[`adjustment-${adj.type}`]}`}
                  >
                    <span>{adj.label}</span>
                    <span>
                      {adj.type === "discount" ? "-" : ""}$
                      {Math.abs(adj.amount).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div class={styles.breakdownRow}>
                  <span>Total owed</span>
                  <span>${personTotal.total.toFixed(2)}</span>
                </div>

                <div class={styles.breakdownRow}>
                  <span>Total paid</span>
                  <span>${personTotal.totalPaid.toFixed(2)}</span>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* Settlement section */}
      <div class={styles.settlementSection}>
        <h3>Payment Settlement</h3>

        <div class={styles.algorithmSelector}>
          <label>
            <span>Settlement method:</span>
            <select
              value={settlementAlgorithm.value}
              onChange={(e) =>
                updateSettlementAlgorithm(
                  (e.target as HTMLSelectElement).value as any,
                )
              }
            >
              {algorithms.map((alg) => (
                <option key={alg.id} value={alg.id}>
                  {alg.name}
                </option>
              ))}
            </select>
          </label>
          <p class={styles.algorithmDescription}>
            {
              algorithms.find((a) => a.id === settlementAlgorithm.value)
                ?.description
            }
          </p>
        </div>

        {settlement.transfers.length > 0 ? (
          <div class={styles.transfers}>
            <p class={styles.transferCount}>
              {settlement.totalTransactions} transaction
              {settlement.totalTransactions !== 1 ? "s" : ""} needed
            </p>
            {settlement.transfers.map((transfer, index) => (
              <div key={index} class={styles.transferItem}>
                <span class={styles.from}>{transfer.fromPersonName}</span>
                <span class={styles.arrow}>→</span>
                <span class={styles.to}>{transfer.toPersonName}</span>
                <span class={styles.amount}>
                  {getCurrencySymbol(transfer.currency)}
                  {transfer.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {!settlement.isBalanced && (
              <div class={styles.warning}>
                Warning: Settlement may not be balanced. Please check
                calculations.
              </div>
            )}
          </div>
        ) : (
          <p class={styles.settledMessage}>
            All balanced! No transfers needed.
          </p>
        )}
      </div>
    </div>
  );
}
