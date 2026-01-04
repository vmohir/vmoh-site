import type { Item, Person, Currency } from '../types/models';
import { toggleItemAssignment, setItemPayer, updateItemCurrency } from '../state/billState';

interface ItemCardProps {
  item: Item;
  people: Person[];
  onRemove: (id: string) => void;
}

export default function ItemCard({ item, people, onRemove }: ItemCardProps) {
  // Calculate total paid for this item
  const getTotalPaid = (): number => {
    return Array.from(item.paidBy.values())
      .reduce((sum, payer) => sum + payer.amount, 0);
  };

  const totalPaid = getTotalPaid();
  const isBalanced = Math.abs(totalPaid - item.price) < 0.01;

  return (
    <div class="item-card">
      <div class="item-header">
        <div class="item-info">
          <strong>{item.name}</strong>
          <div class="price-row">
            <span class="price">{item.price.toFixed(2)}</span>
            <select
              class="currency-selector"
              value={item.currency}
              onChange={(e) => updateItemCurrency(item.id, (e.target as HTMLSelectElement).value as Currency)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>
        <button onClick={() => onRemove(item.id)}>Remove</button>
      </div>

      {people.length > 0 && (
        <>
          <div class="item-assignments">
            <span class="label">Assigned to (who shares this item):</span>
            <div class="checkboxes">
              {people.map(person => (
                <label key={person.id}>
                  <input
                    type="checkbox"
                    checked={item.assignedTo.has(person.id)}
                    onChange={() => toggleItemAssignment(item.id, person.id)}
                  />
                  {person.name}
                </label>
              ))}
            </div>
          </div>

          <div class="item-payers">
            <span class="label">Paid by (who actually paid):</span>
            <div class="payer-inputs">
              {people.map(person => {
                const payer = item.paidBy.get(person.id);
                return (
                  <div key={person.id} class="payer-row">
                    <label>{person.name}:</label>
                    <input
                      type="number"
                      value={payer?.amount || ''}
                      onInput={(e) => {
                        const amount = parseFloat((e.target as HTMLInputElement).value) || 0;
                        setItemPayer(item.id, person.id, amount, item.currency);
                      }}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    <span class="currency-label">{item.currency}</span>
                  </div>
                );
              })}
            </div>
            <div class={`payment-summary ${isBalanced ? 'balanced' : 'unbalanced'}`}>
              <span>Total paid: {totalPaid.toFixed(2)} {item.currency}</span>
              <span>Item price: {item.price.toFixed(2)} {item.currency}</span>
              {!isBalanced && (
                <span class="warning">
                  {totalPaid > item.price ? 'Overpaid!' : 'Underpaid!'}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .item-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid #ddd;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price {
          color: #666;
          font-size: 1rem;
        }

        .currency-selector {
          padding: 0.25rem;
          font-size: 0.875rem;
        }

        .item-header button {
          padding: 0.25rem 0.5rem;
        }

        .item-assignments {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .item-payers {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #fff3cd;
          border-radius: 4px;
        }

        .label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .checkboxes label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }

        .payer-inputs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payer-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .payer-row label {
          flex: 1;
          font-size: 0.875rem;
        }

        .payer-row input {
          width: 100px;
          padding: 0.25rem;
        }

        .currency-label {
          font-size: 0.75rem;
          color: #666;
          width: 40px;
        }

        .payment-summary {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.5rem;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .payment-summary.balanced {
          background: #d4edda;
          color: #155724;
        }

        .payment-summary.unbalanced {
          background: #f8d7da;
          color: #721c24;
        }

        .payment-summary .warning {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
