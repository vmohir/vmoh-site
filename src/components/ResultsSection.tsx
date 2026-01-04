import { calculatedTotals, calculatedSettlement, settlementAlgorithm, updateSettlementAlgorithm } from '../state/billState';
import { getAvailableAlgorithms } from '../utils/settlementAlgorithms';

export default function ResultsSection() {
  const totals = calculatedTotals.value;
  const settlement = calculatedSettlement.value;
  const algorithms = getAvailableAlgorithms();

  if (totals.length === 0) {
    return <p class="empty-message">Add people and items to see results</p>;
  }

  return (
    <div class="results-section-content">
      <div class="person-results">
        <h3>Per-Person Breakdown</h3>
        {totals.map(personTotal => (
          <div key={personTotal.personId} class="person-result">
            <h4>{personTotal.personName}</h4>

            <div class="breakdown">
              {/* Consumed items */}
              {personTotal.assignedItems.length > 0 && (
                <div class="breakdown-section">
                  <strong>Consumed Items:</strong>
                  <ul>
                    {personTotal.assignedItems.map((item, index) => (
                      <li key={index}>
                        {item.name}: {item.share.toFixed(2)} {item.currency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Paid items */}
              {personTotal.paidItems.length > 0 && (
                <div class="breakdown-section">
                  <strong>Paid Items:</strong>
                  <ul>
                    {personTotal.paidItems.map((item, index) => (
                      <li key={index}>
                        {item.name}: {item.amount.toFixed(2)} {item.currency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div class="breakdown-row">
                <span>Subtotal (owed):</span>
                <span>${personTotal.itemsSubtotal.toFixed(2)}</span>
              </div>

              {personTotal.taxAmount > 0 && (
                <div class="breakdown-row">
                  <span>Tax:</span>
                  <span>${personTotal.taxAmount.toFixed(2)}</span>
                </div>
              )}

              {personTotal.tipAmount > 0 && (
                <div class="breakdown-row">
                  <span>Tip:</span>
                  <span>${personTotal.tipAmount.toFixed(2)}</span>
                </div>
              )}

              <div class="breakdown-row">
                <strong>Total Owed:</strong>
                <strong>${personTotal.total.toFixed(2)}</strong>
              </div>

              <div class="breakdown-row">
                <strong>Total Paid:</strong>
                <strong>${personTotal.totalPaid.toFixed(2)}</strong>
              </div>

              <div class={`breakdown-row balance ${
                personTotal.balance < 0 ? 'overpaid' :
                personTotal.balance > 0 ? 'underpaid' :
                'settled'
              }`}>
                <strong>Balance:</strong>
                <strong>
                  {personTotal.balance > 0.01
                    ? `Owes $${personTotal.balance.toFixed(2)}`
                    : personTotal.balance < -0.01
                    ? `Should receive $${Math.abs(personTotal.balance).toFixed(2)}`
                    : 'Settled'}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settlement section */}
      <div class="settlement-section">
        <h3>Payment Settlement</h3>

        <div class="algorithm-selector">
          <label>
            <span>Settlement method:</span>
            <select
              value={settlementAlgorithm.value}
              onChange={(e) => updateSettlementAlgorithm((e.target as HTMLSelectElement).value as any)}
            >
              {algorithms.map(alg => (
                <option key={alg.id} value={alg.id}>
                  {alg.name}
                </option>
              ))}
            </select>
          </label>
          <p class="algorithm-description">
            {algorithms.find(a => a.id === settlementAlgorithm.value)?.description}
          </p>
        </div>

        {settlement.transfers.length > 0 ? (
          <div class="transfers">
            <p class="transfer-count">
              {settlement.totalTransactions} transaction{settlement.totalTransactions !== 1 ? 's' : ''} needed
            </p>
            {settlement.transfers.map((transfer, index) => (
              <div key={index} class="transfer-item">
                <span class="from">{transfer.fromPersonName}</span>
                <span class="arrow">→</span>
                <span class="to">{transfer.toPersonName}</span>
                <span class="amount">
                  ${transfer.amount.toFixed(2)} {transfer.currency}
                </span>
              </div>
            ))}
            {!settlement.isBalanced && (
              <div class="warning">
                Warning: Settlement may not be balanced. Please check calculations.
              </div>
            )}
          </div>
        ) : (
          <p class="settled-message">All balanced! No transfers needed.</p>
        )}
      </div>

      <style>{`
        .results-section-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .person-results h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .person-result {
          padding: 1rem;
          border: 1px solid #ddd;
          margin-bottom: 1rem;
        }

        .person-result h4 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .breakdown-section strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .breakdown-section ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .breakdown-section li {
          margin-bottom: 0.25rem;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
        }

        .breakdown-row.balance {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 2px solid #333;
        }

        .breakdown-row.balance.overpaid {
          color: #28a745;
        }

        .breakdown-row.balance.underpaid {
          color: #dc3545;
        }

        .breakdown-row.balance.settled {
          color: #6c757d;
        }

        .settlement-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .settlement-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .algorithm-selector {
          margin-bottom: 1.5rem;
        }

        .algorithm-selector label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .algorithm-selector span {
          font-weight: 500;
        }

        .algorithm-selector select {
          padding: 0.5rem;
        }

        .algorithm-description {
          margin: 0.5rem 0 0 0;
          font-size: 0.875rem;
          color: #666;
          font-style: italic;
        }

        .transfers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .transfer-count {
          margin: 0 0 1rem 0;
          font-weight: 500;
        }

        .transfer-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .from {
          font-weight: 500;
          color: #dc3545;
        }

        .arrow {
          color: #6c757d;
          font-size: 1.25rem;
        }

        .to {
          font-weight: 500;
          color: #28a745;
        }

        .amount {
          margin-left: auto;
          font-weight: 600;
          font-size: 1.125rem;
        }

        .settled-message {
          margin: 0;
          color: #28a745;
          font-weight: 500;
          text-align: center;
          padding: 1rem;
        }

        .warning {
          padding: 0.75rem;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          color: #856404;
        }

        .no-items {
          margin: 0;
          color: #666;
          font-style: italic;
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
