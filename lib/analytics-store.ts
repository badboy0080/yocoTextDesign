import { getAnalyticsToken } from "./runtime-env";

export const FUNNEL_EVENTS = ["visit", "trial_click", "optimize_ok"] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export type EventCounts = { pv: number; uv: number };

export type FunnelDay = {
  date: string;
  visit: EventCounts;
  trial_click: EventCounts;
  optimize_ok: EventCounts;
};

export type FunnelMetrics = {
  timezone: "Asia/Shanghai";
  days: FunnelDay[];
  totals: {
    visit: EventCounts;
    trial_click: EventCounts;
    optimize_ok: EventCounts;
  };
};

type EventBucket = { pv: number; uv: string[] };

type DayRecord = Record<FunnelEvent, EventBucket>;

type StoreDoc = {
  version: 1;
  days: Record<string, DayRecord>;
};

const STORE_NAME = "yooco-analytics";
const STORE_KEY = "funnel/v1";
const CACHE_ORIGIN = "https://yooco-analytics.invalid";
const KEEP_DAYS = 60;
const MAX_UV_PER_EVENT = 8000;
const CACHE_TTL_SECONDS = KEEP_DAYS * 24 * 3600;

type AnalyticsStore = {
  read(): Promise<StoreDoc>;
  write(doc: StoreDoc): Promise<void>;
};

function emptyBucket(): EventBucket {
  return { pv: 0, uv: [] };
}

function emptyDay(): DayRecord {
  return {
    visit: emptyBucket(),
    trial_click: emptyBucket(),
    optimize_ok: emptyBucket(),
  };
}

function emptyDoc(): StoreDoc {
  return { version: 1, days: {} };
}

function beijingDateKey(now = Date.now()): string {
  return new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

function isFunnelEvent(value: unknown): value is FunnelEvent {
  return typeof value === "string" && (FUNNEL_EVENTS as readonly string[]).includes(value);
}

export function parseFunnelEvent(value: unknown): FunnelEvent | null {
  return isFunnelEvent(value) ? value : null;
}

export function sanitizeDeviceId(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 80);
  if (!/^[A-Za-z0-9._:-]{8,80}$/.test(trimmed)) return "";
  return trimmed;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function tokenFromRequest(request: Request): string {
  const header = request.headers.get("x-analytics-token")?.trim() || "";
  if (header) return header;
  try {
    return new URL(request.url).searchParams.get("token")?.trim() || "";
  } catch {
    return "";
  }
}

export function metricsAuthState(request: Request): "ok" | "missing-config" | "unauthorized" {
  const expected = getAnalyticsToken();
  if (!expected) return "missing-config";
  const provided = tokenFromRequest(request);
  return timingSafeEqual(provided, expected) ? "ok" : "unauthorized";
}

function isCloudflareWorker(): boolean {
  return Boolean((globalThis as { caches?: { default?: unknown } }).caches?.default);
}

function cacheRequest(): Request {
  return new Request(`${CACHE_ORIGIN}/${STORE_KEY}`, { method: "GET" });
}

function normalizeDoc(raw: unknown): StoreDoc {
  if (!raw || typeof raw !== "object") return emptyDoc();
  const days = (raw as { days?: unknown }).days;
  if (!days || typeof days !== "object") return emptyDoc();
  const doc = emptyDoc();
  for (const [date, value] of Object.entries(days as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== "object") continue;
    const day = emptyDay();
    for (const event of FUNNEL_EVENTS) {
      const bucket = (value as Record<string, unknown>)[event];
      if (!bucket || typeof bucket !== "object") continue;
      const pv = Number((bucket as EventBucket).pv);
      const uv = Array.isArray((bucket as EventBucket).uv)
        ? (bucket as EventBucket).uv.filter((id) => typeof id === "string")
        : [];
      day[event] = {
        pv: Number.isFinite(pv) && pv > 0 ? Math.floor(pv) : 0,
        uv: uv.slice(0, MAX_UV_PER_EVENT),
      };
    }
    doc.days[date] = day;
  }
  return doc;
}

function pruneDays(doc: StoreDoc, today = beijingDateKey()): StoreDoc {
  const dates = Object.keys(doc.days).sort();
  const cutoff = dates.filter((date) => date <= today).slice(-KEEP_DAYS);
  const allowed = new Set(cutoff);
  const next = emptyDoc();
  for (const date of cutoff) next.days[date] = doc.days[date];
  for (const date of dates) {
    if (!allowed.has(date) && date > today) next.days[date] = doc.days[date];
  }
  return next;
}

function countsOf(bucket: EventBucket): EventCounts {
  return { pv: bucket.pv, uv: bucket.uv.length };
}

function mergeUnique(target: Set<string>, ids: string[]) {
  for (const id of ids) target.add(id);
}

export function summarizeDoc(doc: StoreDoc): FunnelMetrics {
  const dates = Object.keys(doc.days).sort().reverse();
  const days: FunnelDay[] = dates.map((date) => {
    const record = doc.days[date] ?? emptyDay();
    return {
      date,
      visit: countsOf(record.visit),
      trial_click: countsOf(record.trial_click),
      optimize_ok: countsOf(record.optimize_ok),
    };
  });

  const totalsPv: Record<FunnelEvent, number> = {
    visit: 0,
    trial_click: 0,
    optimize_ok: 0,
  };
  const totalsUv: Record<FunnelEvent, Set<string>> = {
    visit: new Set(),
    trial_click: new Set(),
    optimize_ok: new Set(),
  };
  for (const date of dates) {
    const record = doc.days[date];
    if (!record) continue;
    for (const event of FUNNEL_EVENTS) {
      totalsPv[event] += record[event].pv;
      mergeUnique(totalsUv[event], record[event].uv);
    }
  }

  return {
    timezone: "Asia/Shanghai",
    days,
    totals: {
      visit: { pv: totalsPv.visit, uv: totalsUv.visit.size },
      trial_click: { pv: totalsPv.trial_click, uv: totalsUv.trial_click.size },
      optimize_ok: { pv: totalsPv.optimize_ok, uv: totalsUv.optimize_ok.size },
    },
  };
}

function applyEvent(doc: StoreDoc, event: FunnelEvent, deviceId: string, now = Date.now()): StoreDoc {
  const next = pruneDays(doc);
  const date = beijingDateKey(now);
  const day = next.days[date] ?? emptyDay();
  const bucket = day[event];
  bucket.pv += 1;
  if (deviceId && bucket.uv.length < MAX_UV_PER_EVENT && !bucket.uv.includes(deviceId)) {
    bucket.uv.push(deviceId);
  }
  day[event] = bucket;
  next.days[date] = day;
  return pruneDays(next, date);
}

function memorySlot(): { doc: StoreDoc } {
  const g = globalThis as typeof globalThis & { __yoocoFunnel?: { doc: StoreDoc } };
  if (!g.__yoocoFunnel) g.__yoocoFunnel = { doc: emptyDoc() };
  return g.__yoocoFunnel;
}

function openMemoryStore(): AnalyticsStore {
  return {
    async read() {
      return normalizeDoc(memorySlot().doc);
    },
    async write(doc) {
      memorySlot().doc = doc;
    },
  };
}

function openCacheStore(): AnalyticsStore {
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

async function openBlobStore(): Promise<AnalyticsStore> {
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

async function openStore(): Promise<AnalyticsStore | null> {
  if (isCloudflareWorker()) return openCacheStore();
  try {
    return await openBlobStore();
  } catch (error) {
    console.warn("[analytics] Blob store unavailable, using memory", error);
    return openMemoryStore();
  }
}

export async function recordFunnelEvent(event: FunnelEvent, deviceId: string): Promise<void> {
  let store: AnalyticsStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[analytics] store unavailable, skip", error);
    return;
  }
  if (!store) return;

  try {
    const current = await store.read();
    await store.write(applyEvent(current, event, deviceId));
  } catch (error) {
    console.warn("[analytics] record failed, skip", error);
  }
}

export async function readFunnelMetrics(): Promise<FunnelMetrics> {
  let store: AnalyticsStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[analytics] store unavailable, empty metrics", error);
    return summarizeDoc(emptyDoc());
  }
  if (!store) return summarizeDoc(emptyDoc());
  try {
    return summarizeDoc(await store.read());
  } catch (error) {
    console.warn("[analytics] read failed, empty metrics", error);
    return summarizeDoc(emptyDoc());
  }
}
