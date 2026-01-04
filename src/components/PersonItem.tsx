import type { Person } from "types/models";
import styles from "./PersonItem.module.css";
import { PersonAvatar } from "ui/PersonAvatar.tsx";

interface PersonItemProps {
  person: Person;
  onRemove: (id: string) => void;
}

export default function PersonItem({ person, onRemove }: PersonItemProps) {
  return (
    <div class={styles.personItem}>
      <PersonAvatar person={person} />
      <span class={styles.personNameInput}>{person.name}</span>
      <button onClick={() => onRemove(person.id)}>Remove</button>
    </div>
  );
}
