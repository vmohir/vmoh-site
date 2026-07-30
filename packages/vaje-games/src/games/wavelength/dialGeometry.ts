// Semicircle gauge math. Value 0-100 maps to a sweep from 180° (left) to 0°
// (right) in standard math convention (0° = +x axis, angle grows
// counter-clockwise) — 50 sits straight up at 90°.
export const CENTER_X = 150;
export const CENTER_Y = 150;
export const RADIUS = 128;

export function angleForValue(value: number): number {
  return 180 - (value / 100) * 180;
}

export function valueForAngle(angleDeg: number): number {
  return ((180 - angleDeg) / 180) * 100;
}

export function polarPoint(
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y - radius * Math.sin(rad),
  };
}

// SVG arc path for the band between two 0-100 values, drawn at `radius`.
export function describeArc(
  radius: number,
  fromValue: number,
  toValue: number,
): string {
  const startAngle = angleForValue(Math.min(fromValue, toValue));
  const endAngle = angleForValue(Math.max(fromValue, toValue));
  const start = polarPoint(radius, startAngle);
  const end = polarPoint(radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

// Converts a pointer position (relative to the SVG element's bounding box,
// in viewBox units) into a clamped 0-100 dial value.
export function valueFromPointer(localX: number, localY: number): number {
  const dx = localX - CENTER_X;
  const dy = CENTER_Y - localY;
  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angleDeg < 0) angleDeg = 0;
  if (angleDeg > 180) angleDeg = 180;
  const value = valueForAngle(angleDeg);
  return Math.max(0, Math.min(100, Math.round(value)));
}
