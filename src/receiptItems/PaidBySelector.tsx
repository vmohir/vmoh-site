import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronDown } from "lucide-preact";
import type { Person } from "../splitApp/split.types.ts";
import { isAdvancedMode } from "state/billState.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import styles from "./PaidBySelector.module.css";

interface PaidBySelectorProps {
  people: Person[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

// Multi/single-select dropdown of people who paid for an item.
// Behaviour follows isAdvancedMode: advanced toggles, basic replaces.
export function PaidBySelector({
  people,
  selected,
  onChange,
}: PaidBySelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectedPeople = people.filter((p) => selected.has(p.id));

  const handlePick = (personId: string) => {
    const next = new Set(selected);
    if (isAdvancedMode.value) {
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
    } else if (next.has(personId) && next.size === 1) {
      next.clear();
    } else {
      next.clear();
      next.add(personId);
    }
    onChange(next);
  };

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
        {selectedPeople.length === 0 ? (
          <span class={styles.placeholder}>Paid by</span>
        ) : (
          <span class={styles.avatars}>
            {selectedPeople.map((p) => (
              <PersonAvatar key={p.id} person={p} />
            ))}
          </span>
        )}
        <ChevronDown class={styles.caret} size={14} aria-hidden="true" />
      </button>

      {open && (
        <div class={styles.dropdown} role="listbox">
          {people.map((person) => (
            <label key={person.id} class={styles.option}>
              <input
                type="checkbox"
                checked={selected.has(person.id)}
                onChange={() => handlePick(person.id)}
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
