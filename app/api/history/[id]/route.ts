import { currentAccount } from "@/lib/local-accounts";
import { readLayoutHistory, validHistoryId } from "@/lib/layout-history";

export const dynamic = "force-dynamic";

const headers = { "cache-control": "no-store" };

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const account = await currentAccount();
  if (!account) {
    return Response.json({ ok: false, message: "请先登录。" }, { status: 401, headers });
  }
  const { id } = await context.params;
  if (!validHistoryId(id)) {
    return Response.json({ ok: false, message: "找不到这条记录。" }, { status: 404, headers });
  }
  const item = await readLayoutHistory(account.id, id);
  if (item === null) {
    return Response.json({ ok: false, message: "历史暂时读不出来，请稍后再试。" }, { status: 503, headers });
  }
  if (!item) {
    return Response.json({ ok: false, message: "找不到这条记录。" }, { status: 404, headers });
  }
  return Response.json({ ok: true, item }, { headers });
}
