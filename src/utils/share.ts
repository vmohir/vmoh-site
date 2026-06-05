import type {
  Person,
  Item,
  Adjustment,
  Currency,
  SettlementAlgorithm,
  ItemPayer,
} from "../splitApp/split.types.ts";

const SHARE_VERSION = 1;
const HASH_PREFIX = "#data=";

interface SerializedItem {
  id: string;
  name: string;
  price: number;
  currency?: Currency;
  usedBy: string[];
  paidBy: [string, ItemPayer][];
  consumedBy?: [string, number][];
}

export interface SharePayload {
  v: number;
  people: Person[];
  items: SerializedItem[];
  adjustments: Adjustment[];
  baseCurrency: Currency;
  settlementAlgorithm: SettlementAlgorithm;
  hasMultipleCurrencies: boolean;
  hasMultiplePayers: boolean;
  // Optional for backwards compatibility with links created before exchange
  // rates existed.
  useExchangeRates?: boolean;
  exchangeRates?: Record<Currency, number>;
}

export function itemsToSerialized(items: Item[]): SerializedItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    currency: item.currency,
    usedBy: Array.from(item.usedBy),
    paidBy: Array.from(item.paidBy.entries()),
    consumedBy: Array.from(item.consumedBy.entries()),
  }));
}

export function itemsFromSerialized(items: SerializedItem[]): Item[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    currency: item.currency,
    usedBy: new Set(item.usedBy),
    paidBy: new Map(item.paidBy),
    consumedBy: new Map(item.consumedBy ?? []),
  }));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function gzip(input: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(input);
  const stream = new Response(encoded).body!.pipeThrough(
    new CompressionStream("gzip"),
  );
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  // Copy into a fresh ArrayBuffer to satisfy Response's BlobPart typing
  // regardless of whether the input view is backed by ArrayBuffer or
  // SharedArrayBuffer.
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const stream = new Response(ab).body!.pipeThrough(
    new DecompressionStream("gzip"),
  );
  return await new Response(stream).text();
}

export async function encodeSharePayload(
  payload: SharePayload,
): Promise<string> {
  const json = JSON.stringify(payload);
  const compressed = await gzip(json);
  return bytesToBase64Url(compressed);
}

export async function decodeSharePayload(
  encoded: string,
): Promise<SharePayload> {
  const bytes = base64UrlToBytes(encoded);
  const json = await gunzip(bytes);
  const parsed = JSON.parse(json) as SharePayload;
  if (!parsed || typeof parsed !== "object" || parsed.v !== SHARE_VERSION) {
    throw new Error("Unsupported share payload");
  }
  return parsed;
}

export function buildSharePayload(input: {
  people: Person[];
  items: Item[];
  adjustments: Adjustment[];
  baseCurrency: Currency;
  settlementAlgorithm: SettlementAlgorithm;
  hasMultipleCurrencies: boolean;
  hasMultiplePayers: boolean;
  useExchangeRates: boolean;
  exchangeRates: Record<Currency, number>;
}): SharePayload {
  return {
    v: SHARE_VERSION,
    people: input.people,
    items: itemsToSerialized(input.items),
    adjustments: input.adjustments,
    baseCurrency: input.baseCurrency,
    settlementAlgorithm: input.settlementAlgorithm,
    hasMultipleCurrencies: input.hasMultipleCurrencies,
    hasMultiplePayers: input.hasMultiplePayers,
    useExchangeRates: input.useExchangeRates,
    exchangeRates: input.exchangeRates,
  };
}

export async function buildShareUrl(payload: SharePayload): Promise<string> {
  const encoded = await encodeSharePayload(payload);
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${HASH_PREFIX}${encoded}`;
}

// Reads the current location.hash and returns the encoded portion if it
// matches our share format, otherwise null. Synchronous so callers can
// decide whether to defer signal hydration before doing the async decode.
export function readHashShare(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const encoded = hash.slice(HASH_PREFIX.length);
  return encoded || null;
}

// Strip the share fragment from the URL bar without triggering navigation.
export function clearHashShare(): void {
  if (typeof window === "undefined") return;
  if (!window.location.hash.startsWith(HASH_PREFIX)) return;
  const { origin, pathname, search } = window.location;
  window.history.replaceState(null, "", `${origin}${pathname}${search}`);
}
