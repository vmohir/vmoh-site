import PeopleSection from "../people/PeopleSection.tsx";
import ItemsSection from "../receiptItems/ItemsSection.tsx";
import TaxTipSection from "./TaxTipSection";
import ResultsSection from "./ResultsSection";

export default function SplitBillApp() {
  return (
    <div class="split-bill-container">
      <section class="people-section">
        <h2>People</h2>
        <PeopleSection />
      </section>

      <section class="items-section">
        <h2>Items</h2>
        <ItemsSection />
      </section>

      <section class="tax-tip-section">
        <h2>Tax & Tip</h2>
        <TaxTipSection />
      </section>

      <section class="results-section">
        <h2>Results</h2>
        <ResultsSection />
      </section>

      <style>{`
        .split-bill-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
