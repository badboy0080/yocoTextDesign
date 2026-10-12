/**
 * 注册验证码邮件。
 * 线上要配 RESEND_API_KEY。可选 EMAIL_FROM，例如 Yooco <noreply@yoooco.com>。
 * 没配密钥时：NODE_ENV=development 会把验证码打进服务端日志和接口响应；
 * 其他非生产环境要显式 OTP_DEV_ECHO=1 才回显。生产环境绝不回显。
 */

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Yooco <onboarding@resend.dev>";

export function canEchoOtpCode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.NODE_ENV === "development") return true;
  return process.env.OTP_DEV_ECHO === "1";
}

export function otpMailText(code: string): string {
  return `Yooco 验证码：${code}，5 分钟内有效。`;
}

export type OtpDelivery =
  | { ok: true; echoed: false }
  | { ok: true; echoed: true; devCode: string }
  | { ok: false; message: string };

export function otpSentBody(sent: OtpDelivery & { ok: true }): { ok: true; message: string; devCode?: string } {
  const body: { ok: true; message: string; devCode?: string } = {
    ok: true,
    message: "验证码已发送，请查收邮箱。",
  };
  if (sent.echoed && process.env.NODE_ENV !== "production") body.devCode = sent.devCode;
  return body;
}

export async function deliverOtpEmail(email: string, code: string): Promise<OtpDelivery> {
  const key = process.env.RESEND_API_KEY?.trim() || "";
  if (!key) {
    if (!canEchoOtpCode()) {
      console.warn("[otp] RESEND_API_KEY missing and dev echo disabled");
      return { ok: false, message: "邮件服务未配置，暂时无法发送验证码。" };
    }
    console.info(`[otp] 开发环境验证码 ${email}: ${code}`);
    return { ok: true, echoed: true, devCode: code };
  }

  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Yooco 验证码",
        text: otpMailText(code),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn("[otp] resend failed", response.status, detail.slice(0, 300));
      return { ok: false, message: "验证码发送失败，请稍后再试。" };
    }
    return { ok: true, echoed: false };
  } catch (error) {
    console.warn("[otp] resend error", error instanceof Error ? error.message : "unknown");
    return { ok: false, message: "验证码发送失败，请稍后再试。" };
  }
}
