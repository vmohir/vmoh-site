import type { Item } from "../splitApp/split.types.ts";
import { insertItemAt, items, people, removeItem } from "../state/billState.ts";
import { showToast } from "../state/toast.ts";
import { useMediaQuery } from "../ui/useMediaQuery.ts";
import { Toast } from "../ui/Toast.tsx";
import ItemCard from "./ItemCard.tsx";
import { ItemRow } from "./ItemRow.tsx";
import { SwipeToDelete } from "./SwipeToDelete.tsx";
import styles from "./ItemsSection.module.css";
import { AddItemForm } from "../domains/receiptItems/AddItemForm.tsx";

export default function ItemsSection() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Delete with an undo affordance: remember the position so Undo can restore
  // the item exactly where it was.
  const deleteWithUndo = (item: Item) => {
    const index = items.value.findIndex((i) => i.id === item.id);
    removeItem(item.id);
    showToast("Item deleted", {
      actionLabel: "Undo",
      onAction: () => insertItemAt(index, item),
    });
  };

  return (
    <div className={styles.itemsSection}>
      <AddItemForm />

      <div className={styles.itemsList}>
        {items.value.map((item) =>
          isMobile ? (
            <SwipeToDelete key={item.id} onDelete={() => deleteWithUndo(item)}>
              <ItemRow item={item} people={people.value} />
            </SwipeToDelete>
          ) : (
            <ItemCard
              key={item.id}
              item={item}
              people={people.value}
              onRemove={removeItem}
            />
          ),
        )}
      </div>

      {items.value.length === 0 && (
        <p class={styles.emptyMessage}>No items added yet</p>
      )}

      <Toast />
    </div>
  );
}
