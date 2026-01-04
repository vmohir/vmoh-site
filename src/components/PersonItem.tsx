import { useState, useRef, useEffect } from "preact/hooks";
import type { Person } from "types/models";
import { updatePersonName } from "state/billState";
import styles from "./PersonItem.module.css";
import { PersonAvatar } from "ui/PersonAvatar.tsx";

interface PersonItemProps {
  person: Person;
  onRemove: (id: string) => void;
}

export default function PersonItem({ person, onRemove }: PersonItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(person.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== person.name) {
      updatePersonName(person.id, editValue);
    } else {
      setEditValue(person.name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(person.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div class="flex items-center gap-3">
      <PersonAvatar person={person} />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          class={styles.editableNameInput}
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          class={styles.editableNameDisplay}
        >
          {person.name}
        </button>
      )}

      <button
        onClick={() => onRemove(person.id)}
        class="ml-auto px-2 py-1 text-sm text-muted hover:text-error transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
