import { useEffect, useRef, useState } from "preact/hooks";
import {
  Download,
  NotebookText,
  ReceiptText,
  Share2,
  Wallet,
  X,
} from "lucide-preact";
import { BillReport, type ReportVariant } from "./BillReport.tsx";
import styles from "./ReportExport.module.css";

const BUTTONS: {
  variant: ReportVariant;
  label: string;
  Icon: typeof Wallet;
}[] = [
  { variant: "summary", label: "Summary", Icon: Wallet },
  { variant: "receipt", label: "Receipt", Icon: ReceiptText },
  { variant: "full", label: "Full report", Icon: NotebookText },
];

// Three report flavours, each rasterised from an off-screen BillReport to a PNG
// and previewed with Share / Save.
export function ReportExport() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<ReportVariant>("summary");
  const [capturing, setCapturing] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  // Rasterise after the off-screen report has rendered the requested variant.
  useEffect(() => {
    if (!capturing || !reportRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const { toPng } = await import("html-to-image");
        const url = await toPng(reportRef.current!, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });
        if (!cancelled) setDataUrl(url);
      } catch (e) {
        console.error("Failed to render report image:", e);
      } finally {
        if (!cancelled) setCapturing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [capturing, variant]);

  const requestCapture = (v: ReportVariant) => {
    if (capturing) return;
    setVariant(v);
    setCapturing(true);
  };

  const download = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `split-bill-${variant}.png`;
    link.click();
  };

  const share = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `split-bill-${variant}.png`, {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Split Bill" });
        return;
      }
    } catch {
      // dismissed or unsupported — fall back to download
    }
    download();
  };

  return (
    <div class={styles.wrap}>
      <span class={styles.heading}>Export report</span>
      <div class={styles.group}>
        {BUTTONS.map(({ variant: v, label, Icon }) => (
          <button
            key={v}
            type="button"
            class={styles.reportBtn}
            disabled={capturing}
            onClick={() => requestCapture(v)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Off-screen rasterisation source. */}
      <div class={styles.offscreen} aria-hidden="true">
        <div ref={reportRef}>
          <BillReport variant={variant} />
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
    </div>
  );
}
