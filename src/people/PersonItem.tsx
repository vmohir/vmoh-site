import { useState, useRef, useEffect } from "preact/hooks";
import type { Person } from "SplitApp/split.types.ts";
import { updatePersonName } from "state/billState.ts";
import styles from "./PersonItem.module.css";
import { PersonAvatar } from "ui/PersonAvatar.tsx";

interface PersonItemProps {
  person: Person;
  onRemove?: (id: string) => void;
}

export default function PersonItem({ person, onRemove }: PersonItemProps) {
  const [editValue, setEditValue] = useState(person.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (editValue.trim() && editValue !== person.name) {
      updatePersonName(person.id, editValue);
    } else {
      setEditValue(person.name);
    }
  };

  const handleCancel = () => {
    setEditValue(person.name);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div class={styles.personItem}>
      <PersonAvatar person={person} />

      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        class={styles.editableNameInput}
      />
      {onRemove && (
        <button
          onClick={() => onRemove(person.id)}
          class="btn btn-danger ml-auto"
        >
          Remove
        </button>
      )}
    </div>
  );
}
