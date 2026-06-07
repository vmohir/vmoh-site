import { calculatedLedgers, items } from "../state/billState";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import styles from "./BillReport.module.css";

// A clean, print-style summary used as the source for the exported image.
// Uses fixed light colours so the picture looks the same in any theme.
export function BillReport() {
  const ledgers = calculatedLedgers.value;
  const multi = ledgers.length > 1;
  const itemCount = items.value.length;
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div class={styles.report}>
      <div class={styles.header}>
        <span class={styles.title}>Split Bill</span>
        <span class={styles.date}>{date}</span>
      </div>

      {ledgers.map((ledger) => {
        const symbol = getCurrencySymbol(ledger.currency);
        return (
          <div class={styles.section} key={ledger.currency}>
            {multi && <div class={styles.currency}>{ledger.currency}</div>}

            <div class={styles.balances}>
              {ledger.totals.map((t) => {
                const owes = t.balance > 0.01;
                const gets = t.balance < -0.01;
                const cls = owes
                  ? styles.owe
                  : gets
                    ? styles.get
                    : styles.settled;
                return (
                  <div class={styles.balanceRow} key={t.personId}>
                    <span class={styles.name}>{t.personName}</span>
                    <span class={cls}>
                      {owes
                        ? `owes ${symbol}${t.balance.toFixed(2)}`
                        : gets
                          ? `gets ${symbol}${Math.abs(t.balance).toFixed(2)}`
                          : "settled"}
                    </span>
                  </div>
                );
              })}
            </div>

            {ledger.settlement.transfers.length > 0 && (
              <div class={styles.transfers}>
                <div class={styles.subhead}>Settle up</div>
                {ledger.settlement.transfers.map((tr, i) => (
                  <div class={styles.transferRow} key={i}>
                    <span>
                      {tr.fromPersonName} → {tr.toPersonName}
                    </span>
                    <span class={styles.transferAmt}>
                      {getCurrencySymbol(tr.currency)}
                      {tr.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div class={styles.footer}>
        {itemCount} item{itemCount !== 1 ? "s" : ""} · splitted.netlify.app
      </div>
    </div>
  );
}
