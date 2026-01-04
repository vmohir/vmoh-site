import { useState } from "preact/hooks";
import { items, people, addItem, removeItem } from "../state/billState.ts";
import type { Currency } from "../SplitApp/split.types.ts";
import ItemCard from "./ItemCard.tsx";
import styles from "./ItemsSection.module.css";

export default function ItemsSection() {
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState<Currency>("USD");

  const handleAdd = () => {
    const price = parseFloat(priceInput);
    if (nameInput.trim() && !isNaN(price) && price >= 0) {
      addItem(nameInput, price, currencyInput);
      setNameInput("");
      setPriceInput("");
      setCurrencyInput("USD");
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div class={styles.itemsSection}>
      <div class={styles.inputGroup}>
        <input
          type="text"
          value={nameInput}
          onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
          onKeyPress={handleKeyPress}
          placeholder="Item name"
        />
        <input
          type="number"
          value={priceInput}
          onInput={(e) => setPriceInput((e.target as HTMLInputElement).value)}
          onKeyPress={handleKeyPress}
          placeholder="Price"
          step="0.01"
          min="0"
        />
        <select
          value={currencyInput}
          onChange={(e) =>
            setCurrencyInput((e.target as HTMLSelectElement).value as Currency)
          }
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="CAD">CAD</option>
          <option value="AUD">AUD</option>
        </select>
        <button onClick={handleAdd}>Add Item</button>
      </div>

      <div class={styles.itemsList}>
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
