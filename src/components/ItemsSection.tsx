import { useState } from 'preact/hooks';
import { items, people, addItem, removeItem } from '../state/billState';
import type { Currency } from '../types/models';
import ItemCard from './ItemCard';

export default function ItemsSection() {
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState<Currency>('USD');

  const handleAdd = () => {
    const price = parseFloat(priceInput);
    if (nameInput.trim() && !isNaN(price) && price >= 0) {
      addItem(nameInput, price, currencyInput);
      setNameInput('');
      setPriceInput('');
      setCurrencyInput('USD');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div class="items-section-content">
      <div class="input-group">
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
          onChange={(e) => setCurrencyInput((e.target as HTMLSelectElement).value as Currency)}
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

      <div class="items-list">
        {items.value.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            people={people.value}
            onRemove={removeItem}
          />
        ))}
      </div>

      {items.value.length === 0 && (
        <p class="empty-message">No items added yet</p>
      )}

      <style>{`
        .items-section-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          gap: 0.5rem;
        }

        .input-group input {
          padding: 0.5rem;
        }

        .input-group input[type="text"] {
          flex: 2;
        }

        .input-group input[type="number"] {
          flex: 1;
        }

        .input-group select {
          padding: 0.5rem;
        }

        .input-group button {
          padding: 0.5rem 1rem;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .empty-message {
          margin: 0;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
