const STORE_NAME = "yooco-waitlist";
const STORE_KEY = "emails/v1";
const CACHE_ORIGIN = "https://yooco-waitlist.invalid";
const MAX_ENTRIES = 5000;
const CACHE_TTL_SECONDS = 400 * 24 * 3600;

export type WaitlistEntry = {
  email: string;
  createdAt: string;
};

type WaitlistDoc = {
  version: 1;
  entries: WaitlistEntry[];
};

type WaitlistStore = {
  read(): Promise<WaitlistDoc>;
  write(doc: WaitlistDoc): Promise<void>;
};

export type WaitlistSaveResult = "saved" | "already" | "invalid" | "full" | "unavailable";

function emptyDoc(): WaitlistDoc {
  return { version: 1, entries: [] };
}

export function normalizeWaitlistEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 120) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

function normalizeDoc(raw: unknown): WaitlistDoc {
  if (!raw || typeof raw !== "object") return emptyDoc();
  const entries = (raw as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return emptyDoc();
  const seen = new Set<string>();
  const next: WaitlistEntry[] = [];
  for (const item of entries) {
    if (!item || typeof item !== "object") continue;
    const email = normalizeWaitlistEmail((item as WaitlistEntry).email);
    const createdAt = (item as WaitlistEntry).createdAt;
    if (!email || seen.has(email)) continue;
    if (typeof createdAt !== "string" || !createdAt) continue;
    seen.add(email);
    next.push({ email, createdAt });
    if (next.length >= MAX_ENTRIES) break;
  }
  return { version: 1, entries: next };
}

function memorySlot(): { doc: WaitlistDoc } {
  const g = globalThis as typeof globalThis & { __yoocoWaitlist?: { doc: WaitlistDoc } };
  if (!g.__yoocoWaitlist) g.__yoocoWaitlist = { doc: emptyDoc() };
  return g.__yoocoWaitlist;
}

function openMemoryStore(): WaitlistStore {
  return {
    async read() {
      return normalizeDoc(memorySlot().doc);
    },
    async write(doc) {
      memorySlot().doc = doc;
    },
  };
}

function isCloudflareWorker(): boolean {
  return Boolean((globalThis as { caches?: { default?: unknown } }).caches?.default);
}

function cacheRequest(): Request {
  return new Request(`${CACHE_ORIGIN}/${STORE_KEY}`, { method: "GET" });
}

function openCacheStore(): WaitlistStore {
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  return {
    async read() {
      const hit = await cache.match(cacheRequest());
      if (!hit) return emptyDoc();
      try {
        return normalizeDoc(await hit.json());
      } catch {
        return emptyDoc();
      }
    },
    async write(doc) {
      await cache.put(
        cacheRequest(),
        new Response(JSON.stringify(doc), {
          headers: {
            "content-type": "application/json",
            "cache-control": `max-age=${CACHE_TTL_SECONDS}`,
          },
        }),
      );
    },
  };
}

async function openBlobStore(): Promise<WaitlistStore> {
  const { getStore } = await import("@edgeone/pages-blob");
  const store = await getStore(STORE_NAME);
  return {
    async read() {
      const value = await store.get(STORE_KEY, { type: "json", consistency: "strong" });
      return normalizeDoc(value);
    },
    async write(doc) {
      await store.setJSON(STORE_KEY, doc);
    },
  };
}

async function openStore(): Promise<{ store: WaitlistStore; durable: boolean }> {
  if (isCloudflareWorker()) return { store: openCacheStore(), durable: true };
  try {
    return { store: await openBlobStore(), durable: true };
  } catch (error) {
    console.warn("[waitlist] Blob store unavailable, using memory", error);
    return { store: openMemoryStore(), durable: false };
  }
}

function memoryAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function saveWaitlistEmail(value: unknown): Promise<WaitlistSaveResult> {
  const email = normalizeWaitlistEmail(value);
  if (!email) return "invalid";

  let opened: { store: WaitlistStore; durable: boolean };
  try {
    opened = await openStore();
  } catch (error) {
    console.warn("[waitlist] store unavailable", error);
    return "unavailable";
  }
  if (!opened.durable && !memoryAllowed()) return "unavailable";

  try {
    const doc = await opened.store.read();
    if (doc.entries.some((entry) => entry.email === email)) return "already";
    if (doc.entries.length >= MAX_ENTRIES) return "full";
    doc.entries.push({ email, createdAt: new Date().toISOString() });
    await opened.store.write(doc);
    return "saved";
  } catch (error) {
    console.warn("[waitlist] save failed", error);
    return "unavailable";
  }
}

export async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const { store } = await openStore();
    const doc = await store.read();
    return doc.entries;
  } catch (error) {
    console.warn("[waitlist] read failed", error);
    return [];
  }
}
