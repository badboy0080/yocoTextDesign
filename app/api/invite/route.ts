import { currentAccount } from "@/lib/local-accounts";
import { ensureInviteCode, inviteFailureMessage } from "@/lib/invite-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const account = await currentAccount();
  if (!account) {
    return Response.json(
      { ok: false, message: "请先登录。" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }
  const invite = await ensureInviteCode(account.id);
  if (!invite.ok) {
    return Response.json(
      { ok: false, message: inviteFailureMessage(invite.reason) },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json(
    { ok: true, ...invite.card },
    { headers: { "cache-control": "no-store" } },
  );
}
