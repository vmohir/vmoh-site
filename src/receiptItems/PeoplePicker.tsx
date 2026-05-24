import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import type { VNode } from "preact";
import { ChevronDown } from "lucide-preact";
import type { Person } from "../splitApp/split.types.ts";
import { isAdvancedMode } from "state/billState.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import styles from "./PeoplePicker.module.css";

interface PeoplePickerProps {
  label: string;
  people: Person[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  // Small icon rendered before the placeholder / avatar stack inside the pill.
  leading?: VNode;
  // When true, multi-select is allowed regardless of mode. Default: basic = single, advanced = multi.
  alwaysMulti?: boolean;
}

// Multi/single-select dropdown of people for an item.
export function PeoplePicker({
  label,
  people,
  selected,
  onChange,
  leading,
  alwaysMulti = false,
}: PeoplePickerProps) {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  // Pick the side that keeps the menu in the viewport. If the trigger sits
  // closer to the right edge, align the menu's right edge to it; otherwise
  // align its left edge.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const triggerCenter = (rect.left + rect.right) / 2;
    setAlignEnd(triggerCenter > window.innerWidth / 2);
  }, [open]);

  const selectedPeople = people.filter((p) => selected.has(p.id));

  const multi = alwaysMulti || isAdvancedMode.value;
  const handlePick = (personId: string) => {
    const next = new Set(selected);
    if (multi) {
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
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        {leading && (
          <span class={styles.leading} aria-hidden="true">
            {leading}
          </span>
        )}
        {selectedPeople.length === 0 ? (
          <span class={styles.placeholder}>{label}</span>
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
        <div
          class={`${styles.dropdown} ${alignEnd ? styles.alignEnd : styles.alignStart}`}
          role="listbox"
        >
          {people.map((person) => (
            <label key={person.id} class={styles.option}>
              <input
                type={multi ? "checkbox" : "radio"}
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
