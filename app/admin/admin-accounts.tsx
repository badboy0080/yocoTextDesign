"use client";

import { FormEvent, useEffect, useState } from "react";

type Plan = "free" | "member" | "admin";

type AccountRow = {
  id: number;
  email: string;
  name: string;
  plan: Plan;
  dailyLimit: number | null;
  unlimitedUses: boolean;
  inviteBonus: number;
  createdAt: string;
  adminAccess: boolean;
};

type ListPayload = {
  ok: true;
  siteDailyLimit: number;
  accounts: AccountRow[];
};

const PLAN_LABEL: Record<Plan, string> = {
  free: "免费",
  member: "会员",
  admin: "管理员",
};

function formatCreated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function limitTextOf(value: number | null): string {
  return value === null ? "" : String(value);
}

export function AdminAccounts({ actorEmail }: { actorEmail: string }) {
  const [query, setQuery] = useState("");
  const [siteDailyLimit, setSiteDailyLimit] = useState(3);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(nextQuery = query) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/accounts?q=${encodeURIComponent(nextQuery.trim())}`, {
        headers: { "cache-control": "no-store" },
      });
      const payload = (await response.json().catch(() => null)) as (ListPayload & { message?: string }) | null;
      if (!response.ok || !payload || payload.ok !== true) {
        setAccounts([]);
        setError(payload?.message || "账号列表读失败。");
        return;
      }
      setSiteDailyLimit(payload.siteDailyLimit);
      setAccounts(payload.accounts);
    } catch {
      setAccounts([]);
      setError("网络异常，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/accounts", { signal: controller.signal, headers: { "cache-control": "no-store" } })
      .then(async (response) => ({ response, payload: (await response.json().catch(() => null)) as (ListPayload & { message?: string }) | null }))
      .then(({ response, payload }) => {
        if (!response.ok || !payload || payload.ok !== true) {
          setAccounts([]);
          setError(payload?.message || "账号列表读失败。");
          return;
        }
        setSiteDailyLimit(payload.siteDailyLimit);
        setAccounts(payload.accounts);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setAccounts([]);
        setError("网络异常，请稍后再试。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    void load(query);
  }

  function replaceAccount(next: AccountRow) {
    setAccounts((current) => current.map((item) => (item.id === next.id ? next : item)));
  }

  return (
    <main className="admin-page">
      <div className="admin-wrap">
        <header className="admin-top">
          <div>
            <p className="admin-kicker">YOOCO / ADMIN</p>
            <h1>账号权限</h1>
            <p className="admin-lead">
              人工开通，不收款。等级只是标记。每日额度留空，就用全站每天 {siteDailyLimit} 次。打开不限次数后，这个账号排版不扣次数，也能进这个后台。当前登录：{actorEmail}
            </p>
          </div>
          <a className="admin-back" href="/studio.html">
            回到工作台
          </a>
        </header>

        <form className="admin-search" onSubmit={onSearch}>
          <label className="admin-field">
            <span>按邮箱搜索</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="name@example.com"
              autoComplete="off"
              inputMode="email"
            />
          </label>
          <button className="admin-button" type="submit" disabled={loading}>
            {loading ? "读取中…" : "搜索"}
          </button>
        </form>

        {error ? <p className="admin-error">{error}</p> : null}
        {!loading && !error && accounts.length === 0 ? <p className="admin-note">没有匹配的账号。</p> : null}

        <div className="admin-list">
          {accounts.map((account) => (
            <AccountEditor
              key={`${account.id}-${account.plan}-${String(account.dailyLimit)}-${account.unlimitedUses}-${account.inviteBonus}`}
              account={account}
              siteDailyLimit={siteDailyLimit}
              onSaved={replaceAccount}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function AccountEditor({
  account,
  siteDailyLimit,
  onSaved,
}: {
  account: AccountRow;
  siteDailyLimit: number;
  onSaved: (next: AccountRow) => void;
}) {
  const [plan, setPlan] = useState<Plan>(account.plan);
  const [limitText, setLimitText] = useState(limitTextOf(account.dailyLimit));
  const [unlimited, setUnlimited] = useState(account.unlimitedUses);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);

  function readLimit(): number | null | "bad" {
    const text = limitText.trim();
    if (!text) return null;
    if (!/^\d+$/.test(text)) return "bad";
    const value = Number(text);
    if (value > 10000) return "bad";
    return value;
  }

  function buildPatch(): Record<string, unknown> | "bad" | "same" {
    const limit = readLimit();
    if (limit === "bad") return "bad";
    const patch: Record<string, unknown> = { userId: account.id };
    if (plan !== account.plan) patch.plan = plan;
    if (limit !== account.dailyLimit) patch.dailyLimit = limit;
    if (unlimited !== account.unlimitedUses) patch.unlimitedUses = unlimited;
    if (Object.keys(patch).length === 1) return "same";
    return patch;
  }

  async function save(patch: Record<string, unknown>, confirm: boolean) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...patch, ...(confirm ? { confirm: true } : {}) }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; account?: AccountRow } | null;
      if (!response.ok || !payload?.ok || !payload.account) {
        setError(payload?.message || "没保存上。");
        return;
      }
      setPending(null);
      onSaved(payload.account);
    } catch {
      setError("网络异常，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  function onSave() {
    const patch = buildPatch();
    if (patch === "bad") {
      setError("每日额度请填 0 到 10000 的整数，留空则用全站默认。");
      return;
    }
    if (patch === "same") {
      setError("没有改动。");
      return;
    }
    if ("plan" in patch || "unlimitedUses" in patch) {
      setError("");
      setPending(patch);
      return;
    }
    void save(patch, false);
  }

  const limitLabel = account.dailyLimit === null ? `默认 ${siteDailyLimit}` : String(account.dailyLimit);
  const pendingPlan = pending && typeof pending.plan === "string" ? PLAN_LABEL[pending.plan as Plan] : "";
  const pendingUnlimited = pending && typeof pending.unlimitedUses === "boolean" ? pending.unlimitedUses : null;

  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2 className="admin-email">{account.email}</h2>
          <p className="admin-meta">
            {account.name || "未填称呼"} · 邀请加成 {account.inviteBonus} · {formatCreated(account.createdAt)} · 当前额度 {limitLabel}
          </p>
        </div>
        {account.adminAccess ? <span className="admin-badge">可进后台</span> : null}
      </div>

      <div className="admin-fields">
        <label className="admin-field">
          <span>等级</span>
          <select value={plan} onChange={(event) => setPlan(event.target.value as Plan)}>
            <option value="free">免费</option>
            <option value="member">会员</option>
            <option value="admin">管理员</option>
          </select>
        </label>
        <label className="admin-field">
          <span>每日额度</span>
          <input
            value={limitText}
            onChange={(event) => setLimitText(event.target.value)}
            inputMode="numeric"
            placeholder={`留空 = 每天 ${siteDailyLimit} 次`}
            aria-label={`${account.email} 的每日额度`}
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={unlimited}
            onChange={(event) => setUnlimited(event.target.checked)}
          />
          <span>不限次数</span>
        </label>
      </div>

      <div className="admin-actions">
        <p className="admin-row-error">{error}</p>
        <button className="admin-button" type="button" onClick={onSave} disabled={busy}>
          {busy ? "保存中…" : "保存"}
        </button>
      </div>

      {pending ? (
        <div className="admin-mask" role="presentation">
          <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby={`confirm-${account.id}`}>
            <h2 id={`confirm-${account.id}`}>再确认一次</h2>
            {pendingPlan ? (
              <p>
                把 {account.email} 的等级改成「{pendingPlan}」。等级本身不打开后台，也不自动不限次数。
              </p>
            ) : null}
            {pendingUnlimited === true ? (
              <p>打开不限次数后，这个账号排版不再扣次数，并且能进后台。</p>
            ) : null}
            {pendingUnlimited === false ? (
              <p>关掉不限次数后，如果这个邮箱不在管理员名单里，就进不了后台。排版会重新按每日额度扣次数。</p>
            ) : null}
            {"dailyLimit" in pending ? (
              <p>
                每日额度改成
                {pending.dailyLimit === null ? `全站默认，每天 ${siteDailyLimit} 次` : `每天 ${String(pending.dailyLimit)} 次`}。
              </p>
            ) : null}
            <p>人工开通，不收款。</p>
            <div className="admin-dialog-actions">
              <button className="admin-ghost" type="button" onClick={() => setPending(null)} disabled={busy}>
                取消
              </button>
              <button className="admin-button" type="button" onClick={() => void save(pending, true)} disabled={busy}>
                确认保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
