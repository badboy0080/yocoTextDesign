import {
  OTP_IP_LIMIT,
  OTP_LOCK_MS,
  OTP_RESEND_MS,
  OTP_TTL_MS,
  discardIssuedCode,
  issueEmailCode,
  otpSecretsForTests,
  resetOtpMemory,
  enableMemoryOtpStoreForTests,
  verifyEmailCode,
} from "../lib/email-otp";
import { canEchoOtpCode, deliverOtpEmail, otpMailText, otpSentBody, readSesOtpConfig } from "../lib/otp-mail";
import { buildSesTemplateRequest, tc3Authorization } from "../lib/tencent-ses";
import { POST as sendCodePost } from "../app/api/auth/send-code/route";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function wrongCode(code: string) {
  return code === "000000" ? "000001" : "000000";
}

const prevEnv = {
  NODE_ENV: process.env.NODE_ENV,
  OTP_DEV_ECHO: process.env.OTP_DEV_ECHO,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  TENCENT_SECRET_ID: process.env.TENCENT_SECRET_ID,
  TENCENT_SECRET_KEY: process.env.TENCENT_SECRET_KEY,
  SES_REGION: process.env.SES_REGION,
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
  SES_TEMPLATE_ID: process.env.SES_TEMPLATE_ID,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(prevEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function setEnv(name: string, value: string) {
  process.env[name] = value;
}

enableMemoryOtpStoreForTests();

const badEmail = await issueEmailCode({ email: "not-an-email", ip: "1.1.1.1", now: 1_000 });
assert(!badEmail.ok && badEmail.status === 400, "坏邮箱要拒绝");

const t0 = 1_700_000_000_000;
const issued = await issueEmailCode({ email: "Ada@Example.com", ip: "203.0.113.8", now: t0 });
assert(issued.ok, "正常邮箱要能发码");
if (!issued.ok) throw new Error("unreachable");
assert(/^\d{6}$/.test(issued.code), "验证码是 6 位数字");
assert(issued.email === "ada@example.com", "邮箱要转成小写");
const stored = otpSecretsForTests(issued.email);
assert(stored.length === 1, "只存一条");
assert(stored[0].startsWith("scrypt$"), "验证码只存哈希");
assert(!stored[0].includes(issued.code), "存储里不能出现明文验证码");

const tooSoon = await issueEmailCode({ email: issued.email, ip: "203.0.113.9", now: t0 + 1_000 });
assert(!tooSoon.ok && tooSoon.status === 429, "同一邮箱 1 分钟内不能再发");

const verified = await verifyEmailCode({ email: "ADA@example.com", code: issued.code, now: t0 + 2_000 });
assert(verified.ok, "大小写不同的邮箱也能对上验证码");
const stillCooling = await issueEmailCode({ email: issued.email, ip: "203.0.113.9", now: t0 + 3_000 });
assert(!stillCooling.ok && stillCooling.status === 429, "用掉验证码后 1 分钟内不能再发");
const again = await verifyEmailCode({ email: issued.email, code: issued.code, now: t0 + 3_000 });
assert(!again.ok && again.message === "请先获取验证码。", "用过的验证码要删掉");

resetOtpMemory();
const fresh = await issueEmailCode({ email: "lock@example.com", ip: "203.0.113.10", now: t0 });
assert(fresh.ok, "锁定测试要能发码");
if (!fresh.ok) throw new Error("unreachable");
const miss = wrongCode(fresh.code);
for (let attempt = 1; attempt <= 4; attempt += 1) {
  const failed = await verifyEmailCode({ email: fresh.email, code: miss, now: t0 + attempt });
  assert(!failed.ok && failed.message === "验证码不正确。", `第 ${attempt} 次错码只提示不正确`);
}
const locked = await verifyEmailCode({ email: fresh.email, code: miss, now: t0 + 5 });
assert(!locked.ok && locked.status === 429, "第 5 次错码要锁定");
const duringLock = await verifyEmailCode({ email: fresh.email, code: fresh.code, now: t0 + 6 });
assert(!duringLock.ok && duringLock.message === "验证码错误次数过多，请 15 分钟后再试。", "锁定后正确码也不能用");
const resendLocked = await issueEmailCode({ email: fresh.email, ip: "203.0.113.11", now: t0 + OTP_RESEND_MS });
assert(!resendLocked.ok && resendLocked.status === 429, "锁定期间不能重发");
const afterLock = await issueEmailCode({ email: fresh.email, ip: "203.0.113.11", now: t0 + 5 + OTP_LOCK_MS + 1 });
assert(afterLock.ok, "锁定结束后可以再发");
if (!afterLock.ok) throw new Error("unreachable");
const afterOk = await verifyEmailCode({ email: fresh.email, code: afterLock.code, now: t0 + 5 + OTP_LOCK_MS + 2 });
assert(afterOk.ok, "新验证码在锁定结束后可用");

resetOtpMemory();
const counted = await issueEmailCode({ email: "count@example.com", ip: "203.0.113.12", now: t0 });
assert(counted.ok, "累计次数测试要能发码");
if (!counted.ok) throw new Error("unreachable");
for (let attempt = 0; attempt < 4; attempt += 1) {
  const failed = await verifyEmailCode({
    email: counted.email,
    code: wrongCode(counted.code),
    now: t0 + 10 + attempt,
  });
  assert(!failed.ok && failed.status === 400, "前 4 次错码不锁定");
}
const resent = await issueEmailCode({ email: counted.email, ip: "203.0.113.13", now: t0 + OTP_RESEND_MS });
assert(resent.ok, "满 1 分钟可以换一张新码");
if (!resent.ok) throw new Error("unreachable");
const fifth = await verifyEmailCode({ email: counted.email, code: wrongCode(resent.code), now: t0 + OTP_RESEND_MS + 1 });
assert(!fifth.ok && fifth.status === 429, "换码后错码要接着累计到 5 次");

resetOtpMemory();
const expiring = await issueEmailCode({ email: "expire@example.com", ip: "203.0.113.14", now: t0 });
assert(expiring.ok, "过期测试要能发码");
if (!expiring.ok) throw new Error("unreachable");
const expired = await verifyEmailCode({ email: expiring.email, code: expiring.code, now: t0 + OTP_TTL_MS });
assert(!expired.ok && expired.message === "验证码已过期，请重新获取。", "满 5 分钟算过期");

resetOtpMemory();
const dropped = await issueEmailCode({ email: "drop@example.com", ip: "203.0.113.15", now: t0 });
assert(dropped.ok, "发送失败回滚要能发码");
if (!dropped.ok) throw new Error("unreachable");
await discardIssuedCode(dropped.email, dropped.issuedAt);
const droppedVerify = await verifyEmailCode({ email: dropped.email, code: dropped.code, now: t0 + 1 });
assert(!droppedVerify.ok, "发信失败后这张码不能再用来注册");
const reissued = await issueEmailCode({ email: dropped.email, ip: "203.0.113.15", now: t0 + 1 });
assert(reissued.ok, "发信失败不能把这一分钟的重发也占掉");

resetOtpMemory();
for (let index = 0; index < OTP_IP_LIMIT; index += 1) {
  const sent = await issueEmailCode({
    email: `ip${index}@example.com`,
    ip: "198.51.100.20",
    now: t0 + index * OTP_RESEND_MS,
  });
  assert(sent.ok, `同一 IP 第 ${index + 1} 次应该还能发`);
}
const ipBlocked = await issueEmailCode({
  email: "ip-blocked@example.com",
  ip: "198.51.100.20",
  now: t0 + OTP_IP_LIMIT * OTP_RESEND_MS,
});
assert(!ipBlocked.ok && ipBlocked.status === 429, "同一 IP 一小时超过 10 次要拦住");
const otherIp = await issueEmailCode({
  email: "ip-ok@example.com",
  ip: "198.51.100.21",
  now: t0 + OTP_IP_LIMIT * OTP_RESEND_MS,
});
assert(otherIp.ok, "别的 IP 不受这一条限制");

const shortCode = await verifyEmailCode({ email: "ip-ok@example.com", code: "12345", now: t0 });
assert(!shortCode.ok && shortCode.message === "请填写 6 位验证码。", "不够 6 位要拒绝");

function clearMailEnv() {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.OTP_DEV_ECHO;
  delete process.env.TENCENT_SECRET_ID;
  delete process.env.TENCENT_SECRET_KEY;
  delete process.env.SES_REGION;
  delete process.env.SES_FROM_EMAIL;
  delete process.env.SES_TEMPLATE_ID;
}

setEnv("NODE_ENV", "development");
clearMailEnv();
assert(readSesOtpConfig().status === "absent", "四项都空时算没配邮件");
assert(canEchoOtpCode(), "开发环境可以回显验证码");
const echoed = await deliverOtpEmail("dev@example.com", "246810");
assert(echoed.ok && echoed.echoed && echoed.devCode === "246810", "没配密钥时开发环境要带回验证码");
if (!echoed.ok || !echoed.echoed) throw new Error("unreachable");
assert(otpSentBody(echoed).devCode === "246810", "开发环境响应里带验证码");
assert(otpMailText("246810") === "Yooco 验证码：246810，5 分钟内有效。", "模板建议用这一句中文");

process.env.RESEND_API_KEY = "re_test_key";
const ignoredResend = await deliverOtpEmail("dev@example.com", "246810");
assert(ignoredResend.ok && ignoredResend.echoed, "只剩 Resend 密钥时不再发信，开发环境仍回显");
delete process.env.RESEND_API_KEY;

setEnv("NODE_ENV", "test");
delete process.env.OTP_DEV_ECHO;
assert(!canEchoOtpCode(), "非开发、非生产默认不回显");
const hidden = await deliverOtpEmail("dev@example.com", "135790");
assert(!hidden.ok && hidden.message === "邮件服务未配置，暂时无法发送验证码。", "没密钥且不回显时要说清楚");
process.env.OTP_DEV_ECHO = "1";
assert(canEchoOtpCode(), "非生产可以显式打开回显");

setEnv("NODE_ENV", "production");
process.env.OTP_DEV_ECHO = "1";
process.env.RESEND_API_KEY = "re_test_key";
assert(!canEchoOtpCode(), "生产环境即使打开开关也不回显");
const productionHidden = await deliverOtpEmail("dev@example.com", "135791");
assert(!productionHidden.ok, "生产环境没配 SES 不能假装发送成功");
assert(!JSON.stringify(productionHidden).includes("135791"), "生产环境错误里不能带验证码");
const stripped = otpSentBody({ ok: true, echoed: true, devCode: "135791" });
assert(stripped.devCode === undefined && !JSON.stringify(stripped).includes("135791"), "生产环境响应不能带验证码");
delete process.env.RESEND_API_KEY;

setEnv("NODE_ENV", "development");
process.env.TENCENT_SECRET_ID = "AKIDpartial";
let fetchCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  fetchCalls += 1;
  return new Response("nope", { status: 500 });
};
try {
  const partial = await deliverOtpEmail("dev@example.com", "135792");
  assert(!partial.ok && partial.message === "邮件服务未配置，暂时无法发送验证码。", "只配了一部分不能回显");
  assert(!JSON.stringify(partial).includes("135792"), "配了一半时错误里不能带验证码");
  assert(fetchCalls === 0, "没配齐时不能去请求腾讯云");
} finally {
  globalThis.fetch = originalFetch;
}

clearMailEnv();
process.env.SES_REGION = "ap-beijing";
process.env.TENCENT_SECRET_ID = "AKIDtestexample";
process.env.TENCENT_SECRET_KEY = "test-secret-key";
process.env.SES_FROM_EMAIL = "noreply@yoooco.com";
process.env.SES_TEMPLATE_ID = "100091";
assert(readSesOtpConfig().status === "partial", "地域只能是香港或广州");

clearMailEnv();
process.env.TENCENT_SECRET_ID = "AKIDtestexample";
process.env.TENCENT_SECRET_KEY = "test-secret-key";
process.env.SES_FROM_EMAIL = "noreply@yoooco.com";
process.env.SES_TEMPLATE_ID = "0";
assert(readSesOtpConfig().status === "partial", "模板编号要是正整数");

const officialPayload = "{\"Limit\": 1, \"Filters\": [{\"Values\": [\"\\u672a\\u547d\\u540d\"], \"Name\": \"instance-name\"}]}";
const officialAuthorization = tc3Authorization({
  secretId: `AKID${"*".repeat(32)}`,
  secretKey: "*".repeat(32),
  service: "cvm",
  host: "cvm.tencentcloudapi.com",
  action: "DescribeInstances",
  timestamp: 1_551_113_065,
  payload: officialPayload,
});
assert(
  officialAuthorization ===
    `TC3-HMAC-SHA256 Credential=AKID${"*".repeat(32)}/2019-02-25/cvm/tc3_request, SignedHeaders=content-type;host;x-tc-action, Signature=10b1a37a7301a02ca19a647ad722d5e43b4b3cff309d421d85b46093f6ab6c4f`,
  "签名要和腾讯云文档示例一致",
);

setEnv("NODE_ENV", "development");
clearMailEnv();
process.env.TENCENT_SECRET_ID = "AKIDtestexample";
process.env.TENCENT_SECRET_KEY = "test-secret-key";
process.env.SES_FROM_EMAIL = "Yooco <noreply@yoooco.com>";
process.env.SES_TEMPLATE_ID = "100091";
const captured: { url: string; body: string; headers: Headers } = {
  url: "",
  body: "",
  headers: new Headers(),
};
globalThis.fetch = async (url, init) => {
  captured.url = String(url);
  captured.body = typeof init?.body === "string" ? init.body : "";
  captured.headers = new Headers(init?.headers);
  return new Response(JSON.stringify({ Response: { MessageId: "qcloud-ses-messageid", RequestId: "req-ok" } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
try {
  const mailed = await deliverOtpEmail("real@example.com", "112233");
  assert(mailed.ok && mailed.echoed === false, "配齐 SES 就要走模板发信，不回显");
  assert(captured.url === "https://ses.tencentcloudapi.com/", "发信地址是腾讯云 SES");
  const headers = captured.headers;
  assert(headers.get("x-tc-action") === "SendEmail", "接口是 SendEmail");
  assert(headers.get("x-tc-version") === "2020-10-02", "接口版本是 2020-10-02");
  assert(headers.get("x-tc-region") === "ap-hongkong", "没填地域时用香港");
  assert(headers.get("content-type") === "application/json; charset=utf-8", "正文类型要和签名一致");
  const timestamp = Number(headers.get("x-tc-timestamp"));
  const built = buildSesTemplateRequest({
    secretId: "AKIDtestexample",
    secretKey: "test-secret-key",
    region: "ap-hongkong",
    fromEmail: "Yooco <noreply@yoooco.com>",
    toEmail: "real@example.com",
    templateId: 100091,
    code: "112233",
    timestamp,
  });
  assert(captured.body === built.body, "发出去的正文就是拿来签名的那一份");
  assert(headers.get("authorization") === built.headers.authorization, "Authorization 用同一份正文算出来");
  assert(!captured.body.includes("test-secret-key"), "请求正文里不能有密钥");
  const payload = JSON.parse(captured.body) as {
    FromEmailAddress: string;
    Destination: string[];
    Subject: string;
    Template: { TemplateID: number; TemplateData: string };
    TriggerType: number;
  };
  assert(payload.FromEmailAddress === "Yooco <noreply@yoooco.com>", "使用已验证的发信地址");
  assert(payload.Destination[0] === "real@example.com", "发给注册邮箱");
  assert(payload.Subject === "Yooco 验证码", "主题是验证码");
  assert(payload.Template.TemplateID === 100091, "带上模板编号");
  assert(payload.Template.TemplateData === "{\"code\":\"112233\"}", "模板变量名叫 code");
  assert(payload.TriggerType === 1, "验证码走触发类通道");
  assert(!JSON.stringify(mailed).includes("112233"), "成功响应里没有验证码");

  process.env.SES_REGION = "ap-guangzhou";
  const guangzhou = await deliverOtpEmail("real@example.com", "112233");
  assert(guangzhou.ok && guangzhou.echoed === false, "广州地域也能发");
  assert(captured.headers.get("x-tc-region") === "ap-guangzhou", "地域跟着 SES_REGION 走");

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        Response: {
          Error: { Code: "FailedOperation.InvalidTemplateID", Message: "模板不可用" },
          RequestId: "req-bad",
        },
      }),
      { status: 200 },
    );
  const failedMail = await deliverOtpEmail("real@example.com", "112233");
  assert(!failedMail.ok && failedMail.message === "验证码发送失败，请稍后再试。", "腾讯云返回错误时要说发送失败");
  assert(!JSON.stringify(failedMail).includes("112233"), "失败响应里不能带验证码");

  globalThis.fetch = async () => new Response("nope", { status: 500 });
  const httpFailed = await deliverOtpEmail("real@example.com", "112233");
  assert(!httpFailed.ok && httpFailed.message === "验证码发送失败，请稍后再试。", "接口状态不对时也要说发送失败");
} finally {
  globalThis.fetch = originalFetch;
  restoreEnv();
}

setEnv("NODE_ENV", "development");
clearMailEnv();
resetOtpMemory();
const echoedResponse = await sendCodePost(
  new Request("http://local/api/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ email: "Route@Example.com" }),
  }),
);
const echoedBody = (await echoedResponse.json()) as { ok?: boolean; devCode?: string; message?: string };
assert(echoedResponse.ok && echoedBody.devCode && /^\d{6}$/.test(echoedBody.devCode), "发码接口在开发环境要带回验证码");
const echoedVerify = await verifyEmailCode({ email: "route@example.com", code: echoedBody.devCode });
assert(echoedVerify.ok, "接口带回的验证码要能通过注册校验");

resetOtpMemory();
process.env.TENCENT_SECRET_ID = "AKIDtestexample";
process.env.TENCENT_SECRET_KEY = "test-secret-key";
process.env.SES_FROM_EMAIL = "noreply@yoooco.com";
process.env.SES_TEMPLATE_ID = "100091";
globalThis.fetch = async () =>
  new Response(
    JSON.stringify({ Response: { Error: { Code: "FailedOperation.IncorrectSender", Message: "发件人未验证" }, RequestId: "req-route" } }),
    { status: 200 },
  );
try {
  const failedResponse = await sendCodePost(
    new Request("http://local/api/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ email: "route-fail@example.com" }),
    }),
  );
  const failedBody = (await failedResponse.json()) as { message?: string };
  assert(failedResponse.status === 502 && failedBody.message === "验证码发送失败，请稍后再试。", "发信失败时接口要返回 502");
  const leaked = await verifyEmailCode({ email: "route-fail@example.com", code: "000000" });
  assert(!leaked.ok && leaked.message === "请先获取验证码。", "发信失败后不能留下可用验证码");
} finally {
  globalThis.fetch = originalFetch;
  restoreEnv();
}

console.log("otp checks ok");
