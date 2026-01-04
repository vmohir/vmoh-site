import type { Person } from "../types/models.ts";
import styles from "./PersonAvatar.module.css";

const colors = [
  "bg-red-800",
  "bg-orange-800",
  "bg-amber-800",
  "bg-yellow-800",
  "bg-lime-800",
  "bg-green-800",
  "bg-emerald-800",
  "bg-teal-800",
  "bg-cyan-800",
  "bg-sky-800",
  "bg-blue-800",
  "bg-indigo-800",
  "bg-violet-800",
  "bg-purple-800",
  "bg-fuchsia-800",
  "bg-pink-800",
  "bg-rose-800",
  "bg-slate-800",
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

  const colorIndex =
    person.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  const backgroundColor = colors[colorIndex];

  return <div class={`${styles.avatar} ${backgroundColor}`}>{initials}</div>;
};
