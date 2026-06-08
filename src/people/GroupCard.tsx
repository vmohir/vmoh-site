import { Unlink } from "lucide-preact";
import type { ComponentChildren } from "preact";
import type { CurrencyLedger, Group } from "../splitApp/split.types.ts";
import { removeGroup, updateGroupName } from "../state/billState.ts";
import EditableText from "ui/EditableText";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import { dragState } from "./dnd.ts";
import styles from "./GroupCard.module.css";

interface GroupCardProps {
  group: Group;
  ledgers: CurrencyLedger[];
  children: ComponentChildren;
}

// Sum a group's per-member balance for each ledger so the card can preview
// the collapsed balance at a glance — same number the settlement section
// uses for transfers.
function groupBalances(
  group: Group,
  ledgers: CurrencyLedger[],
): Array<{ currency: string; balance: number; symbol: string }> {
  return ledgers
    .map((l) => {
      const balance = group.memberIds.reduce((sum, id) => {
        const total = l.totals.find((t) => t.personId === id);
        return total ? sum + total.balance : sum;
      }, 0);
      return {
        currency: l.currency,
        balance,
        symbol: getCurrencySymbol(l.currency),
      };
    })
    .filter((entry) => Math.abs(entry.balance) > 0.01);
}

export default function GroupCard({
  group,
  ledgers,
  children,
}: GroupCardProps) {
  const balances = groupBalances(group, ledgers);

  // Highlight when an active drag would land on this group as a whole (i.e.
  // the user is hovering an empty area of the card, not a specific member
  // row inside it — those are handled by PersonRow's own indicators).
  const ds = dragState.value;
  const isDropTarget =
    !!ds?.active &&
    ds.target?.kind === "group" &&
    ds.target.groupId === group.id;

  return (
    <div
      class={`${styles.card} ${isDropTarget ? styles.dropInto : ""}`}
      data-group-id={group.id}
    >
      <div class={styles.header}>
        <span class={styles.label} aria-hidden="true">
          Group
        </span>
        <EditableText
          className={styles.name}
          value={group.name}
          onSave={(v) => updateGroupName(group.id, v)}
        />

        <span class={styles.balance}>
          {balances.length === 0 ? (
            <span class={styles.settled}>Settled</span>
          ) : (
            balances.map((b) => {
              const cls =
                b.balance > 0
                  ? styles.owe
                  : b.balance < 0
                    ? styles.receive
                    : styles.settled;
              const text =
                b.balance > 0
                  ? `Owes ${b.symbol}${b.balance.toFixed(2)}`
                  : `Receives ${b.symbol}${Math.abs(b.balance).toFixed(2)}`;
              return (
                <span class={cls} key={b.currency}>
                  {text}
                </span>
              );
            })
          )}
        </span>

        <div class={styles.actions}>
          <button
            type="button"
            class={styles.actionBtn}
            aria-label="Dissolve group"
            title="Dissolve group"
            onClick={() => removeGroup(group.id)}
          >
            <Unlink size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class={styles.members}>{children}</div>
    </div>
  );
}
