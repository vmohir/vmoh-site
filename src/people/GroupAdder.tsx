import { Link2 } from "lucide-preact";
import { useState } from "preact/hooks";
import type { Person } from "../splitApp/split.types.ts";
import { addGroup } from "../state/billState.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { Popover } from "ui/Popover.tsx";
import { useDropdown } from "ui/useDropdown.ts";
import styles from "./GroupAdder.module.css";

interface GroupAdderProps {
  ungrouped: Person[];
}

// Opens a popover listing ungrouped people; pick 2+ to create a group.
export default function GroupAdder({ ungrouped }: GroupAdderProps) {
  const {
    open,
    toggle,
    close,
    wrapRef,
    triggerRef,
    alignEnd,
  } = useDropdown<HTMLButtonElement>({ alignByViewport: true });
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const togglePick = (id: string) => {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  };

  const handleCreate = () => {
    if (picked.size < 2) return;
    addGroup([...picked]);
    setPicked(new Set());
    close();
  };

  // Need at least 2 ungrouped people for a meaningful new group.
  const disabled = ungrouped.length < 2;

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        aria-label="Group people"
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={toggle}
        title={disabled ? "Need 2+ ungrouped people to form a group" : "Group people"}
      >
        <Link2 size={14} aria-hidden="true" />
        Group
      </button>
      {open && (
        <Popover align={alignEnd ? "end" : "start"} role="listbox">
          {ungrouped.length === 0 ? (
            <div class={styles.empty}>No ungrouped people</div>
          ) : (
            <>
              {ungrouped.map((person) => (
                <label key={person.id} class={styles.option}>
                  <input
                    type="checkbox"
                    checked={picked.has(person.id)}
                    onChange={() => togglePick(person.id)}
                  />
                  <PersonAvatar person={person} />
                  <span class={styles.optionName}>{person.name}</span>
                </label>
              ))}
              <div class={styles.footer}>
                <button
                  type="button"
                  class={styles.create}
                  disabled={picked.size < 2}
                  onClick={handleCreate}
                >
                  Create
                </button>
              </div>
            </>
          )}
        </Popover>
      )}
    </div>
  );
}
