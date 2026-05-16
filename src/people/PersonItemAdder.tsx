import { Plus } from "lucide-preact";
import styles from "./PersonItemAdder.module.css";

interface PersonItemAdderProps {
  onAdd: () => void;
}

export const PersonItemAdder = ({ onAdd }: PersonItemAdderProps) => {
  return (
    <button onClick={onAdd} class={styles.personItemAdderButton}>
      <Plus size={14} aria-hidden="true" />
      Add Person
    </button>
  );
};
