import styles from "./PersonItemAdder.module.css";

interface PersonItemAdderProps {
  onAdd: () => void;
}

export const PersonItemAdder = ({ onAdd }: PersonItemAdderProps) => {
  return (
    <button onClick={onAdd} class={styles.personItemAdderButton}>
      + Add Person
    </button>
  );
};
