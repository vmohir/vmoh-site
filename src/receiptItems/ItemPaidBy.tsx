import { useEffect, useRef, useState } from "preact/hooks";
import type { Item, Person } from "../splitApp/split.types.ts";
import { toggleItemAssignment } from "state/billState.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import styles from "./ItemPaidBy.module.css";

interface ItemPaidByProps {
  item: Item;
  people: Person[];
}

export function ItemPaidBy({ item, people }: ItemPaidByProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = people.filter((p) => item.usedBy.has(p.id));

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        class={styles.trigger}
        aria-label="Paid by"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        {selected.length === 0 ? (
          <span class={styles.placeholder}>Paid by</span>
        ) : (
          <span class={styles.avatars}>
            {selected.map((p) => (
              <PersonAvatar key={p.id} person={p} />
            ))}
          </span>
        )}
        <span class={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div class={styles.dropdown} role="listbox">
          {people.map((person) => (
            <label key={person.id} class={styles.option}>
              <input
                type="checkbox"
                checked={item.usedBy.has(person.id)}
                onChange={() => toggleItemAssignment(item.id, person.id)}
              />
              <PersonAvatar person={person} />
              <span class={styles.optionName}>{person.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
