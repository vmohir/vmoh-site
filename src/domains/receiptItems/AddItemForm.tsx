import { useState } from "preact/hooks";
import type { Currency } from "../../splitApp/split.types.ts";
import { addItem } from "../../state/billState.ts";
import { CurrencySelector } from "../currencies/CurrencySelector.tsx";
import styles from "./AddItemForm.module.css";

export function AddItemForm() {
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
    <div className={styles.inputGroup}>
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
      <CurrencySelector
        value={currencyInput}
        onChange={setCurrencyInput}
      />
      <button onClick={handleAdd}>Add Item</button>
    </div>
  );
}
