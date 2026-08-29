import styles from "./HandoffScreen.module.css";

interface Props {
  playerName: string;
  active: boolean;
  onReady: () => void;
}

export default function HandoffScreen({ playerName, active, onReady }: Props) {
  return (
    <div class={styles.screen}>
      <p class="text-sm text-muted">Pass the device to</p>
      <h1 class="text-3xl font-bold">{playerName}</h1>
      <p class="text-sm text-secondary">
        {active
          ? "It's your roll this round."
          : "Use the white die on your sheet."}
      </p>
      <button
        type="button"
        class="btn btn-primary mt-4 !py-4 text-lg"
        onClick={onReady}
      >
        I'm ready
      </button>
    </div>
  );
}
