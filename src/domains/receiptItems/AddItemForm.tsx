import { useState } from "preact/hooks";
import { ArrowRight, Users, Wallet } from "lucide-preact";
import type { Currency } from "../../splitApp/split.types.ts";
import {
  addItem,
  baseCurrency,
  isAdvancedMode,
  people,
} from "../../state/billState.ts";
import { CurrencySelector } from "../currencies/CurrencySelector.tsx";
import { PeoplePicker } from "../../receiptItems/PeoplePicker.tsx";
import { getCurrencySymbol } from "../../utils/currency.utils.ts";
import { focusNextInput } from "../../utils/focusNextInput.ts";
import styles from "./AddItemForm.module.css";

export function AddItemForm() {
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState<Currency | null>(null);
  const [sharedByDraft, setSharedByDraft] = useState<Set<string>>(new Set());
  const [paidByDraft, setPaidByDraft] = useState<Set<string>>(new Set());

  const effectiveCurrency = currencyInput ?? baseCurrency.value;

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const price = parseFloat(priceInput);
    if (nameInput.trim() && !isNaN(price) && price >= 0) {
      addItem(
        nameInput,
        price,
        effectiveCurrency,
        [...sharedByDraft],
        [...paidByDraft],
      );
      setNameInput("");
      setPriceInput("");
      setCurrencyInput(null);
      setSharedByDraft(new Set());
      setPaidByDraft(new Set());
    }
  };

  return (
    <form className={styles.inputGroup} onSubmit={handleSubmit}>
      <input
        type="text"
        class={styles.nameInput}
        value={nameInput}
        onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (focusNextInput(e.currentTarget)) e.preventDefault();
          }
        }}
        placeholder="Item name"
        autoComplete="off"
        enterKeyHint="next"
      />
      <label class={styles.priceField}>
        <span class={styles.priceSymbol} aria-hidden="true">
          {getCurrencySymbol(effectiveCurrency)}
        </span>
        <input
          type="text"
          inputMode="decimal"
          class={styles.priceInputInner}
          value={priceInput}
          onInput={(e) => setPriceInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (focusNextInput(e.currentTarget)) e.preventDefault();
            }
          }}
          placeholder="Price"
          autoComplete="off"
          enterKeyHint="next"
        />
      </label>
      {isAdvancedMode.value && (
        <CurrencySelector
          value={effectiveCurrency}
          onChange={setCurrencyInput}
        />
      )}

      {people.value.length > 0 && (
        <div class={styles.flow}>
          <PeoplePicker
            label="Payer"
            people={people.value}
            selected={paidByDraft}
            onChange={setPaidByDraft}
            leading={<Wallet size={14} />}
          />
          <ArrowRight class={styles.flowArrow} size={14} aria-hidden="true" />
          <PeoplePicker
            label="Split"
            people={people.value}
            selected={sharedByDraft}
            onChange={setSharedByDraft}
            leading={<Users size={14} />}
            alwaysMulti
          />
        </div>
      )}

      <button type="submit" class={styles.addBtn}>
        Add
      </button>
    </form>
  );
}
