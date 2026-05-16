import { useState } from "preact/hooks";
import type { Currency } from "../../splitApp/split.types.ts";
import {
  addItem,
  baseCurrency,
  isAdvancedMode,
} from "../../state/billState.ts";
import { CurrencySelector } from "../currencies/CurrencySelector.tsx";
import styles from "./AddItemForm.module.css";

export function AddItemForm() {
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState<Currency | null>(null);

  const effectiveCurrency = currencyInput ?? baseCurrency.value;

  const handleAdd = () => {
    const price = parseFloat(priceInput);
    if (nameInput.trim() && !isNaN(price) && price >= 0) {
      addItem(nameInput, price, effectiveCurrency);
      setNameInput("");
      setPriceInput("");
      setCurrencyInput(null);
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
      {isAdvancedMode.value && (
        <CurrencySelector
          value={effectiveCurrency}
          onChange={setCurrencyInput}
        />
      )}

      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
