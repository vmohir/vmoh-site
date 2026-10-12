import { useState } from "preact/hooks";
import { Check, Copy, Share2, X } from "lucide-preact";
import styles from "./ShareModal.module.css";

interface ShareModalProps {
  url: string;
  expires: boolean;
  onClose: () => void;
}

export function ShareModal({ url, expires, onClose }: ShareModalProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch (e) {
      console.error("Failed to copy share URL:", e);
      window.prompt("Copy this link:", url);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Split Bill", url });
        onClose();
      } catch {
        // user dismissed or share failed — leave the modal open
      }
      return;
    }
    await copyLink();
  };

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div
        class={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Share bill"
        onClick={(e) => e.stopPropagation()}
      >
        <div class={styles.header}>
          <span class={styles.title}>Share bill</span>
          <button
            type="button"
            class={styles.close}
            aria-label="Close"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <input
          class={styles.linkInput}
          type="text"
          readOnly
          value={url}
          onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
        />

        <p class={styles.note}>
          {expires
            ? "This link expires in 30 days."
            : "The share backend wasn't reachable, so this link is long but never expires."}
        </p>

        <div class={styles.actions}>
          <button type="button" class={styles.action} onClick={copyLink}>
            {copyState === "copied" ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {copyState === "copied" ? "Copied" : "Copy link"}
          </button>
          <button type="button" class={styles.action} onClick={nativeShare}>
            <Share2 size={16} aria-hidden="true" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
