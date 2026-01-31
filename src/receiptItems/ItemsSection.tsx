import { items, people, removeItem } from "../state/billState.ts";
import ItemCard from "./ItemCard.tsx";
import styles from "./ItemsSection.module.css";
import { AddItemForm } from "../domains/receiptItems/AddItemForm.tsx";

export default function ItemsSection() {
  return (
    <div className={styles.itemsSection}>
      <AddItemForm />

      <div className={styles.itemsList}>
        {items.value.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            people={people.value}
            onRemove={removeItem}
          />
        ))}
      </div>

      {items.value.length === 0 && (
        <p class={styles.emptyMessage}>No items added yet</p>
      )}
    </div>
  );
}
