import type { CurrencyLedger } from "./split.types.ts";
import {
  calculatedLedgers,
  hasMultipleCurrencies,
  useExchangeRates,
} from "../state/billState";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import ExchangeRates from "./ExchangeRates.tsx";
import SettlementSettings from "./SettlementSettings.tsx";
import styles from "./ResultsSection.module.css";

function LedgerView({
  ledger,
  showCurrencyHeading,
}: {
  ledger: CurrencyLedger;
  showCurrencyHeading: boolean;
}) {
  const { currency, totals, settlement } = ledger;
  const symbol = getCurrencySymbol(currency);

  return (
    <div class={styles.ledger}>
      {showCurrencyHeading && <h3 class={styles.ledgerHeading}>{currency}</h3>}

      <div class={styles.personResults}>
        <h4>Per-Person Breakdown</h4>
        {totals.map((personTotal) => {
          const balanceState =
            personTotal.balance > 0.01
              ? "underpaid"
              : personTotal.balance < -0.01
                ? "overpaid"
                : "settled";
          const balanceText =
            balanceState === "underpaid"
              ? `Owes ${symbol}${personTotal.balance.toFixed(2)}`
              : balanceState === "overpaid"
                ? `Should receive ${symbol}${Math.abs(personTotal.balance).toFixed(2)}`
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
                  <span>
                    {symbol}
                    {personTotal.itemsSubtotal.toFixed(2)}
                  </span>
                </div>

                {personTotal.adjustments.map((adj) => (
                  <div
                    key={adj.id}
                    class={`${styles.breakdownRow} ${styles[`adjustment-${adj.type}`]}`}
                  >
                    <span>{adj.label}</span>
                    <span>
                      {adj.type === "discount" ? "-" : ""}
                      {symbol}
                      {Math.abs(adj.amount).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div class={styles.breakdownRow}>
                  <span>Total owed</span>
                  <span>
                    {symbol}
                    {personTotal.total.toFixed(2)}
                  </span>
                </div>

                <div class={styles.breakdownRow}>
                  <span>Total paid</span>
                  <span>
                    {symbol}
                    {personTotal.totalPaid.toFixed(2)}
                  </span>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <div class={styles.settlementSection}>
        <div class={styles.settlementHeader}>
          <h4>Payment Settlement</h4>
          {!showCurrencyHeading && <SettlementSettings />}
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
          </div>
        ) : settlement.isBalanced ? (
          <p class={styles.settledMessage}>
            All balanced! No transfers needed.
          </p>
        ) : null}

        {!settlement.isBalanced && (
          <div class={styles.warning}>
            Settlement isn't balanced — the recorded payments don't add up to
            the total owed. Check that every item has a payer and that the
            amounts paid match the item prices.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsSection() {
  const ledgers = calculatedLedgers.value;
  const hasPeople = ledgers.some((l) => l.totals.length > 0);

  if (!hasPeople) {
    return (
      <p class={styles.emptyMessage}>Add people and items to see results</p>
    );
  }

  const multipleLedgers = ledgers.length > 1;
  const showRateEditor = hasMultipleCurrencies.value && useExchangeRates.value;

  return (
    <div class={styles.resultsSection}>
      {showRateEditor && <ExchangeRates />}

      {/* With multiple per-currency ledgers the settlement method applies to
          all of them, so surface the method picker once at the top. */}
      {multipleLedgers && (
        <div class={styles.globalSettlementHeader}>
          <span class={styles.multiCurrencyNote}>
            Currencies are settled separately
          </span>
          <SettlementSettings />
        </div>
      )}

      {ledgers.map((ledger) => (
        <LedgerView
          key={ledger.currency}
          ledger={ledger}
          showCurrencyHeading={multipleLedgers}
        />
      ))}
    </div>
  );
}
