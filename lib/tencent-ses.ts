/**
 * 腾讯云邮件推送（SES）的 SendEmail。
 * 文档：https://cloud.tencent.com/document/product/1288/51034
 * 个人实名账号默认只能用模板发信，Simple 正文已废弃。
 */

import { createHash, createHmac, type BinaryLike } from "node:crypto";

export const SES_ENDPOINT = "ses.tencentcloudapi.com";
export const SES_SERVICE = "ses";
export const SES_ACTION = "SendEmail";
export const SES_VERSION = "2020-10-02";
export const SES_REGIONS = ["ap-hongkong", "ap-guangzhou"] as const;
export const DEFAULT_SES_REGION = "ap-hongkong";
/** 控制台模板正文里要写这个变量，例如：Yooco 验证码：{{code}}，5 分钟内有效。 */
export const OTP_TEMPLATE_VAR = "code";

const ALGORITHM = "TC3-HMAC-SHA256";
const CONTENT_TYPE = "application/json; charset=utf-8";

export type SesRegion = (typeof SES_REGIONS)[number];

export function isSesRegion(value: string): value is SesRegion {
  return (SES_REGIONS as readonly string[]).includes(value);
}

function sha256Hex(message: string): string {
  return createHash("sha256").update(message, "utf8").digest("hex");
}

function hmac(key: BinaryLike, message: string): Buffer {
  return createHmac("sha256", key).update(message, "utf8").digest();
}

export function utcDateFromTimestamp(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 腾讯云 API 3.0 签名。签名串里的 host 只参与计算，真正发请求时由网址带上。 */
export function tc3Authorization(input: {
  secretId: string;
  secretKey: string;
  service: string;
  host: string;
  action: string;
  timestamp: number;
  payload: string;
}): string {
  const signedHeaders = "content-type;host;x-tc-action";
  const canonicalHeaders =
    `content-type:${CONTENT_TYPE}\n` +
    `host:${input.host}\n` +
    `x-tc-action:${input.action.toLowerCase()}\n`;
  const canonicalRequest = [
    "POST",
    "/",
    "",
    canonicalHeaders,
    signedHeaders,
    sha256Hex(input.payload),
  ].join("\n");
  const date = utcDateFromTimestamp(input.timestamp);
  const credentialScope = `${date}/${input.service}/tc3_request`;
  const stringToSign = [ALGORITHM, String(input.timestamp), credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const secretDate = hmac(`TC3${input.secretKey}`, date);
  const secretService = hmac(secretDate, input.service);
  const secretSigning = hmac(secretService, "tc3_request");
  const signature = hmac(secretSigning, stringToSign).toString("hex");
  return (
    `${ALGORITHM} Credential=${input.secretId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`
  );
}

export type SesTemplateMail = {
  secretId: string;
  secretKey: string;
  region: string;
  fromEmail: string;
  toEmail: string;
  templateId: number;
  code: string;
  subject?: string;
  timestamp?: number;
};

export function sesTemplatePayload(mail: SesTemplateMail): string {
  return JSON.stringify({
    FromEmailAddress: mail.fromEmail,
    Destination: [mail.toEmail],
    Subject: mail.subject || "Yooco 验证码",
    Template: {
      TemplateID: mail.templateId,
      TemplateData: JSON.stringify({ [OTP_TEMPLATE_VAR]: mail.code }),
    },
    TriggerType: 1,
  });
}

export type SesHttpRequest = {
  url: string;
  headers: Record<string, string>;
  body: string;
};

export function buildSesTemplateRequest(mail: SesTemplateMail, now = Date.now()): SesHttpRequest {
  const timestamp = mail.timestamp ?? Math.floor(now / 1000);
  const body = sesTemplatePayload(mail);
  const authorization = tc3Authorization({
    secretId: mail.secretId,
    secretKey: mail.secretKey,
    service: SES_SERVICE,
    host: SES_ENDPOINT,
    action: SES_ACTION,
    timestamp,
    payload: body,
  });
  return {
    url: `https://${SES_ENDPOINT}/`,
    headers: {
      authorization,
      "content-type": CONTENT_TYPE,
      "x-tc-action": SES_ACTION,
      "x-tc-timestamp": String(timestamp),
      "x-tc-version": SES_VERSION,
      "x-tc-region": mail.region,
    },
    body,
  };
}

type SesResponseBody = {
  Response?: {
    MessageId?: string;
    RequestId?: string;
    Error?: { Code?: string; Message?: string };
  };
};

export type SesSendResult =
  | { ok: true; messageId: string }
  | { ok: false };

export async function postSesTemplateEmail(mail: SesTemplateMail): Promise<SesSendResult> {
  const request = buildSesTemplateRequest(mail);
  try {
    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: request.body,
      signal: AbortSignal.timeout(10_000),
    });
    const text = await response.text().catch(() => "");
    let parsed: SesResponseBody | null = null;
    try {
      parsed = text ? (JSON.parse(text) as SesResponseBody) : null;
    } catch {
      parsed = null;
    }
    const error = parsed?.Response?.Error;
    const messageId = parsed?.Response?.MessageId || "";
    if (!response.ok || error || !messageId) {
      const code = error?.Code || `http_${response.status}`;
      const detail = (error?.Message || "").slice(0, 200);
      console.warn("[otp] ses failed", code, parsed?.Response?.RequestId || "", detail);
      return { ok: false };
    }
    return { ok: true, messageId };
  } catch (error) {
    console.warn("[otp] ses error", error instanceof Error ? error.message : "unknown");
    return { ok: false };
  }
}
