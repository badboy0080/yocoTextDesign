import { currentAccount, isAdminAccount, listManagedAccounts, updateManagedAccount } from "@/lib/local-accounts";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

async function requireAdmin(request: Request) {
  const account = await currentAccount(request);
  if (!account) return { ok: false as const, response: json({ ok: false, message: "请先登录。" }, 401) };
  if (!isAdminAccount(account)) {
    return { ok: false as const, response: json({ ok: false, message: "只有管理员能看账号权限。" }, 403) };
  }
  return { ok: true as const, account };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const query = new URL(request.url).searchParams.get("q") || "";
    const listed = await listManagedAccounts(query);
    return json({ ok: true, ...listed });
  } catch (error) {
    console.warn("[admin] list failed", error);
    return json({ ok: false, message: "账号列表读失败。" }, 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null);
  try {
    const result = await updateManagedAccount({ id: auth.account.id, email: auth.account.email }, body);
    if (!result.ok) return json({ ok: false, message: result.message }, result.status);
    return json({ ok: true, account: result.account, audit: result.audit });
  } catch (error) {
    console.warn("[admin] update failed", error);
    return json({ ok: false, message: "这次没保存上，请稍后再试。" }, 500);
  }
}
