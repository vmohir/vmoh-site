export interface GameEntry {
  slug: string;
  title: string;
  description: string;
}

export const GAMES: GameEntry[] = [
  {
    slug: "pantomime",
    title: "پانتومیم",
    description: "یک کلمه رو بدون حرف زدن نشون بده تا تیمت حدس بزنه.",
  },
  {
    slug: "dor",
    title: "دور",
    description: "یک کلمه رو توضیح بده، بدون اینکه خودش رو بگی.",
  },
  {
    slug: "adad",
    title: "عدد مخفی",
    description:
      "یکی از شما یه عدد رو نمی‌دونه؛ بقیه با بحث کمکش کنن حدس بزنه.",
  },
];
