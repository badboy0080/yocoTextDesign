import { recordFunnelEvent, sanitizeDeviceId } from "@/lib/analytics-store";
import { verifyEmailCode } from "@/lib/email-otp";
import {
  inspectInviteCode,
  inviteFailureMessage,
  inviteFailureStatus,
  readInviteInput,
  redeemInviteCode,
} from "@/lib/invite-store";
import { deleteAccount, registerAccount, signupIdentityTaken } from "@/lib/local-accounts";
import { resolveSignupChannel, signupOtpPlan, signupWithOneId } from "@/lib/oneid";

function accountDeviceId(userId: number, raw: unknown): string {
  return sanitizeDeviceId(raw) || `acct-${String(userId).padStart(4, "0")}`;
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

/**
 * 注册。配齐 OneID 时，只把当前选中的邮箱或手机交给 /signup。
 * 成功后仍在本地账号库记一份：密码哈希、邀请码加次、不限次数字段都不丢。
 * 没配 OneID 时，邮箱回退到原来的 6 位验证码；手机不能注册。
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    name?: string;
    email?: string;
    phone?: string;
    channel?: string;
    password?: string;
    code?: string;
    otpToken?: string;
    inviteCode?: string;
    deviceId?: string;
  } | null;

  const invite = readInviteInput(body?.inviteCode);
  if (invite.kind === "invalid") return json({ ok: false, message: inviteFailureMessage("invalid") }, 400);
  if (invite.kind === "code") {
    const inspected = await inspectInviteCode(invite.code);
    if (!inspected.ok) {
      return json({ ok: false, message: inviteFailureMessage(inspected.reason) }, inviteFailureStatus(inspected.reason));
    }
  }

  const contact = resolveSignupChannel({
    channel: body?.channel,
    email: body?.email,
    phone: body?.phone,
  });
  if (!contact.ok) return json({ ok: false, message: contact.message }, contact.status);

  const password = String(body?.password || "");
  const name = String(body?.name || "");
  const taken = await signupIdentityTaken({
    name,
    password,
    email: contact.email,
    phone: contact.phone,
  });
  if (!taken.ok) return json({ ok: false, message: taken.message }, taken.status);

  const plan = signupOtpPlan(process.env, contact.channel);
  if (plan.kind === "blocked") return json({ ok: false, message: plan.message }, 503);

  let oneIdSub = "";
  if (plan.kind === "oneid") {
    const signed = await signupWithOneId({
      channel: contact.channel,
      email: contact.email,
      phone: contact.phone,
      otpToken: String(body?.otpToken || ""),
      otp: String(body?.code || ""),
      password,
    });
    if (!signed.ok) return json({ ok: false, message: signed.message }, signed.status);
    oneIdSub = signed.value.sub;
  } else {
    const verified = await verifyEmailCode({
      email: contact.email,
      code: String(body?.code || ""),
    });
    if (!verified.ok) return json({ ok: false, message: verified.message }, verified.status);
  }

  const result = await registerAccount({
    name,
    password,
    email: contact.email,
    phone: contact.phone,
    ...(oneIdSub ? { oneIdSub } : {}),
  });
  if (!result.ok) return json({ ok: false, message: result.message }, result.status);

  let inviteBonus = 0;
  if (invite.kind === "code") {
    const redeemed = await redeemInviteCode({ code: invite.code, userId: result.id });
    if (!redeemed.ok) {
      await deleteAccount(result.id);
      return json({ ok: false, message: inviteFailureMessage(redeemed.reason) }, inviteFailureStatus(redeemed.reason));
    }
    inviteBonus = redeemed.bonusRemaining;
    await recordFunnelEvent("invite_redeem", accountDeviceId(result.id, body?.deviceId));
  }

  return json({
    ok: true,
    email: result.email,
    name: result.name,
    inviteBonus,
    ...("phone" in result && result.phone ? { phone: result.phone } : {}),
  }, 201);
}
