/**
 * 腾讯云 OneID（CIAM）注册验证码。
 * 线上在 EdgeOne 配这三个环境变量，不要写进仓库：
 * - ONEID_PORTAL_HOST  门户域名，如 xxx.portal.tencentciam.com（带不带 https:// 都行）
 * - ONEID_CLIENT_ID
 * - ONEID_CLIENT_SECRET
 * 三个都有才走 OneID。一个都没有时，邮箱注册回退到原来的 Resend 验证码。
 * 只配了一部分时不算回退，直接告诉用户配置不完整，避免发两份码。
 * 控制台必须启用该应用的注册流程，并允许「邮箱」或「手机」二选一，不要把两种都设成必填。
 * 我们会把密码一并交给 OneID，所以登录流程里要关联账号密码认证源。
 */

import { normalizeEmail, validEmail } from "./email-address";
import { normalizePhone, validPhone } from "./phone-number";

export type SignupChannel = "email" | "phone";

export type OneIdEnv = NodeJS.ProcessEnv;

export type OneIdConfig = {
  origin: string;
  clientId: string;
  clientSecret: string;
};

const MISSING_MESSAGE = "身份认证未配置。请在 EdgeOne 配 ONEID_PORTAL_HOST、ONEID_CLIENT_ID、ONEID_CLIENT_SECRET。";
const PARTIAL_MESSAGE = "腾讯云 OneID 配置不完整。请同时填写 ONEID_PORTAL_HOST、ONEID_CLIENT_ID、ONEID_CLIENT_SECRET。";
const BAD_HOST_MESSAGE = "ONEID_PORTAL_HOST 不是有效的门户域名。示例：xxx.portal.tencentciam.com";

export type OneIdRead =
  | { configured: true; config: OneIdConfig }
  | { configured: false; partial: boolean; message: string };

/** 去掉协议和路径，得到 https://门户域名。 */
export function oneIdPortalOrigin(raw: string): string | null {
  let host = raw.trim();
  if (!host) return null;
  host = host.replace(/^https?:\/\//i, "");
  host = host.split("/")[0]?.split("?")[0]?.split("#")[0] ?? "";
  host = host.replace(/\.+$/, "");
  if (!host || /\s/.test(host)) return null;
  if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return null;
  if (!host.includes(".")) return null;
  return `https://${host}`;
}

export function readOneIdConfig(env: OneIdEnv = process.env): OneIdRead {
  const host = env.ONEID_PORTAL_HOST?.trim() || "";
  const clientId = env.ONEID_CLIENT_ID?.trim() || "";
  const clientSecret = env.ONEID_CLIENT_SECRET?.trim() || "";
  const filled = [host, clientId, clientSecret].filter(Boolean).length;
  if (filled === 0) return { configured: false, partial: false, message: MISSING_MESSAGE };
  if (filled < 3) return { configured: false, partial: true, message: PARTIAL_MESSAGE };
  const origin = oneIdPortalOrigin(host);
  if (!origin) return { configured: false, partial: true, message: BAD_HOST_MESSAGE };
  return { configured: true, config: { origin, clientId, clientSecret } };
}

export type SignupOtpPlan =
  | { kind: "oneid"; config: OneIdConfig }
  | { kind: "local-email" }
  | { kind: "blocked"; message: string };

/** 三个都有走 OneID；一个都没有且是邮箱，才回退旧验证码。其余直接拦住。 */
export function signupOtpPlan(env: OneIdEnv, channel: SignupChannel): SignupOtpPlan {
  const read = readOneIdConfig(env);
  if (read.configured) return { kind: "oneid", config: read.config };
  if (read.partial || channel === "phone") return { kind: "blocked", message: read.message };
  return { kind: "local-email" };
}

/** oneid：只打 OneID。local-email：旧邮箱验证码。need-oneid：手机但没配。misconfigured：配了一半。 */
export function chooseSignupOtp(env: OneIdEnv, channel: SignupChannel): "oneid" | "local-email" | "need-oneid" | "misconfigured" {
  const read = readOneIdConfig(env);
  if (read.configured) return "oneid";
  if (read.partial) return "misconfigured";
  if (channel === "phone") return "need-oneid";
  return "local-email";
}

/** 文档要求：base64(url_encode(client_id) + ":" + url_encode(client_secret))。密钥不能出现在日志或响应里。 */
export function oneIdBasicAuthorization(clientId: string, clientSecret: string): string {
  const token = Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`).toString("base64");
  return `Basic ${token}`;
}

export function resolveSignupChannel(input: {
  channel?: string;
  email?: string;
  phone?: string;
}): { ok: true; channel: SignupChannel; email: string; phone: string } | { ok: false; status: 400; message: string } {
  const rawChannel = String(input.channel || "").trim().toLowerCase();
  const email = normalizeEmail(String(input.email || ""));
  const phone = normalizePhone(String(input.phone || ""));
  let channel: SignupChannel | null = null;
  if (rawChannel === "email" || rawChannel === "phone") channel = rawChannel;
  else if (rawChannel) return { ok: false, status: 400, message: "请选择邮箱或手机其中一种验证方式。" };
  else if (validPhone(phone) && !validEmail(email)) channel = "phone";
  else if (email || !phone) channel = "email";
  else channel = "phone";

  if (channel === "phone") {
    if (!validPhone(phone)) return { ok: false, status: 400, message: "请填写国内 11 位手机号。" };
    return { ok: true, channel, email: "", phone };
  }
  if (!validEmail(email) || email.length > 120) return { ok: false, status: 400, message: "请填写有效的邮箱。" };
  return { ok: true, channel, email, phone: "" };
}

export function otpSendBody(input: { channel: SignupChannel; email: string; phone: string }): { usage: "signup"; email: string } | { usage: "signup"; phone_number: string } {
  if (input.channel === "phone") return { usage: "signup", phone_number: input.phone };
  return { usage: "signup", email: input.email };
}

export function signupBody(input: {
  channel: SignupChannel;
  email: string;
  phone: string;
  otpToken: string;
  otp: string;
  password: string;
}): Record<string, string> {
  if (input.channel === "phone") {
    return {
      phone_number: input.phone,
      phone_number_otp_token: input.otpToken,
      phone_number_otp: input.otp,
      password: input.password,
    };
  }
  return {
    email: input.email,
    email_otp_token: input.otpToken,
    email_otp: input.otp,
    password: input.password,
  };
}

type OneIdErrorShape = {
  error?: string;
  error_description?: string;
};

export function oneIdErrorMessage(error: string, description = ""): string {
  const code = error.trim();
  const desc = description.trim();
  const blob = `${code} ${desc}`.toLowerCase();

  if (code === "misconfigured" && /sign up flow/i.test(desc)) {
    return "应用还没启用注册流程。请到 OneID 控制台打开这个应用的注册流程。";
  }
  if (code === "misconfigured" && /password auth source/i.test(desc)) {
    return "登录流程还没关联账号密码认证源，暂时无法设置密码。请到 OneID 控制台加上密码登录。";
  }
  if (code === "misconfigured") {
    return "OneID 注册配置不完整。请确认已启用注册流程，并关联账号密码认证源。";
  }
  if (code === "invalid_request" && /missing required sign-up/i.test(desc)) {
    return "注册信息不完整。控制台请把邮箱和手机都配成可选，同一次注册只提交选中的那一种，不要把另一种设成必填。";
  }
  if (code === "invalid_request" && /unconfigured sign-up/i.test(desc)) {
    return "当前验证方式还没写进注册流程。请在 OneID 控制台同时开放邮箱和手机，用户每次只选一种。";
  }
  if (code === "invalid_request" && /unknown attribute/i.test(desc)) {
    return "注册请求里有控制台不认识的字段。请只提交当前选中的邮箱或手机。";
  }
  if (code === "bad_email_otp_token" || code === "bad_phone_number_otp_token") {
    return "验证码已过期，或和获取验证码时的邮箱或手机不一致。请重新获取。";
  }
  if (code === "bad_email_otp" || code === "bad_phone_number_otp") {
    return "验证码不正确或已过期，请重新填写。";
  }
  if (code === "invalid_password") return "密码不符合 OneID 的密码规则，请换一个更复杂的密码。";
  if (code === "malformed_phone_number") return "请填写国内 11 位手机号。";
  if (code === "malformed_email") return "请填写有效的邮箱。";
  if (code === "duplicate_email") return "这个邮箱已经注册过，请直接登录。";
  if (code === "duplicate_phone_number") return "这个手机号已经注册过，请直接登录。";
  if (code === "insufficient_sms_quota") return "短信额度不足，请到 OneID 控制台配置短信模板后再试。";
  if (code === "insufficient_email_quota") return "邮件额度不足，请到 OneID 控制台配置邮箱模板后再试。";
  if (code === "invalid_client") return "OneID 应用密钥不正确，请检查 ONEID_CLIENT_ID 和 ONEID_CLIENT_SECRET。";
  if (/frequen|rate_limit|too many|too_many|throttl/.test(blob)) return "发送太频繁，请稍后再试。";
  if (/blacklist|undeliver|mailbox/.test(blob)) return "这个邮箱发不出去，请换一个邮箱。";
  if (code) return `验证没有通过（${code}）。请稍后再试。`;
  return "验证没有通过，请稍后再试。";
}

export type OneIdCallResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; message: string };

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

async function readOneIdJson(response: Response): Promise<OneIdErrorShape & { otp_token?: unknown; sub?: unknown }> {
  const text = await response.text().catch(() => "");
  if (!text) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object") return parsed as OneIdErrorShape & { otp_token?: unknown; sub?: unknown };
  } catch {
    return {};
  }
  return {};
}

function failureStatus(status: number): number {
  if (status >= 400 && status < 500) return status;
  return 502;
}

async function postOneId(
  config: OneIdConfig,
  path: "/otp/send" | "/signup",
  body: Record<string, string>,
  fetchImpl: FetchLike,
): Promise<OneIdCallResult<OneIdErrorShape & { otp_token?: unknown; sub?: unknown }>> {
  let response: Response;
  try {
    response = await fetchImpl(`${config.origin}${path}`, {
      method: "POST",
      headers: {
        authorization: oneIdBasicAuthorization(config.clientId, config.clientSecret),
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.warn("[oneid] request failed", path, error instanceof Error ? error.message : "unknown");
    return { ok: false, status: 502, message: "暂时连不上腾讯云 OneID，请稍后再试。" };
  }

  const json = await readOneIdJson(response);
  if (!response.ok) {
    const code = typeof json.error === "string" ? json.error : "";
    const description = typeof json.error_description === "string" ? json.error_description : "";
    console.warn("[oneid] rejected", path, response.status, code || "no-code");
    return {
      ok: false,
      status: failureStatus(response.status),
      message: oneIdErrorMessage(code, description),
    };
  }
  return { ok: true, value: json };
}

function blocked(read: OneIdRead): OneIdCallResult<never> | null {
  if (read.configured) return null;
  return { ok: false, status: 503, message: read.message };
}

export async function sendSignupOtp(input: {
  channel: SignupChannel;
  email: string;
  phone: string;
  env?: OneIdEnv;
  fetchImpl?: FetchLike;
}): Promise<OneIdCallResult<{ otpToken: string; target: string; channel: SignupChannel }>> {
  const read = readOneIdConfig(input.env);
  const stop = blocked(read);
  if (stop) return stop;
  const config = read.configured ? read.config : null;
  if (!config) return { ok: false, status: 503, message: MISSING_MESSAGE };

  const body = otpSendBody(input);
  const sent = await postOneId(config, "/otp/send", body, input.fetchImpl || fetch);
  if (!sent.ok) return sent;
  const otpToken = sent.value.otp_token;
  if (typeof otpToken !== "string" || !otpToken.trim()) {
    console.warn("[oneid] otp/send missing otp_token");
    return { ok: false, status: 502, message: "验证码服务没有返回凭证，请稍后再试。" };
  }
  return {
    ok: true,
    value: {
      otpToken: otpToken.trim(),
      target: input.channel === "phone" ? input.phone : input.email,
      channel: input.channel,
    },
  };
}

export async function signupWithOneId(input: {
  channel: SignupChannel;
  email: string;
  phone: string;
  otpToken: string;
  otp: string;
  password: string;
  env?: OneIdEnv;
  fetchImpl?: FetchLike;
}): Promise<OneIdCallResult<{ sub: string }>> {
  const read = readOneIdConfig(input.env);
  const stop = blocked(read);
  if (stop) return stop;
  const config = read.configured ? read.config : null;
  if (!config) return { ok: false, status: 503, message: MISSING_MESSAGE };
  const token = input.otpToken.trim();
  if (!token) return { ok: false, status: 400, message: "请先获取验证码。" };
  if (!/^\d{6}$/.test(input.otp)) return { ok: false, status: 400, message: "请填写 6 位验证码。" };

  const body = signupBody({ ...input, otpToken: token });
  const signed = await postOneId(config, "/signup", body, input.fetchImpl || fetch);
  if (!signed.ok) return signed;
  const sub = signed.value.sub;
  if (typeof sub !== "string" || !sub.trim()) {
    console.warn("[oneid] signup missing sub");
    return { ok: false, status: 502, message: "注册服务没有返回用户标识，请稍后再试。" };
  }
  return { ok: true, value: { sub: sub.trim() } };
}
