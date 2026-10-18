/**
 * 注册验证码邮件。走腾讯云邮件推送（SES）的模板发送。
 * 配齐 TENCENT_SECRET_ID、TENCENT_SECRET_KEY、SES_FROM_EMAIL、SES_TEMPLATE_ID 才发信。
 * SES_REGION 不填时用 ap-hongkong，只能是 ap-hongkong 或 ap-guangzhou。
 * 模板要在控制台建好并通过审核，正文里写变量 {{code}}。
 * 上面四项都没写时：NODE_ENV=development 会把验证码打进服务端日志和接口响应；
 * 其他非生产环境要显式 OTP_DEV_ECHO=1 才回显。生产环境绝不回显。
 * 只配了一部分时不当成开发回显，避免配错了还以为发出去了。
 * RESEND_API_KEY 不再使用。
 */

import { DEFAULT_SES_REGION, isSesRegion, postSesTemplateEmail } from "./tencent-ses";

const NOT_CONFIGURED = "邮件服务未配置，暂时无法发送验证码。";
const SEND_FAILED = "验证码发送失败，请稍后再试。";

export function canEchoOtpCode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.NODE_ENV === "development") return true;
  return process.env.OTP_DEV_ECHO === "1";
}

/** 给控制台模板抄的那一句。真正发出去的正文在腾讯云模板里，变量名是 code。 */
export function otpMailText(code: string): string {
  return `Yooco 验证码：${code}，5 分钟内有效。`;
}

export type OtpDelivery =
  | { ok: true; echoed: false }
  | { ok: true; echoed: true; devCode: string }
  | { ok: false; message: string };

export type SesOtpConfig =
  | { status: "absent" }
  | { status: "partial"; reason: string }
  | {
      status: "ready";
      secretId: string;
      secretKey: string;
      region: string;
      fromEmail: string;
      templateId: number;
    };

export function readSesOtpConfig(env: NodeJS.ProcessEnv = process.env): SesOtpConfig {
  const secretId = env.TENCENT_SECRET_ID?.trim() || "";
  const secretKey = env.TENCENT_SECRET_KEY?.trim() || "";
  const fromEmail = env.SES_FROM_EMAIL?.trim() || "";
  const templateRaw = env.SES_TEMPLATE_ID?.trim() || "";
  const regionRaw = env.SES_REGION?.trim() || "";
  const missing = [
    !secretId ? "TENCENT_SECRET_ID" : "",
    !secretKey ? "TENCENT_SECRET_KEY" : "",
    !fromEmail ? "SES_FROM_EMAIL" : "",
    !templateRaw ? "SES_TEMPLATE_ID" : "",
  ].filter(Boolean);
  const regionInvalid = Boolean(regionRaw) && !isSesRegion(regionRaw);
  if (missing.length === 4 && !regionInvalid) return { status: "absent" };
  if (regionInvalid) return { status: "partial", reason: "SES_REGION" };
  if (missing.length > 0) return { status: "partial", reason: missing.join(",") };
  if (!/^[1-9]\d*$/.test(templateRaw)) return { status: "partial", reason: "SES_TEMPLATE_ID" };
  const templateId = Number(templateRaw);
  if (!Number.isSafeInteger(templateId)) return { status: "partial", reason: "SES_TEMPLATE_ID" };
  return {
    status: "ready",
    secretId,
    secretKey,
    region: regionRaw || DEFAULT_SES_REGION,
    fromEmail,
    templateId,
  };
}

export function otpSentBody(sent: OtpDelivery & { ok: true }): { ok: true; message: string; devCode?: string } {
  const body: { ok: true; message: string; devCode?: string } = {
    ok: true,
    message: "验证码已发送，请查收邮箱。",
  };
  if (sent.echoed && process.env.NODE_ENV !== "production") body.devCode = sent.devCode;
  return body;
}

export async function deliverOtpEmail(email: string, code: string): Promise<OtpDelivery> {
  const config = readSesOtpConfig();
  if (config.status === "absent") {
    if (!canEchoOtpCode()) {
      console.warn("[otp] SES config missing and dev echo disabled");
      return { ok: false, message: NOT_CONFIGURED };
    }
    console.info(`[otp] 开发环境验证码 ${email}: ${code}`);
    return { ok: true, echoed: true, devCode: code };
  }
  if (config.status === "partial") {
    console.warn("[otp] SES config incomplete", config.reason);
    return { ok: false, message: NOT_CONFIGURED };
  }

  const sent = await postSesTemplateEmail({
    secretId: config.secretId,
    secretKey: config.secretKey,
    region: config.region,
    fromEmail: config.fromEmail,
    toEmail: email,
    templateId: config.templateId,
    code,
  });
  if (!sent.ok) return { ok: false, message: SEND_FAILED };
  return { ok: true, echoed: false };
}
