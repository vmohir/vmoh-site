import {
  baseCurrency,
  calculatedLedgers,
  items,
  people,
} from "../state/billState";
import { resolveItemShares } from "../utils/calculations.ts";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import styles from "./BillReport.module.css";

export type ReportVariant = "summary" | "receipt" | "full";

const TITLES: Record<ReportVariant, string> = {
  summary: "Settlement summary",
  receipt: "Receipt",
  full: "Full report",
};

// Per-person balances: who owes / who's owed.
function Balances({ multi }: { multi: boolean }) {
  return (
    <>
      {calculatedLedgers.value.map((ledger) => {
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
                  <div class={styles.row} key={t.personId}>
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
          </div>
        );
      })}
    </>
  );
}

// Who pays whom.
function Settlement({ multi }: { multi: boolean }) {
  const ledgers = calculatedLedgers.value;
  const any = ledgers.some((l) => l.settlement.transfers.length > 0);
  if (!any) return <div class={styles.muted}>Everyone's settled up.</div>;
  return (
    <div class={styles.section}>
      <div class={styles.subhead}>Settle up</div>
      {ledgers.map((ledger) =>
        ledger.settlement.transfers.map((tr, i) => (
          <div class={styles.row} key={`${ledger.currency}-${i}`}>
            <span>
              {tr.fromPersonName} → {tr.toPersonName}
            </span>
            <span class={styles.strong}>
              {getCurrencySymbol(tr.currency)}
              {tr.amount.toFixed(2)}
            </span>
          </div>
        )),
      )}
    </div>
  );
}

// Items list; `detailed` adds per-consumer shares and adjustments.
function Items({ detailed }: { detailed: boolean }) {
  return (
    <div class={styles.section}>
      <div class={styles.subhead}>Items</div>
      {items.value.map((item) => {
        const cur = item.currency ?? baseCurrency.value;
        const symbol = getCurrencySymbol(cur);
        const consumers = people.value.filter((p) => item.usedBy.has(p.id));
        const shares = detailed ? resolveItemShares(item) : null;
        return (
          <div class={styles.item} key={item.id}>
            <div class={styles.row}>
              <span class={styles.name}>{item.name}</span>
              <span class={styles.strong}>
                {symbol}
                {item.price.toFixed(2)}
              </span>
            </div>
            {!detailed && consumers.length > 0 && (
              <div class={styles.itemSub}>
                {consumers.map((p) => p.name).join(", ")}
              </div>
            )}
            {detailed &&
              consumers.map((p) => (
                <div class={styles.detail} key={p.id}>
                  <span>{p.name}</span>
                  <span>
                    {symbol}
                    {(shares?.get(p.id) ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
            {detailed &&
              item.adjustments.map((a) => {
                const amt = a.isPercent
                  ? (item.price * a.value) / 100
                  : a.value;
                return (
                  <div class={`${styles.detail} ${styles.muted}`} key={a.id}>
                    <span>
                      {a.label}
                      {a.isPercent ? ` (${a.value}%)` : ""}
                    </span>
                    <span>
                      {a.type === "discount" ? "−" : "+"}
                      {symbol}
                      {amt.toFixed(2)}
                    </span>
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}

// Per-person owed vs paid (full report).
function Breakdown({ multi }: { multi: boolean }) {
  return (
    <>
      {calculatedLedgers.value.map((ledger) => {
        const symbol = getCurrencySymbol(ledger.currency);
        return (
          <div class={styles.section} key={ledger.currency}>
            <div class={styles.subhead}>
              Breakdown{multi ? ` · ${ledger.currency}` : ""}
            </div>
            {ledger.totals.map((t) => (
              <div class={styles.row} key={t.personId}>
                <span class={styles.name}>{t.personName}</span>
                <span class={styles.muted}>
                  owed {symbol}
                  {t.total.toFixed(2)} · paid {symbol}
                  {t.totalPaid.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

export function BillReport({ variant }: { variant: ReportVariant }) {
  const multi = calculatedLedgers.value.length > 1;
  const itemCount = items.value.length;
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div class={styles.report}>
      <div class={styles.header}>
        <span class={styles.title}>{TITLES[variant]}</span>
        <span class={styles.date}>{date}</span>
      </div>

      {variant === "summary" && (
        <>
          <Balances multi={multi} />
          <Settlement multi={multi} />
        </>
      )}

      {variant === "receipt" && (
        <>
          <Items detailed={false} />
          <Settlement multi={multi} />
        </>
      )}

      {variant === "full" && (
        <>
          <Items detailed />
          <Breakdown multi={multi} />
          <Settlement multi={multi} />
        </>
      )}

      <div class={styles.footer}>
        {itemCount} item{itemCount !== 1 ? "s" : ""} · splitted.netlify.app
      </div>
    </div>
  );
}
