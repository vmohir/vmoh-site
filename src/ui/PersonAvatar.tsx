import type { Person } from "../SplitApp/split.types.ts";
import styles from "./PersonAvatar.module.css";

const darkColors = [
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
const lightColors = [
  "bg-red-300",
  "bg-orange-300",
  "bg-amber-300",
  "bg-yellow-300",
  "bg-lime-300",
  "bg-green-300",
  "bg-emerald-300",
  "bg-teal-300",
  "bg-cyan-300",
  "bg-sky-300",
  "bg-blue-300",
  "bg-indigo-300",
  "bg-violet-300",
  "bg-purple-300",
  "bg-fuchsia-300",
  "bg-pink-300",
  "bg-rose-300",
  "bg-slate-300",
];
const COLORS_COUNT = darkColors.length + lightColors.length;

interface PersonAvatarProps {
  person: Person;
}

export const PersonAvatar = ({ person }: PersonAvatarProps) => {
  const initials = person.name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const idIndex = person.id
    .split("-")
    .pop()!
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 1);
  const colorIndex = idIndex % COLORS_COUNT;

  const isDarkBg = colorIndex < darkColors.length;
  const backgroundColor = isDarkBg
    ? darkColors[colorIndex]
    : lightColors[colorIndex - darkColors.length];
  const textColor = isDarkBg ? "text-white" : "text-black";

  return (
    <div class={`${styles.avatar} ${backgroundColor} ${textColor}`}>
      {initials}
    </div>
  );
};
