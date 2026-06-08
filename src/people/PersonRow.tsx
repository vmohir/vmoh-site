import { useState } from "preact/hooks";
import { ChevronDown, GripVertical, X } from "lucide-preact";
import type {
  Currency,
  CurrencyLedger,
  Person,
  PersonTotal,
} from "../splitApp/split.types.ts";
import { updatePersonName } from "../state/billState.ts";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import EditableText from "ui/EditableText";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { dragState } from "./dnd.ts";
import styles from "./PersonRow.module.css";

interface PersonRowProps {
  person: Person;
  ledgers: CurrencyLedger[];
  onRemove?: (id: string) => void;
}

interface Entry {
  currency: Currency;
  symbol: string;
  total: PersonTotal;
}

function balanceText(balance: number, symbol: string) {
  if (balance > 0.01)
    return { cls: styles.owe, text: `Owes ${symbol}${balance.toFixed(2)}` };
  if (balance < -0.01)
    return {
      cls: styles.receive,
      text: `Receives ${symbol}${Math.abs(balance).toFixed(2)}`,
    };
  return { cls: styles.settled, text: "Settled" };
}

// Read-only per-currency breakdown for one person.
function Breakdown({
  total,
  symbol,
  currency,
}: {
  total: PersonTotal;
  symbol: string;
  currency?: Currency;
}) {
  return (
    <div class={styles.breakdown}>
      {currency && <div class={styles.ledgerTag}>{currency}</div>}

      {total.assignedItems.length > 0 && (
        <div class={styles.section}>
          <span class={styles.sectionLabel}>Consumed</span>
          <ul>
            {total.assignedItems.map((item, i) => (
              <li key={i}>
                {item.name}: {getCurrencySymbol(item.currency)}
                {item.share.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {total.paidItems.length > 0 && (
        <div class={styles.section}>
          <span class={styles.sectionLabel}>Paid</span>
          <ul>
            {total.paidItems.map((item, i) => (
              <li key={i}>
                {item.name}: {getCurrencySymbol(item.currency)}
                {item.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div class={styles.line}>
        <span>Subtotal</span>
        <span>
          {symbol}
          {total.itemsSubtotal.toFixed(2)}
        </span>
      </div>

      {total.adjustments.map((adj) => (
        <div class={styles.line} key={adj.id}>
          <span>{adj.label}</span>
          <span>
            {adj.type === "discount" ? "-" : ""}
            {symbol}
            {Math.abs(adj.amount).toFixed(2)}
          </span>
        </div>
      ))}

      {Math.abs(total.itemAdjustments) > 0.005 && (
        <div class={styles.line}>
          <span>Item tip/VAT/discount</span>
          <span>
            {total.itemAdjustments < 0 ? "-" : ""}
            {symbol}
            {Math.abs(total.itemAdjustments).toFixed(2)}
          </span>
        </div>
      )}

      <div class={styles.line}>
        <span>Total owed</span>
        <span>
          {symbol}
          {total.total.toFixed(2)}
        </span>
      </div>

      <div class={styles.line}>
        <span>Total paid</span>
        <span>
          {symbol}
          {total.totalPaid.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function PersonRow({
  person,
  ledgers,
  onRemove,
}: PersonRowProps) {
  const [open, setOpen] = useState(false);
  const multi = ledgers.length > 1;

  const entries: Entry[] = ledgers
    .map((l) => ({
      currency: l.currency,
      symbol: getCurrencySymbol(l.currency),
      total: l.totals.find((t) => t.personId === person.id),
    }))
    .filter((e): e is Entry => e.total !== undefined);

  const active = entries.filter((e) => Math.abs(e.total.balance) > 0.01);

  // Drag visuals: dim self while being dragged, draw an insertion line on
  // the side the dragged person would land if released right now.
  const ds = dragState.value;
  const isBeingDragged = !!ds?.active && ds.personId === person.id;
  const isDropTarget =
    !!ds?.active &&
    ds.target?.kind === "row" &&
    ds.target.personId === person.id;
  const dropPosition = isDropTarget
    ? (ds!.target as { position: "before" | "after" }).position
    : null;

  const handleGripPointerDown = (e: PointerEvent) => {
    if (e.button !== undefined && e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;
    const row = target.closest(`[data-person-row]`) as HTMLElement | null;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    target.setPointerCapture(e.pointerId);
    dragState.value = {
      personId: person.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      target: null,
      active: false,
    };
    // Stop the press from also focusing the EditableText behind the grip.
    e.preventDefault();
  };

  const rowClass = [
    styles.row,
    isBeingDragged ? styles.beingDragged : "",
    dropPosition === "before" ? styles.dropBefore : "",
    dropPosition === "after" ? styles.dropAfter : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div class={rowClass} data-open={open} data-person-row={person.id}>
      <div class={styles.header}>
        <button
          type="button"
          class={styles.grip}
          aria-label="Drag to reorder"
          title="Drag to reorder or move into a group"
          onPointerDown={handleGripPointerDown}
        >
          <GripVertical size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          class={styles.expand}
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown
            class={styles.chevron}
            data-open={open}
            size={16}
            aria-hidden="true"
          />
        </button>

        <PersonAvatar person={person} />

        <EditableText
          className={styles.name}
          value={person.name}
          onSave={(v) => updatePersonName(person.id, v)}
          autoFocus={false}
          field={open}
        />

        <span class={styles.balances}>
          {active.length === 0 ? (
            <span class={styles.settled}>Settled</span>
          ) : (
            active.map((e) => {
              const info = balanceText(e.total.balance, e.symbol);
              return (
                <span class={info.cls} key={e.currency}>
                  {info.text}
                </span>
              );
            })
          )}
        </span>

        {onRemove && (
          <button
            type="button"
            class={`btn btn-icon btn-danger ${styles.remove}`}
            aria-label="Remove"
            title="Remove"
            onClick={() => onRemove(person.id)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div class={styles.breakdownWrap}>
          {entries.map((e) => (
            <Breakdown
              key={e.currency}
              total={e.total}
              symbol={e.symbol}
              currency={multi ? e.currency : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
