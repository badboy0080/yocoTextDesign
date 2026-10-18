/** 后台改账号权限时留下的记录。不写密码。优先存 Blob，存不上就只打日志。 */

const STORE_NAME = "yooco-admin-audit";
const DOC_KEY = "events";
const MAX_EVENTS = 200;

type AccountPlan = "free" | "member" | "admin";

export type AdminAuditEvent = {
  at: string;
  actorId: number;
  actorEmail: string;
  userId: number;
  email: string;
  changes: {
    plan?: { from: AccountPlan; to: AccountPlan };
    dailyLimit?: { from: number | null; to: number | null };
    unlimitedUses?: { from: boolean; to: boolean };
  };
};

type AuditDoc = { events: AdminAuditEvent[] };

function memorySlot(): AuditDoc {
  const g = globalThis as typeof globalThis & { __yoocoAdminAudit?: AuditDoc };
  if (!g.__yoocoAdminAudit) g.__yoocoAdminAudit = { events: [] };
  return g.__yoocoAdminAudit;
}

export function trimAuditEvents(events: AdminAuditEvent[], max = MAX_EVENTS): AdminAuditEvent[] {
  const clean = events.filter((event) => {
    if (!event || typeof event !== "object") return false;
    return typeof event.at === "string" && typeof event.email === "string" && typeof event.actorEmail === "string";
  });
  return clean.slice(-max);
}

function normalizeDoc(value: unknown): AuditDoc {
  const events = (value as AuditDoc | null)?.events;
  return { events: trimAuditEvents(Array.isArray(events) ? events : []) };
}

/** 先打一条日志，再尽量写入 Blob。失败不影响已经保存的账号改动。 */
export async function appendAdminAudit(event: AdminAuditEvent): Promise<"stored" | "console"> {
  console.info("[admin-audit]", JSON.stringify(event));
  try {
    const { getStore } = await import("@edgeone/pages-blob");
    const store = await getStore(STORE_NAME);
    const value = await store.get(DOC_KEY, { type: "json", consistency: "strong" });
    const doc = normalizeDoc(value);
    doc.events = trimAuditEvents([...doc.events, event]);
    await store.setJSON(DOC_KEY, doc);
    return "stored";
  } catch (error) {
    console.warn("[admin-audit] blob unavailable, kept in console", error);
    if (process.env.NODE_ENV !== "production") {
      const slot = memorySlot();
      slot.events = trimAuditEvents([...slot.events, event]);
    }
    return "console";
  }
}
