import { recordFunnelEvent, sanitizeDeviceId } from "@/lib/analytics-store";
import {
  inspectInviteCode,
  inviteFailureMessage,
  inviteFailureStatus,
  readInviteInput,
  redeemInviteCode,
} from "@/lib/invite-store";
import { verifyEmailCode } from "@/lib/email-otp";
import { deleteAccount, registerAccount, withSessionCookie } from "@/lib/local-accounts";

function accountDeviceId(userId: number, raw: unknown): string {
  return sanitizeDeviceId(raw) || `acct-${String(userId).padStart(4, "0")}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    name?: string;
    email?: string;
    password?: string;
    code?: string;
    inviteCode?: string;
    deviceId?: string;
  } | null;
  const invite = readInviteInput(body?.inviteCode);
  if (invite.kind === "invalid") {
    return Response.json(
      { ok: false, message: inviteFailureMessage("invalid") },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  if (invite.kind === "code") {
    const inspected = await inspectInviteCode(invite.code);
    if (!inspected.ok) {
      return Response.json(
        { ok: false, message: inviteFailureMessage(inspected.reason) },
        { status: inviteFailureStatus(inspected.reason), headers: { "cache-control": "no-store" } },
      );
    }
  }

  const verified = await verifyEmailCode({
    email: String(body?.email || ""),
    code: String(body?.code || ""),
  });
  if (!verified.ok) {
    return Response.json(
      { ok: false, message: verified.message },
      { status: verified.status, headers: { "cache-control": "no-store" } },
    );
  }

  const result = await registerAccount({
    name: String(body?.name || ""),
    email: String(body?.email || ""),
    password: String(body?.password || ""),
  });
  if (!result.ok) {
    return Response.json({ ok: false, message: result.message }, { status: result.status, headers: { "cache-control": "no-store" } });
  }

  let inviteBonus = 0;
  if (invite.kind === "code") {
    const redeemed = await redeemInviteCode({ code: invite.code, userId: result.id });
    if (!redeemed.ok) {
      await deleteAccount(result.id);
      const response = Response.json(
        { ok: false, message: inviteFailureMessage(redeemed.reason) },
        { status: inviteFailureStatus(redeemed.reason), headers: { "cache-control": "no-store" } },
      );
      return withSessionCookie(response, request, null);
    }
    inviteBonus = redeemed.bonusRemaining;
    await recordFunnelEvent("invite_redeem", accountDeviceId(result.id, body?.deviceId));
  }

  const response = Response.json(
    { ok: true, email: result.email, name: result.name, inviteBonus },
    { status: 201, headers: { "cache-control": "no-store" } },
  );
  return withSessionCookie(response, request, result.sessionToken);
}
