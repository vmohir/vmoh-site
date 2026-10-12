import { useEffect, useRef, useState } from "preact/hooks";
import {
  Download,
  Loader2,
  NotebookText,
  ReceiptText,
  Share2,
  X,
} from "lucide-preact";
import {
  adjustments,
  baseCurrency,
  exchangeRates,
  groups,
  hasMultipleCurrencies,
  hasMultiplePayers,
  items,
  people,
  settlementAlgorithm,
  useExchangeRates,
} from "../state/billState";
import {
  buildRemoteShareUrl,
  buildSharePayload,
  buildShareUrl,
} from "../utils/share.ts";
import { BillReport, type ReportVariant } from "./BillReport.tsx";
import { ShareModal } from "./ShareModal.tsx";
import styles from "./ReportExport.module.css";

const BUTTONS: {
  variant: ReportVariant;
  label: string;
  Icon: typeof ReceiptText;
}[] = [
  { variant: "receipt", label: "Receipt", Icon: ReceiptText },
  { variant: "full", label: "Full report", Icon: NotebookText },
];

// Two report flavours, each rasterised from an off-screen BillReport to a PNG
// and previewed with Share / Save, plus a share-link button alongside them.
export function ReportExport() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<ReportVariant>("receipt");
  const [capturing, setCapturing] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const [buildingShare, setBuildingShare] = useState(false);
  const [shareModal, setShareModal] = useState<{
    url: string;
    expires: boolean;
  } | null>(null);
  const handleShare = async () => {
    if (buildingShare) return;
    setBuildingShare(true);
    const payload = buildSharePayload({
      people: people.value,
      items: items.value,
      adjustments: adjustments.value,
      baseCurrency: baseCurrency.value,
      settlementAlgorithm: settlementAlgorithm.value,
      hasMultipleCurrencies: hasMultipleCurrencies.value,
      hasMultiplePayers: hasMultiplePayers.value,
      useExchangeRates: useExchangeRates.value,
      exchangeRates: exchangeRates.value,
      groups: groups.value,
    });
    let url: string;
    let expires = true;
    try {
      url = await buildRemoteShareUrl(payload);
    } catch (e) {
      console.error("Share backend unavailable, using an offline link:", e);
      expires = false;
      try {
        url = await buildShareUrl(payload);
      } catch (e2) {
        console.error("Failed to build share URL:", e2);
        setBuildingShare(false);
        return;
      }
    }
    setBuildingShare(false);
    setShareModal({ url, expires });
  };

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
      <span class={styles.heading}>Share &amp; export</span>
      <div class={styles.group}>
        <button
          type="button"
          class={styles.reportBtn}
          disabled={buildingShare}
          onClick={handleShare}
        >
          {buildingShare ? (
            <Loader2 size={18} aria-hidden="true" class={styles.spin} />
          ) : (
            <Share2 size={18} aria-hidden="true" />
          )}
          <span>Share</span>
        </button>
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

      {shareModal && (
        <ShareModal
          url={shareModal.url}
          expires={shareModal.expires}
          onClose={() => setShareModal(null)}
        />
      )}
    </div>
  );
}
