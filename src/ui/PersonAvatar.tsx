import type { Person } from "../splitApp/split.types.ts";
import { people } from "../state/billState";
import styles from "./PersonAvatar.module.css";

// Fixed, ordered palette: the Nth person in the list gets the Nth colour,
// wrapping once the palette is exhausted. Simple and collision-free for small
// groups. Each entry pairs a background with a readable text colour.
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

export const PersonAvatar = ({ person }: PersonAvatarProps) => {
  const initials = person.name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const index = people.value.findIndex((p) => p.id === person.id);
  const { bg, text } = PALETTE[(index < 0 ? 0 : index) % PALETTE.length]!;

  return <div class={`${styles.avatar} ${bg} ${text}`}>{initials}</div>;
};
