// Stores and retrieves shared bill payloads in Upstash Redis so share links
// can carry a short id instead of the full gzipped state. Requires
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to be set in the
// Netlify site's environment (free tier at upstash.com). If they're missing
// or the request fails, callers get a non-2xx response and the frontend
// falls back to an inline (offline) share link.

const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_PAYLOAD_BYTES = 200_000;
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const ID_LENGTH = 10;
const ID_PATTERN = /^[A-Za-z0-9]{1,32}$/;

function randomId(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ID_ALPHABET[bytes[i]! % ID_ALPHABET.length];
  }
  return id;
}

// Upstash's REST API accepts any Redis command as a JSON array posted to the
// base URL, which avoids having to URL-encode arbitrary JSON into a path.
async function redisCommand(command: unknown[]): Promise<unknown> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) {
    throw new Error("Upstash env vars are not configured");
  }
  const res = await fetch(base, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    throw new Error(`Upstash request failed: ${res.status}`);
  }
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

async function handlePost(req: Request): Promise<Response> {
  const json = await req.text();
  if (new TextEncoder().encode(json).byteLength > MAX_PAYLOAD_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }
  try {
    JSON.parse(json);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const id = randomId();
  const result = await redisCommand([
    "SET",
    `share:${id}`,
    json,
    "EX",
    String(TTL_SECONDS),
  ]);
  if (result !== "OK") {
    return new Response("Failed to store share", { status: 502 });
  }
  return Response.json({ id, expiresInDays: 30 });
}

async function handleGet(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !ID_PATTERN.test(id)) {
    return new Response("Missing or invalid id", { status: 400 });
  }
  const result = await redisCommand(["GET", `share:${id}`]);
  if (typeof result !== "string") {
    return new Response("Not found or expired", { status: 404 });
  }
  return new Response(result, {
    headers: { "content-type": "application/json" },
  });
}

export default async (req: Request): Promise<Response> => {
  try {
    if (req.method === "POST") return await handlePost(req);
    if (req.method === "GET") return await handleGet(req);
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    console.error("share function error:", e);
    return new Response("Share backend unavailable", { status: 500 });
  }
};

export const config = { path: "/api/share" };
