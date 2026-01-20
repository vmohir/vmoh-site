import { adjustments, addAdjustment } from "../state/billState";
import AdjustmentCard from "./AdjustmentCard";
import styles from "./AdjustmentsSection.module.css";

export default function AdjustmentsSection() {
  const handleAddAdjustment = () => {
    // Add with default values
    addAdjustment("New Adjustment", 0, true, "tip");
  };

  return (
    <div class={styles.adjustmentsSection}>
      <div class={styles.adjustmentsList}>
        {adjustments.value.map((adjustment) => (
          <AdjustmentCard key={adjustment.id} adjustment={adjustment} />
        ))}
      </div>

      {adjustments.value.length === 0 && (
        <p class={styles.emptyMessage}>No adjustments added yet</p>
      )}

      <button class="btn" onClick={handleAddAdjustment}>
        + Add Adjustment
      </button>
    </div>
  );
}
