import { discardIssuedCode, issueEmailCode } from "@/lib/email-otp";
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const issued = await issueEmailCode({
    email: String(body?.email || ""),
    ip: clientIp(request),
  });
  if (!issued.ok) {
    return Response.json({ ok: false, message: issued.message }, { status: issued.status, headers: noStore });
  }

  const sent = await deliverOtpEmail(issued.email, issued.code);
  if (!sent.ok) {
    await discardIssuedCode(issued.email, issued.issuedAt);
    return Response.json({ ok: false, message: sent.message }, { status: 502, headers: noStore });
  }

  return Response.json(otpSentBody(sent), { headers: noStore });
}
