import type { VNode } from "preact";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-preact";
import type { Person } from "../splitApp/split.types.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { Popover } from "ui/Popover.tsx";
import { useDropdown } from "ui/useDropdown.ts";
import styles from "./PeoplePicker.module.css";

interface PeoplePickerProps {
  label: string;
  people: Person[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  // Small icon rendered before the placeholder / avatar stack inside the pill.
  leading?: VNode;
  // True → checkbox list, multi-select. False → single-select, closes on pick.
  multi?: boolean;
  // When set, a trailing "Advanced" option is shown that runs this (e.g. to
  // reveal the multi-payer amounts editor) and closes the dropdown.
  onAdvanced?: () => void;
}

// Multi/single-select dropdown of people for an item.
export function PeoplePicker({
  label,
  people,
  selected,
  onChange,
  leading,
  multi = false,
  onAdvanced,
}: PeoplePickerProps) {
  const { open, toggle, close, wrapRef, triggerRef, alignEnd } =
    useDropdown<HTMLButtonElement>({ alignByViewport: true });

  const selectedPeople = people.filter((p) => selected.has(p.id));

  // Fixed footprint: the pill always reserves room for `capacity` avatars so it
  // never resizes (or wraps) as people are picked. Multi-select shows up to 3;
  // beyond that the last slot becomes a "+n" chip. Single-select (one payer)
  // only ever holds one person.
  const capacity = multi ? 3 : 1;
  const overflow =
    selectedPeople.length > capacity
      ? selectedPeople.length - (capacity - 1)
      : 0;
  const visiblePeople = overflow
    ? selectedPeople.slice(0, capacity - 1)
    : selectedPeople;
  // 1–2 people read better spaced out than overlapped.
  const spread = overflow === 0 && selectedPeople.length <= 2;

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
    // Single-select: close immediately on pick.
    if (!multi) close();
  };

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup={multi ? "listbox" : "menu"}
        onClick={toggle}
      >
        {leading && (
          <span class={styles.leading} aria-hidden="true">
            {leading}
          </span>
        )}
        <span class={styles.stack} data-capacity={capacity}>
          {selectedPeople.length === 0 ? (
            <span class={styles.placeholder}>{label}</span>
          ) : (
            <span class={`${styles.avatars} ${spread ? styles.spread : ""}`}>
              {visiblePeople.map((p) => (
                <PersonAvatar key={p.id} person={p} />
              ))}
              {overflow > 0 && <span class={styles.overflow}>+{overflow}</span>}
            </span>
          )}
        </span>
        <ChevronDown class={styles.caret} size={14} aria-hidden="true" />
      </button>

      {open && (
        <Popover
          align={alignEnd ? "end" : "start"}
          role={multi ? "listbox" : "menu"}
        >
          {multi && people.length > 1 && (
            <label class={`${styles.option} ${styles.selectAll}`}>
              <input
                type="checkbox"
                checked={selected.size === people.length}
                onChange={() =>
                  onChange(
                    selected.size === people.length
                      ? new Set()
                      : new Set(people.map((p) => p.id)),
                  )
                }
              />
              <span class={styles.optionName}>
                {selected.size === people.length
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </label>
          )}
          {people.map((person) => {
            const isSelected = selected.has(person.id);
            return multi ? (
              <label key={person.id} class={styles.option}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handlePick(person.id)}
                />
                <PersonAvatar person={person} />
                <span class={styles.optionName}>{person.name}</span>
              </label>
            ) : (
              <button
                key={person.id}
                type="button"
                class={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => handlePick(person.id)}
              >
                <PersonAvatar person={person} />
                <span class={styles.optionName}>{person.name}</span>
                {isSelected && (
                  <Check
                    size={14}
                    class={styles.checkIcon}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {onAdvanced && (
            <button
              type="button"
              class={`${styles.option} ${styles.advanced}`}
              role="menuitem"
              onClick={() => {
                onAdvanced();
                close();
              }}
            >
              <SlidersHorizontal
                size={14}
                class={styles.advancedIcon}
                aria-hidden="true"
              />
              <span class={styles.optionName}>Advanced…</span>
            </button>
          )}
        </Popover>
      )}
    </div>
  );
}
