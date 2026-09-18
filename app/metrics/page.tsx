"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type EventCounts = { pv: number; uv: number };
type FunnelDay = {
  date: string;
  visit: EventCounts;
  trial_click: EventCounts;
  optimize_ok: EventCounts;
};
type MetricsPayload = {
  ok: true;
  timezone: string;
  days: FunnelDay[];
  totals: Omit<FunnelDay, "date">;
};
type MetricsError = { ok: false; error?: { message?: string } };

function rate(part: number, whole: number): string {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function Counts({ day }: { day: Pick<FunnelDay, "visit" | "trial_click" | "optimize_ok"> }) {
  return (
    <>
      <td className="px-3 py-2 tabular-nums">{day.visit.pv}</td>
      <td className="px-3 py-2 tabular-nums">{day.visit.uv}</td>
      <td className="px-3 py-2 tabular-nums">{day.trial_click.pv}</td>
      <td className="px-3 py-2 tabular-nums">{day.trial_click.uv}</td>
      <td className="px-3 py-2 tabular-nums">{day.optimize_ok.pv}</td>
      <td className="px-3 py-2 tabular-nums">{day.optimize_ok.uv}</td>
    </>
  );
}

function MetricsView() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";
  const [tokenInput, setTokenInput] = useState(urlToken);
  const [token, setToken] = useState(urlToken);
  const [data, setData] = useState<MetricsPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextToken: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/metrics?token=${encodeURIComponent(nextToken)}`, {
        headers: { "x-analytics-token": nextToken, "cache-control": "no-store" },
      });
      const payload = (await response.json()) as MetricsPayload | MetricsError;
      if (!response.ok || !payload || payload.ok !== true) {
        setData(null);
        setError(
          (payload && "error" in payload && payload.error?.message) || "读不到统计，请检查口令。",
        );
        return;
      }
      setData(payload);
    } catch {
      setData(null);
      setError("网络异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTokenInput(urlToken);
    setToken(urlToken);
    if (urlToken) void load(urlToken);
  }, [load, urlToken]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = tokenInput.trim();
    setToken(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("token", next);
    else url.searchParams.delete("token");
    window.history.replaceState(null, "", url);
    void load(next);
  }

  const funnel = useMemo(() => {
    if (!data) return null;
    const { visit, trial_click, optimize_ok } = data.totals;
    return {
      clickRateUv: rate(trial_click.uv, visit.uv),
      successRateUv: rate(optimize_ok.uv, trial_click.uv),
      visitToSuccessUv: rate(optimize_ok.uv, visit.uv),
    };
  }, [data]);

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10 text-sm text-zinc-800">
      <h1 className="text-2xl font-semibold tracking-tight">Yooco 漏斗</h1>
      <p className="mt-2 max-w-2xl text-zinc-600">
        访问（首页/工作室）→ 点击「免费试用 10 次」→ AI 排版成功。数字按北京时间记天；PV 是次数，UV
        是独立访客。
      </p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="metrics-token">
          统计口令
        </label>
        <input
          id="metrics-token"
          type="password"
          autoComplete="off"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
          placeholder="输入 ANALYTICS_TOKEN"
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 sm:max-w-xs"
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-zinc-900 px-4 font-medium text-white"
          disabled={loading}
        >
          {loading ? "读取中…" : "查看"}
        </button>
      </form>

      {error ? <p className="mt-4 text-red-600">{error}</p> : null}

      {data && funnel ? (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-base font-medium">累计</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-zinc-500">访问 visit</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{data.totals.visit.pv}</p>
                <p className="text-zinc-500">UV {data.totals.visit.uv}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-zinc-500">试用点击 trial_click</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {data.totals.trial_click.pv}
                </p>
                <p className="text-zinc-500">
                  UV {data.totals.trial_click.uv} · 占访问 {funnel.clickRateUv}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-zinc-500">排版成功 optimize_ok</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {data.totals.optimize_ok.pv}
                </p>
                <p className="text-zinc-500">
                  UV {data.totals.optimize_ok.uv} · 占点击 {funnel.successRateUv} · 占访问{" "}
                  {funnel.visitToSuccessUv}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-medium">按天（{data.timezone}）</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="min-w-full text-left">
                <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">日期</th>
                    <th className="px-3 py-2 font-medium">visit PV</th>
                    <th className="px-3 py-2 font-medium">visit UV</th>
                    <th className="px-3 py-2 font-medium">trial PV</th>
                    <th className="px-3 py-2 font-medium">trial UV</th>
                    <th className="px-3 py-2 font-medium">ok PV</th>
                    <th className="px-3 py-2 font-medium">ok UV</th>
                  </tr>
                </thead>
                <tbody>
                  {data.days.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6 text-zinc-500" colSpan={7}>
                        还没有事件。打开首页或工作室会产生 visit。
                      </td>
                    </tr>
                  ) : (
                    data.days.map((day) => (
                      <tr key={day.date} className="border-t border-zinc-100">
                        <td className="px-3 py-2 font-medium">{day.date}</td>
                        <Counts day={day} />
                      </tr>
                    ))
                  )}
                  <tr className="border-t border-zinc-200 bg-zinc-50 font-medium">
                    <td className="px-3 py-2">合计</td>
                    <Counts day={data.totals} />
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {!data && !error && !token ? (
        <p className="mt-6 text-zinc-500">先填口令，或打开 /metrics?token=你的口令</p>
      ) : null}
    </main>
  );
}

export default function MetricsPage() {
  return (
    <Suspense fallback={<main className="px-4 py-10 text-sm text-zinc-600">加载中…</main>}>
      <MetricsView />
    </Suspense>
  );
}
