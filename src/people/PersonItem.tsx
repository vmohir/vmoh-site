import type { Person } from "splitApp/split.types.ts";
import { updatePersonName } from "state/billState.ts";
import styles from "./PersonItem.module.css";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import EditableText from "ui/EditableText.tsx";

interface PersonItemProps {
  person: Person;
  onRemove?: (id: string) => void;
}

export default function PersonItem({ person, onRemove }: PersonItemProps) {
  return (
    <div class={styles.personItem}>
      <PersonAvatar person={person} />

      <EditableText
        value={person.name}
        onSave={(newValue) => updatePersonName(person.id, newValue)}
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
