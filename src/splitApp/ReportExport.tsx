import { useRef, useState } from "preact/hooks";
import { Download, ImageDown, Share2, X } from "lucide-preact";
import { BillReport } from "./BillReport.tsx";
import styles from "./ReportExport.module.css";

// "Save as image": rasterises an off-screen BillReport to a PNG, then previews
// it with Share (native sheet, great on mobile) / Save options.
export function ReportExport() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!reportRef.current || busy) return;
    setBusy(true);
    try {
      // Dynamic import keeps html-to-image out of the initial bundle / SSR.
      const { toPng } = await import("html-to-image");
      const url = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      setDataUrl(url);
    } catch (e) {
      console.error("Failed to render report image:", e);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "split-bill.png";
    link.click();
  };

  const share = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "split-bill.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Split Bill" });
        return;
      }
    } catch {
      // user dismissed or sharing unsupported — fall back to a download
    }
    download();
  };

  return (
    <>
      <button
        type="button"
        class={styles.trigger}
        onClick={generate}
        disabled={busy}
      >
        <ImageDown size={16} aria-hidden="true" />
        {busy ? "Generating…" : "Save as image"}
      </button>

      {/* Off-screen rasterisation source. */}
      <div class={styles.offscreen} aria-hidden="true">
        <div ref={reportRef}>
          <BillReport />
        </div>
      </div>

      {dataUrl && (
        <div class={styles.overlay} onClick={() => setDataUrl(null)}>
          <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
            <img class={styles.preview} src={dataUrl} alt="Bill report" />
            <div class={styles.actions}>
              <button type="button" class={styles.action} onClick={share}>
                <Share2 size={16} aria-hidden="true" />
                Share
              </button>
              <button type="button" class={styles.action} onClick={download}>
                <Download size={16} aria-hidden="true" />
                Save
              </button>
              <button
                type="button"
                class={styles.close}
                aria-label="Close"
                onClick={() => setDataUrl(null)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
