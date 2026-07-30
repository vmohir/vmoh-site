import { useRef } from "preact/hooks";
import {
  CENTER_X,
  CENTER_Y,
  RADIUS,
  angleForValue,
  describeArc,
  polarPoint,
  valueFromPointer,
} from "./dialGeometry";
import { bandSegments } from "./logic";
import styles from "./DialWheel.module.css";

const VIEWBOX_WIDTH = 300;
const NEEDLE_LENGTH = RADIUS - 6;
const NEEDLE_INSET = 14;

interface Props {
  leftLabel: string;
  rightLabel: string;
  target?: number | null;
  showTarget?: boolean;
  guess?: number | null;
  onGuessChange?: (value: number) => void;
}

function needlePoints(value: number) {
  const angle = angleForValue(value);
  return {
    inner: polarPoint(NEEDLE_INSET, angle),
    outer: polarPoint(NEEDLE_LENGTH, angle),
  };
}

const bandClassNames: Record<2 | 3 | 4, string | undefined> = {
  2: styles.band2,
  3: styles.band3,
  4: styles.band4,
};

export default function DialWheel({
  leftLabel,
  rightLabel,
  target = null,
  showTarget = false,
  guess = null,
  onGuessChange,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  function updateFromClientPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg || !onGuessChange) return;
    const rect = svg.getBoundingClientRect();
    const scale = VIEWBOX_WIDTH / rect.width;
    const localX = (clientX - rect.left) * scale;
    const localY = (clientY - rect.top) * scale;
    onGuessChange(valueFromPointer(localX, localY));
  }

  function handlePointerDown(e: PointerEvent) {
    if (!onGuessChange) return;
    draggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    updateFromClientPoint(e.clientX, e.clientY);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!draggingRef.current) return;
    updateFromClientPoint(e.clientX, e.clientY);
  }

  function handlePointerUp() {
    draggingRef.current = false;
  }

  const guessNeedle = guess !== null ? needlePoints(guess) : null;
  const targetNeedle =
    target !== null && showTarget ? needlePoints(target) : null;

  return (
    <div class={styles.wrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} 165`}
        class={`${styles.svg} ${onGuessChange ? styles.draggable : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <path d={describeArc(RADIUS, 0, 100)} class={styles.track} />

        {target !== null &&
          showTarget &&
          bandSegments(target).map((seg) => (
            <path
              key={`${seg.from}-${seg.to}`}
              d={describeArc(RADIUS, seg.from, seg.to)}
              class={bandClassNames[seg.points]}
            />
          ))}

        {targetNeedle && (
          <line
            x1={targetNeedle.inner.x}
            y1={targetNeedle.inner.y}
            x2={targetNeedle.outer.x}
            y2={targetNeedle.outer.y}
            class={`${styles.needle} ${styles.targetNeedle}`}
          />
        )}

        {guessNeedle && (
          <line
            x1={guessNeedle.inner.x}
            y1={guessNeedle.inner.y}
            x2={guessNeedle.outer.x}
            y2={guessNeedle.outer.y}
            class={`${styles.needle} ${styles.guessNeedle}`}
          />
        )}

        <circle cx={CENTER_X} cy={CENTER_Y} r={9} class={styles.pivot} />
      </svg>
      <div class={styles.labels}>
        <span>{rightLabel}</span>
        <span>{leftLabel}</span>
      </div>
    </div>
  );
}
