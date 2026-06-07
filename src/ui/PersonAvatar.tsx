import type { Person } from "../splitApp/split.types.ts";
import { people } from "../state/billState";
import styles from "./PersonAvatar.module.css";

// Fixed palette. A person's colour is picked by hashing their id so the
// assignment stays stable across reorders and renames — only adding or
// removing a person can change anyone's colour, never moving them around.
const PALETTE = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-amber-400", text: "text-black" },
  { bg: "bg-rose-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
  { bg: "bg-cyan-400", text: "text-black" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-lime-400", text: "text-black" },
  { bg: "bg-fuchsia-500", text: "text-white" },
  { bg: "bg-sky-500", text: "text-white" },
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-green-600", text: "text-white" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-yellow-400", text: "text-black" },
  { bg: "bg-blue-700", text: "text-white" },
  { bg: "bg-pink-300", text: "text-black" },
  { bg: "bg-teal-300", text: "text-black" },
];

interface PersonAvatarProps {
  person: Person;
}

// djb2 — fast, deterministic, well-distributed for short strings.
function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = (h * 33) ^ id.charCodeAt(i);
  // `>>> 0` coerces to unsigned 32-bit so the modulo isn't negative.
  return (h >>> 0) % PALETTE.length;
}

function defaultInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

// First three letters of the name (spaces stripped), capitalized as
// Tt-style so "mohammad" and "Mohammad" both read as "Moh".
function threeLetterPrefix(name: string): string {
  const condensed = name.replace(/\s+/g, "").slice(0, 3);
  if (!condensed) return "";
  return condensed.charAt(0).toUpperCase() + condensed.slice(1).toLowerCase();
}

// Avatars default to one or two-letter initials. When another person shares
// the same default initials we try a 3-letter prefix; we only commit to it
// when it actually distinguishes this person from every collider. So
// "Mohammad" + "Mojtaba" become "Moh" + "Moj", but "Mohammad" +
// "MohammadAli" (3-letter prefix collides) both stay as "M".
function computeAvatarLabel(person: Person, all: Person[]): string {
  const mine = defaultInitials(person.name);
  const colliders = all.filter(
    (p) => p.id !== person.id && defaultInitials(p.name) === mine,
  );
  if (colliders.length === 0) return mine;

  const myPrefix = threeLetterPrefix(person.name);
  if (myPrefix.length < 3) return mine;
  const ambiguous = colliders.some(
    (p) => threeLetterPrefix(p.name) === myPrefix,
  );
  return ambiguous ? mine : myPrefix;
}

export const PersonAvatar = ({ person }: PersonAvatarProps) => {
  const label = computeAvatarLabel(person, people.value);
  const { bg, text } = PALETTE[hashId(person.id)]!;
  const cls = `${styles.avatar} ${label.length >= 3 ? styles.condensed : ""} ${bg} ${text}`;

  return <div class={cls}>{label}</div>;
};
