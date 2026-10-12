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
import { canEchoOtpCode, deliverOtpEmail, otpMailText, otpSentBody } from "../lib/otp-mail";

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
};

function restoreEnv() {
  for (const [key, value] of Object.entries(prevEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
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

process.env.NODE_ENV = "development";
delete process.env.RESEND_API_KEY;
delete process.env.OTP_DEV_ECHO;
assert(canEchoOtpCode(), "开发环境可以回显验证码");
const echoed = await deliverOtpEmail("dev@example.com", "246810");
assert(echoed.ok && echoed.echoed && echoed.devCode === "246810", "没配密钥时开发环境要带回验证码");
if (!echoed.ok || !echoed.echoed) throw new Error("unreachable");
assert(otpSentBody(echoed).devCode === "246810", "开发环境响应里带验证码");
assert(otpMailText("246810") === "Yooco 验证码：246810，5 分钟内有效。", "邮件正文用这一句中文");

process.env.NODE_ENV = "test";
delete process.env.OTP_DEV_ECHO;
assert(!canEchoOtpCode(), "非开发、非生产默认不回显");
const hidden = await deliverOtpEmail("dev@example.com", "135790");
assert(!hidden.ok && hidden.message === "邮件服务未配置，暂时无法发送验证码。", "没密钥且不回显时要说清楚");
process.env.OTP_DEV_ECHO = "1";
assert(canEchoOtpCode(), "非生产可以显式打开回显");

process.env.NODE_ENV = "production";
process.env.OTP_DEV_ECHO = "1";
delete process.env.RESEND_API_KEY;
assert(!canEchoOtpCode(), "生产环境即使打开开关也不回显");
const productionHidden = await deliverOtpEmail("dev@example.com", "135791");
assert(!productionHidden.ok, "生产环境没密钥不能假装发送成功");
assert(!JSON.stringify(productionHidden).includes("135791"), "生产环境错误里不能带验证码");
const stripped = otpSentBody({ ok: true, echoed: true, devCode: "135791" });
assert(stripped.devCode === undefined && !JSON.stringify(stripped).includes("135791"), "生产环境响应不能带验证码");

process.env.NODE_ENV = "development";
process.env.RESEND_API_KEY = "re_test_key";
process.env.EMAIL_FROM = "Yooco <noreply@yoooco.com>";
const originalFetch = globalThis.fetch;
let captured: { url: string; init: RequestInit } | null = null;
globalThis.fetch = async (url, init) => {
  captured = { url: String(url), init: init || {} };
  return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
};
try {
  const mailed = await deliverOtpEmail("real@example.com", "112233");
  assert(mailed.ok && mailed.echoed === false, "配了密钥就要走真实发信，不回显");
  assert(captured?.url === "https://api.resend.com/emails", "发信地址是 Resend");
  const headers = new Headers(captured?.init.headers);
  assert(headers.get("authorization") === "Bearer re_test_key", "带上 Resend 密钥");
  const payload = JSON.parse(String(captured?.init.body)) as { from: string; to: string[]; subject: string; text: string };
  assert(payload.from === "Yooco <noreply@yoooco.com>", "使用 EMAIL_FROM");
  assert(payload.to[0] === "real@example.com", "发给注册邮箱");
  assert(payload.text === "Yooco 验证码：112233，5 分钟内有效。", "正文是规定的那一句");
  assert(!JSON.stringify(mailed).includes("112233"), "成功响应里没有验证码");

  globalThis.fetch = async () => new Response("nope", { status: 422 });
  const failedMail = await deliverOtpEmail("real@example.com", "112233");
  assert(!failedMail.ok && failedMail.message === "验证码发送失败，请稍后再试。", "发信失败要返回明确错误");
} finally {
  globalThis.fetch = originalFetch;
  restoreEnv();
}

console.log("otp checks ok");
