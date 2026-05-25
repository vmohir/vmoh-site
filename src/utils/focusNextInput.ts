// Move focus to the next visible text-like <input> in the document. Returns
// false when there is no next input (so the caller can fall back to the
// default behaviour — e.g. submit the form).
export function focusNextInput(current: HTMLElement): boolean {
  const selector =
    'input:not([disabled]):not([readonly]):not([tabindex="-1"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"])';
  const all = Array.from(
    document.querySelectorAll<HTMLInputElement>(selector),
  ).filter((el) => el.offsetParent !== null);
  const idx = all.indexOf(current as HTMLInputElement);
  if (idx === -1 || idx === all.length - 1) return false;
  all[idx + 1]!.focus();
  return true;
}
