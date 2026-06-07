import type { Person } from "../splitApp/split.types.ts";
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

export const PersonAvatar = ({ person }: PersonAvatarProps) => {
  const initials = person.name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const { bg, text } = PALETTE[hashId(person.id)]!;

  return <div class={`${styles.avatar} ${bg} ${text}`}>{initials}</div>;
};
