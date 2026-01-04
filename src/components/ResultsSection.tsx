import {
  calculatedTotals,
  calculatedSettlement,
  settlementAlgorithm,
  updateSettlementAlgorithm,
} from "../state/billState";
import { getAvailableAlgorithms } from "../utils/settlementAlgorithms";
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
        {totals.map((personTotal) => (
          <div key={personTotal.personId} class={styles.personResult}>
            <h4>{personTotal.personName}</h4>

            <div class={styles.breakdown}>
              {/* Consumed items */}
              {personTotal.assignedItems.length > 0 && (
                <div class={styles.breakdownSection}>
                  <strong>Consumed Items:</strong>
                  <ul>
                    {personTotal.assignedItems.map((item, index) => (
                      <li key={index}>
                        {item.name}: {item.share.toFixed(2)} {item.currency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Paid items */}
              {personTotal.paidItems.length > 0 && (
                <div class={styles.breakdownSection}>
                  <strong>Paid Items:</strong>
                  <ul>
                    {personTotal.paidItems.map((item, index) => (
                      <li key={index}>
                        {item.name}: {item.amount.toFixed(2)} {item.currency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div class={styles.breakdownRow}>
                <span>Subtotal (owed):</span>
                <span>${personTotal.itemsSubtotal.toFixed(2)}</span>
              </div>

              {personTotal.taxAmount > 0 && (
                <div class={styles.breakdownRow}>
                  <span>Tax:</span>
                  <span>${personTotal.taxAmount.toFixed(2)}</span>
                </div>
              )}

              {personTotal.tipAmount > 0 && (
                <div class={styles.breakdownRow}>
                  <span>Tip:</span>
                  <span>${personTotal.tipAmount.toFixed(2)}</span>
                </div>
              )}

              <div class={styles.breakdownRow}>
                <strong>Total Owed:</strong>
                <strong>${personTotal.total.toFixed(2)}</strong>
              </div>

              <div class={styles.breakdownRow}>
                <strong>Total Paid:</strong>
                <strong>${personTotal.totalPaid.toFixed(2)}</strong>
              </div>

              <div
                class={`${styles.breakdownRow} ${styles.balance} ${
                  personTotal.balance < 0
                    ? styles.overpaid
                    : personTotal.balance > 0
                      ? styles.underpaid
                      : styles.settled
                }`}
              >
                <strong>Balance:</strong>
                <strong>
                  {personTotal.balance > 0.01
                    ? `Owes $${personTotal.balance.toFixed(2)}`
                    : personTotal.balance < -0.01
                      ? `Should receive $${Math.abs(personTotal.balance).toFixed(2)}`
                      : "Settled"}
                </strong>
              </div>
            </div>
          </div>
        ))}
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
                  ${transfer.amount.toFixed(2)} {transfer.currency}
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
