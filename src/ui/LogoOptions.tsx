import styles from "./LogoOptions.module.css";

// Six logo concepts for split-bill, rendered side by side in the header so we
// can compare. Main shapes use currentColor; "cuts"/gaps use the page
// background so slices read as separate pieces. Temporary — once a direction is
// picked we'll keep one and drop this gallery.

const gap = { fill: "var(--canvas-bg)" };
const gapStroke = { stroke: "var(--canvas-bg)" };

// 1 — Sliced coin / pizza: a coin cut into wedges.
function Logo1({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <circle cx="16" cy="16" r="13" fill="currentColor" />
      <g style={gapStroke} stroke-width="2.5" stroke-linecap="round">
        <line x1="16" y1="16" x2="16" y2="2" />
        <line x1="16" y1="16" x2="28" y2="23" />
        <line x1="16" y1="16" x2="4" y2="23" />
      </g>
    </svg>
  );
}

// 2 — Divide coin: a coin stamped with a ÷ sign.
function Logo2({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <circle cx="16" cy="16" r="13" fill="currentColor" />
      <circle cx="16" cy="9.5" r="2.1" style={gap} />
      <rect x="8" y="14.7" width="16" height="2.6" rx="1.3" style={gap} />
      <circle cx="16" cy="22.5" r="2.1" style={gap} />
    </svg>
  );
}

// 3 — Shared coins: two overlapping coins (split between people).
function Logo3({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <circle cx="12" cy="16" r="9" fill="currentColor" />
      <circle cx="21" cy="16" r="10.6" style={gap} />
      <circle cx="21" cy="16" r="9" fill="currentColor" />
    </svg>
  );
}

// 4 — Receipt with a dashed split line and torn bottom.
function Logo4({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <path d="M7 4h18v20l-3-2-3 2-3-2-3 2-3-2-3 2z" fill="currentColor" />
      <line
        x1="16"
        y1="6"
        x2="16"
        y2="22"
        style={gapStroke}
        stroke-width="2"
        stroke-dasharray="2 2.5"
        stroke-linecap="round"
      />
    </svg>
  );
}

// 5 — Split: one stream forking into two arrows.
function Logo5({ size = 30 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M16 5v8" />
      <path d="M16 13 8 27" />
      <path d="M16 13l8 14" />
      <path d="M5 22l3 5 5-2" />
      <path d="M27 22l-3 5-5-2" />
    </svg>
  );
}

// 6 — Your idea: an "S" sliced like pizza pieces.
function Logo6({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <path
        d="M23 9c0-4-13-4-13 2 0 5 13 3 13 9 0-4-13 4-13-2"
        fill="none"
        stroke="currentColor"
        stroke-width="5.5"
        stroke-linecap="round"
      />
      <g style={gapStroke} stroke-width="2.5" stroke-linecap="round">
        <line x1="9" y1="9" x2="15" y2="14" />
        <line x1="17" y1="18" x2="23" y2="23" />
      </g>
    </svg>
  );
}

const LOGOS = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6];

export function LogoOptions() {
  return (
    <div class={styles.gallery}>
      {LOGOS.map((Logo, i) => (
        <span key={i} class={styles.option} title={`Logo ${i + 1}`}>
          <Logo />
          <small class={styles.num}>{i + 1}</small>
        </span>
      ))}
    </div>
  );
}
