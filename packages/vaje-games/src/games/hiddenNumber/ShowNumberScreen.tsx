import styles from "./ShowNumberScreen.module.css";

interface Props {
  guesserName: string;
  number: number;
  onSeen: () => void;
}

export default function ShowNumberScreen({
  guesserName,
  number,
  onSeen,
}: Props) {
  return (
    <div class={styles.screen}>
      <p class={styles.warning}>این صفحه رو به {guesserName} نشون نده!</p>
      <p class="text-secondary">عدد اینه</p>
      <span class={styles.number}>{number}</span>
      <p class="text-secondary">
        این عدد رو حفظ کنید. الان چند تا سوال میاد که خودِ عدد توشون نیست.
      </p>
      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onSeen}
      >
        دیدیم، بریم سراغ سوال‌ها
      </button>
    </div>
  );
}
