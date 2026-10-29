import { currentAccount } from "@/lib/local-accounts";
import { listLayoutHistory, saveLayoutHistory } from "@/lib/layout-history";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 200 * 1024;
const headers = { "cache-control": "no-store" };

function unauthorized() {
  return Response.json({ ok: false, message: "请先登录。" }, { status: 401, headers });
}

export async function GET(request: Request) {
  const account = await currentAccount(request);
  if (!account) return unauthorized();
  const items = await listLayoutHistory(account.id);
  if (!items) {
    return Response.json({ ok: false, message: "历史暂时读不出来，请稍后再试。" }, { status: 503, headers });
  }
  return Response.json({ ok: true, items }, { headers });
}

export async function POST(request: Request) {
  const account = await currentAccount(request);
  if (!account) return unauthorized();
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, message: "这条排版太大，没有记下来。" }, { status: 413, headers });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "内容格式不对。" }, { status: 400, headers });
  }
  const saved = await saveLayoutHistory(account.id, body && typeof body === "object" ? body : {});
  if (!saved.ok && saved.reason === "invalid") {
    return Response.json({ ok: false, message: "没有可保存的正文。" }, { status: 400, headers });
  }
  if (!saved.ok) {
    return Response.json({ ok: false, message: "这条没能记进历史，请稍后再试。" }, { status: 503, headers });
  }
  return Response.json({ ok: true, item: saved.item, created: saved.created }, { status: saved.created ? 201 : 200, headers });
}
