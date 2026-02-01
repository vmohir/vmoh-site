import type { Item, Person } from "../splitApp/split.types.ts";
import { toggleItemAssignment } from "state/billState.ts";
import styles from "./ItemCard.module.css";

interface ItemAssignmentsProps {
  item: Item;
  people: Person[];
}

export function ItemAssignments({ item, people }: ItemAssignmentsProps) {
  return (
    <div class={styles.itemAssignments}>
      <span class={styles.label}>Assigned to (who shares this item):</span>
      <div class={styles.checkboxes}>
        {people.map((person) => (
          <label key={person.id}>
            <input
              type="checkbox"
              checked={item.usedBy.has(person.id)}
              onChange={() => toggleItemAssignment(item.id, person.id)}
            />
            {person.name}
          </label>
        ))}
      </div>
    </div>
  );
}
