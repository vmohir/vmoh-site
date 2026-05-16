import { useState } from "preact/hooks";
import type { Currency } from "../../splitApp/split.types.ts";
import {
  addItem,
  baseCurrency,
  isAdvancedMode,
  people,
} from "../../state/billState.ts";
import { CurrencySelector } from "../currencies/CurrencySelector.tsx";
import { PaidBySelector } from "../../receiptItems/PaidBySelector.tsx";
import styles from "./AddItemForm.module.css";

export function AddItemForm() {
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState<Currency | null>(null);
  const [paidByDraft, setPaidByDraft] = useState<Set<string>>(new Set());

  const effectiveCurrency = currencyInput ?? baseCurrency.value;

  const handleAdd = () => {
    const price = parseFloat(priceInput);
    if (nameInput.trim() && !isNaN(price) && price >= 0) {
      addItem(nameInput, price, effectiveCurrency, [...paidByDraft]);
      setNameInput("");
      setPriceInput("");
      setCurrencyInput(null);
      setPaidByDraft(new Set());
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
        class={styles.nameInput}
        value={nameInput}
        onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
        onKeyPress={handleKeyPress}
        placeholder="Item name"
      />
      <input
        type="text"
        inputMode="decimal"
        class={styles.priceInput}
        value={priceInput}
        onInput={(e) => setPriceInput((e.target as HTMLInputElement).value)}
        onKeyPress={handleKeyPress}
        placeholder="Price"
      />
      {isAdvancedMode.value && (
        <CurrencySelector
          value={effectiveCurrency}
          onChange={setCurrencyInput}
        />
      )}

      {people.value.length > 0 && (
        <PaidBySelector
          people={people.value}
          selected={paidByDraft}
          onChange={setPaidByDraft}
        />
      )}

      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
