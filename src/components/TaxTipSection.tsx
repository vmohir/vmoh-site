import { tax, taxIsPercent, tip, tipIsPercent, updateTax, updateTip } from '../state/billState';

export default function TaxTipSection() {
  return (
    <div class="tax-tip-section-content">
      <div class="input-row">
        <label>
          <span>Tax:</span>
          <div class="input-with-toggle">
            <input
              type="number"
              value={tax.value}
              onInput={(e) => updateTax(parseFloat((e.target as HTMLInputElement).value) || 0, taxIsPercent.value)}
              step="0.01"
              min="0"
            />
            <select
              value={taxIsPercent.value ? 'percent' : 'fixed'}
              onChange={(e) => updateTax(tax.value, (e.target as HTMLSelectElement).value === 'percent')}
            >
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
          </div>
        </label>
      </div>

      <div class="input-row">
        <label>
          <span>Tip:</span>
          <div class="input-with-toggle">
            <input
              type="number"
              value={tip.value}
              onInput={(e) => updateTip(parseFloat((e.target as HTMLInputElement).value) || 0, tipIsPercent.value)}
              step="0.01"
              min="0"
            />
            <select
              value={tipIsPercent.value ? 'percent' : 'fixed'}
              onChange={(e) => updateTip(tip.value, (e.target as HTMLSelectElement).value === 'percent')}
            >
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
          </div>
        </label>
      </div>

      <style>{`
        .tax-tip-section-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-row label {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .input-row span {
          font-weight: 500;
        }

        .input-with-toggle {
          display: flex;
          gap: 0.5rem;
        }

        .input-with-toggle input {
          flex: 1;
          padding: 0.5rem;
        }

        .input-with-toggle select {
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}
