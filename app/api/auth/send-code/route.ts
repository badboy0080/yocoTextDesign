import { discardIssuedCode, issueEmailCode } from "@/lib/email-otp";
import { resolveSignupChannel, sendSignupOtp, signupOtpPlan } from "@/lib/oneid";
import { deliverOtpEmail, otpSentBody } from "@/lib/otp-mail";

const noStore = { "cache-control": "no-store" };

/** 与 lib/edgeone-rate-limit.ts 的 clientIp 看同一套请求头。 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim();
  return (
    first ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("eo-connecting-ip")?.trim() ||
    request.headers.get("true-client-ip")?.trim() ||
    "unknown"
  );
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore });
}

/**
 * 注册发码。配齐 OneID 时只请求腾讯云，不走 Resend。
 * 没配 OneID 时，邮箱仍走原来的验证码；手机会提示先配 OneID。
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    channel?: string;
    email?: string;
    phone?: string;
  } | null;
  const contact = resolveSignupChannel({
    channel: body?.channel,
    email: body?.email,
    phone: body?.phone,
  });
  if (!contact.ok) return json({ ok: false, message: contact.message }, contact.status);

  const plan = signupOtpPlan(process.env, contact.channel);
  if (plan.kind === "blocked") return json({ ok: false, message: plan.message }, 503);

  if (plan.kind === "oneid") {
    const sent = await sendSignupOtp({
      channel: contact.channel,
      email: contact.email,
      phone: contact.phone,
    });
    if (!sent.ok) return json({ ok: false, message: sent.message }, sent.status);
    const message = contact.channel === "phone" ? "验证码已发送，请查收短信。" : "验证码已发送，请查收邮箱。";
    return json({
      ok: true,
      message,
      provider: "oneid",
      channel: sent.value.channel,
      target: sent.value.target,
      otpToken: sent.value.otpToken,
    });
  }

  const issued = await issueEmailCode({
    email: contact.email,
    ip: clientIp(request),
  });
  if (!issued.ok) return json({ ok: false, message: issued.message }, issued.status);

  const sent = await deliverOtpEmail(issued.email, issued.code);
  if (!sent.ok) {
    await discardIssuedCode(issued.email, issued.issuedAt);
    return json({ ok: false, message: sent.message }, 502);
  }

  return json({
    ...otpSentBody(sent),
    provider: "local",
    channel: "email",
    target: issued.email,
  });
}
