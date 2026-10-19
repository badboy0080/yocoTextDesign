import { randomBytes } from "node:crypto";

/** 每人最多留这么多条，更早的丢掉。 */
export const HISTORY_KEEP = 30;
/** 继续编辑用的正文上限。再长会截断，避免一条记录撑爆存储。 */
export const HISTORY_SOURCE_MAX = 40_000;
export const HISTORY_EXCERPT_MAX = 80;
export const HISTORY_TITLE_MAX = 40;
const HISTORY_LABEL_MAX = 16;
const HISTORY_DOC_MAX_CHARS = 500_000;
const PARAM_LIMIT = 80;
const PARAM_STRING_MAX = 48;

const STORE_NAME = "yooco-layout-history";
const CACHE_ORIGIN = "https://yooco-layout-history.invalid";
const CACHE_TTL_SECONDS = 400 * 24 * 3600;

export type HistorySummary = {
  id: string;
  createdAt: string;
  title: string;
  excerpt: string;
  theme: string;
  themeLabel: string;
};

export type HistoryRecord = HistorySummary & {
  source: string;
  params: Record<string, string | number | boolean>;
};

type HistoryDoc = {
  version: 1;
  items: HistoryRecord[];
};

type HistoryStore = {
  read(userId: number): Promise<HistoryDoc>;
  write(userId: number, doc: HistoryDoc): Promise<void>;
};

export type HistorySaveInput = {
  source?: unknown;
  excerpt?: unknown;
  title?: unknown;
  theme?: unknown;
  themeLabel?: unknown;
  params?: unknown;
};

function emptyDoc(): HistoryDoc {
  return { version: 1, items: [] };
}

function userKey(userId: number): string {
  return `user/${userId}`;
}

function cleanLine(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanSource(value: string): string {
  return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n").trim().slice(0, HISTORY_SOURCE_MAX);
}

function titleFromSource(source: string): string {
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    const text = cleanLine((heading ? heading[1] : line).replace(/[*_`>#]/g, ""), HISTORY_TITLE_MAX);
    if (text) return text;
  }
  return "未命名";
}

function excerptFrom(value: string): string {
  const flat = cleanLine(value, 400);
  if (!flat) return "";
  const sentence = flat.split(/[。！？!?]/)[0] || flat;
  return cleanLine(sentence, HISTORY_EXCERPT_MAX);
}

function cleanToken(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const token = value.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,32}$/.test(token)) return fallback;
  return token;
}

export function sanitizeHistoryParams(value: unknown): Record<string, string | number | boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const params: Record<string, string | number | boolean> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (Object.keys(params).length >= PARAM_LIMIT) break;
    if (!/^[A-Za-z][A-Za-z0-9]{0,40}$/.test(key)) continue;
    if (typeof raw === "boolean") {
      params[key] = raw;
      continue;
    }
    if (typeof raw === "number" && Number.isFinite(raw) && Math.abs(raw) < 1_000_000) {
      params[key] = raw;
      continue;
    }
    if (typeof raw === "string") {
      const text = raw.replace(/[\u0000-\u001f]+/g, "").trim().slice(0, PARAM_STRING_MAX);
      if (text) params[key] = text;
    }
  }
  return params;
}

/** 把客户端送来的一条整理成可存的记录。正文为空则无效。 */
export function prepareHistoryRecord(input: HistorySaveInput, now = new Date()): HistoryRecord | null {
  const source = typeof input.source === "string" ? cleanSource(input.source) : "";
  if (!source) return null;
  const excerptSource = typeof input.excerpt === "string" && input.excerpt.trim()
    ? input.excerpt
    : source;
  const givenTitle = typeof input.title === "string" ? cleanLine(input.title, HISTORY_TITLE_MAX) : "";
  return {
    id: randomBytes(8).toString("hex"),
    createdAt: now.toISOString(),
    title: givenTitle || titleFromSource(source),
    excerpt: excerptFrom(excerptSource) || excerptFrom(source) || "（没有可预览的文字）",
    theme: cleanToken(input.theme, "classic"),
    themeLabel: (typeof input.themeLabel === "string" && cleanLine(input.themeLabel, HISTORY_LABEL_MAX))
      || "经典",
    source,
    params: sanitizeHistoryParams(input.params),
  };
}

export function summarizeHistory(item: HistoryRecord): HistorySummary {
  return {
    id: item.id,
    createdAt: item.createdAt,
    title: item.title,
    excerpt: item.excerpt,
    theme: item.theme,
    themeLabel: item.themeLabel,
  };
}

function sameLayout(left: HistoryRecord, right: HistoryRecord): boolean {
  return left.source === right.source && left.theme === right.theme && left.themeLabel === right.themeLabel;
}

/** 新的放最前。和最新一条正文、主题都一样就不重复记。超出条数或体积就丢掉更早的。 */
export function appendHistoryItem(doc: HistoryDoc, item: HistoryRecord): { doc: HistoryDoc; created: boolean } {
  const newest = doc.items[0];
  if (newest && sameLayout(newest, item)) {
    return { doc, created: false };
  }
  const items = [item, ...doc.items].slice(0, HISTORY_KEEP);
  let next: HistoryDoc = { version: 1, items };
  while (next.items.length > 1 && JSON.stringify(next).length > HISTORY_DOC_MAX_CHARS) {
    next = { version: 1, items: next.items.slice(0, -1) };
  }
  return { doc: next, created: true };
}

function normalizeRecord(value: unknown): HistoryRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<HistoryRecord>;
  if (typeof raw.id !== "string" || !/^[a-f0-9]{16}$/.test(raw.id)) return null;
  if (typeof raw.createdAt !== "string" || Number.isNaN(Date.parse(raw.createdAt))) return null;
  if (typeof raw.source !== "string" || !raw.source.trim()) return null;
  const prepared = prepareHistoryRecord({
    source: raw.source,
    excerpt: raw.excerpt,
    title: raw.title,
    theme: raw.theme,
    themeLabel: raw.themeLabel,
    params: raw.params,
  }, new Date(raw.createdAt));
  if (!prepared) return null;
  return { ...prepared, id: raw.id, createdAt: new Date(raw.createdAt).toISOString() };
}

function normalizeDoc(value: unknown): HistoryDoc {
  if (!value || typeof value !== "object") return emptyDoc();
  const items = Array.isArray((value as HistoryDoc).items) ? (value as HistoryDoc).items : [];
  const next: HistoryRecord[] = [];
  for (const item of items) {
    const record = normalizeRecord(item);
    if (record) next.push(record);
    if (next.length >= HISTORY_KEEP) break;
  }
  return { version: 1, items: next };
}

function memorySlot(): { docs: Record<string, HistoryDoc> } {
  const g = globalThis as typeof globalThis & { __yoocoLayoutHistory?: { docs: Record<string, HistoryDoc> } };
  if (!g.__yoocoLayoutHistory) g.__yoocoLayoutHistory = { docs: {} };
  return g.__yoocoLayoutHistory;
}

export function resetLayoutHistoryMemory(): void {
  memorySlot().docs = {};
}

function openMemoryStore(): HistoryStore {
  return {
    async read(userId) {
      return normalizeDoc(memorySlot().docs[userKey(userId)]);
    },
    async write(userId, doc) {
      memorySlot().docs[userKey(userId)] = doc;
    },
  };
}

function isCloudflareWorker(): boolean {
  return Boolean((globalThis as { caches?: { default?: unknown } }).caches?.default);
}

function cacheRequest(userId: number): Request {
  return new Request(`${CACHE_ORIGIN}/${userKey(userId)}`, { method: "GET" });
}

function openCacheStore(): HistoryStore {
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  return {
    async read(userId) {
      const hit = await cache.match(cacheRequest(userId));
      if (!hit) return emptyDoc();
      try {
        return normalizeDoc(await hit.json());
      } catch {
        return emptyDoc();
      }
    },
    async write(userId, doc) {
      await cache.put(
        cacheRequest(userId),
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

async function openBlobStore(): Promise<HistoryStore> {
  const { getStore } = await import("@edgeone/pages-blob");
  const store = await getStore(STORE_NAME);
  return {
    async read(userId) {
      const value = await store.get(userKey(userId), { type: "json", consistency: "strong" });
      return normalizeDoc(value);
    },
    async write(userId, doc) {
      await store.setJSON(userKey(userId), doc);
    },
  };
}

function memoryAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.YOOCO_HISTORY_MEMORY === "1";
}

async function openStore(): Promise<HistoryStore | null> {
  if (process.env.YOOCO_HISTORY_MEMORY === "1") return openMemoryStore();
  if (isCloudflareWorker()) return openCacheStore();
  try {
    return await openBlobStore();
  } catch (error) {
    console.warn("[layout-history] Blob store unavailable, using memory", error);
    if (!memoryAllowed()) return null;
    return openMemoryStore();
  }
}

let writeChain: Promise<unknown> = Promise.resolve();

function withHistoryLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function validHistoryId(value: string): boolean {
  return /^[a-f0-9]{16}$/.test(value);
}

export async function listLayoutHistory(userId: number): Promise<HistorySummary[] | null> {
  const store = await openStore();
  if (!store) return null;
  try {
    const doc = await store.read(userId);
    return doc.items.map(summarizeHistory);
  } catch (error) {
    console.warn("[layout-history] list failed", error);
    return null;
  }
}

export async function readLayoutHistory(userId: number, id: string): Promise<HistoryRecord | null | undefined> {
  if (!validHistoryId(id)) return undefined;
  const store = await openStore();
  if (!store) return null;
  try {
    const doc = await store.read(userId);
    return doc.items.find((item) => item.id === id);
  } catch (error) {
    console.warn("[layout-history] read failed", error);
    return null;
  }
}

export async function saveLayoutHistory(
  userId: number,
  input: HistorySaveInput,
): Promise<{ ok: true; item: HistorySummary; created: boolean } | { ok: false; reason: "invalid" | "unavailable" }> {
  const record = prepareHistoryRecord(input);
  if (!record) return { ok: false, reason: "invalid" };
  return withHistoryLock(async () => {
    const store = await openStore();
    if (!store) return { ok: false, reason: "unavailable" };
    try {
      const current = await store.read(userId);
      const { doc, created } = appendHistoryItem(current, record);
      if (created) await store.write(userId, doc);
      const saved = created ? record : current.items[0];
      return { ok: true, item: summarizeHistory(saved || record), created };
    } catch (error) {
      console.warn("[layout-history] save failed", error);
      return { ok: false, reason: "unavailable" };
    }
  });
}
