import { accountDocFromStored, loginLookup, parseSignupIdentity, toPublicAccount, userMatchesLogin } from "../lib/local-accounts.ts";
import {
  chooseSignupOtp,
  oneIdBasicAuthorization,
  oneIdErrorMessage,
  oneIdPortalOrigin,
  otpSendBody,
  readOneIdConfig,
  resolveSignupChannel,
  sendSignupOtp,
  signupBody,
  signupWithOneId,
} from "../lib/oneid.ts";
import { normalizePhone, validPhone } from "../lib/phone-number.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const secret = "TENANT_CLIENT_SECRET";
const basic = oneIdBasicAuthorization("TENANT_CLIENT_ID", secret);
assert(basic === "Basic VEVOQU5UX0NMSUVOVF9JRDpURU5BTlRfQ0xJRU5UX1NFQ1JFVA==", "Basic 头要按文档的 url_encode 再 base64");
assert(!basic.includes(secret), "编码后的头里不要出现原始密钥");

assert(oneIdPortalOrigin("xxx.portal.tencentciam.com") === "https://xxx.portal.tencentciam.com", "裸域名要补上 https");
assert(oneIdPortalOrigin("https://xxx.portal.tencentciam.com/") === "https://xxx.portal.tencentciam.com", "带协议和斜杠也要收成同一地址");
assert(oneIdPortalOrigin("HTTPS://xxx.portal.tencentciam.com/otp/send") === "https://xxx.portal.tencentciam.com", "路径不要留在域名里");
assert(oneIdPortalOrigin("not a host") === null, "坏域名要拒绝");

assert(chooseSignupOtp({}, "email") === "local-email", "没配 OneID 时邮箱走旧验证码");
assert(chooseSignupOtp({}, "phone") === "need-oneid", "没配 OneID 时手机不能发码");
assert(chooseSignupOtp({ ONEID_CLIENT_ID: "only-id" }, "email") === "misconfigured", "只配一个变量时不要回退发信");
const partial = readOneIdConfig({ ONEID_PORTAL_HOST: "xxx.portal.tencentciam.com" });
assert(!partial.configured && partial.message.includes("ONEID_CLIENT_ID") && partial.message.includes("ONEID_CLIENT_SECRET"), "缺配置要指出还缺哪几个变量");
const ready = readOneIdConfig({
  ONEID_PORTAL_HOST: "https://xxx.portal.tencentciam.com/",
  ONEID_CLIENT_ID: "TENANT_CLIENT_ID",
  ONEID_CLIENT_SECRET: secret,
});
assert(ready.configured && ready.config.origin === "https://xxx.portal.tencentciam.com", "三个都配齐才算 OneID");

const phoneContact = resolveSignupChannel({ channel: "phone", phone: "+86 136-1234-5678", email: "also@example.com" });
assert(phoneContact.ok && phoneContact.channel === "phone" && phoneContact.phone === "13612345678" && phoneContact.email === "", "选了手机就不要带上邮箱");
const emailContact = resolveSignupChannel({ channel: "email", email: "Ada@Example.com", phone: "13612345678" });
assert(emailContact.ok && emailContact.channel === "email" && emailContact.email === "ada@example.com" && emailContact.phone === "", "选了邮箱就不要带上手机");
const badPhone = resolveSignupChannel({ channel: "phone", phone: "12345" });
assert(!badPhone.ok && badPhone.message.includes("11 位"), "坏手机号要说清楚");

const emailSend = otpSendBody({ channel: "email", email: "ada@example.com", phone: "" });
assert(JSON.stringify(emailSend) === JSON.stringify({ usage: "signup", email: "ada@example.com" }), "邮箱发码只带 email");
const phoneSend = otpSendBody({ channel: "phone", email: "", phone: "13612345678" });
assert(!("email" in phoneSend) && phoneSend.phone_number === "13612345678" && phoneSend.usage === "signup", "手机发码只带 phone_number");

const emailSignup = signupBody({
  channel: "email",
  email: "ada@example.com",
  phone: "13612345678",
  otpToken: "email-token",
  otp: "123456",
  password: "password-8",
});
assert(Object.keys(emailSignup).sort().join(",") === "email,email_otp,email_otp_token,password", "邮箱注册不要带手机字段");
assert(emailSignup.email_otp_token === "email-token" && emailSignup.email_otp === "123456", "邮箱注册带验证码和凭证");
const phoneSignup = signupBody({
  channel: "phone",
  email: "ada@example.com",
  phone: "13612345678",
  otpToken: "phone-token",
  otp: "654321",
  password: "password-8",
});
assert(Object.keys(phoneSignup).sort().join(",") === "password,phone_number,phone_number_otp,phone_number_otp_token", "手机注册不要带邮箱字段");

assert(oneIdErrorMessage("misconfigured", "Sign up flow of the application is not enabled.").includes("注册流程"), "没开注册流程要说人话");
assert(oneIdErrorMessage("bad_email_otp", "").includes("不正确或已过期"), "错验证码要说人话");
assert(oneIdErrorMessage("bad_phone_number_otp_token", "").includes("过期"), "过期凭证要说人话");
assert(oneIdErrorMessage("insufficient_sms_quota", "").includes("短信额度"), "短信额度不足要说人话");

const env = {
  ONEID_PORTAL_HOST: "xxx.portal.tencentciam.com",
  ONEID_CLIENT_ID: "TENANT_CLIENT_ID",
  ONEID_CLIENT_SECRET: secret,
};
const calls: { url: string; init?: RequestInit }[] = [];
function mockFetch(handler: (url: string, init?: RequestInit) => Response): typeof fetch {
  return (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return handler(url, init);
  }) as typeof fetch;
}

calls.length = 0;
const sent = await sendSignupOtp({
  channel: "email",
  email: "ada@example.com",
  phone: "",
  env,
  fetchImpl: mockFetch(() => Response.json({ otp_token: "otp-1" })),
});
assert(sent.ok && sent.value.otpToken === "otp-1" && sent.value.target === "ada@example.com", "发码要把 otp_token 交回调用方");
assert(calls.length === 1 && calls[0]?.url === "https://xxx.portal.tencentciam.com/otp/send", "发码只打一次 /otp/send");
const sendHeader = new Headers(calls[0]?.init?.headers).get("authorization");
assert(sendHeader === basic, "发码要带 Basic，不能把密钥另放一头");
const sendJson = JSON.parse(String(calls[0]?.init?.body));
assert(!("phone_number" in sendJson), "邮箱发码请求体里没有手机号");

calls.length = 0;
const signed = await signupWithOneId({
  channel: "phone",
  email: "",
  phone: "13612345678",
  otpToken: "otp-1",
  otp: "123456",
  password: "password-8",
  env,
  fetchImpl: mockFetch(() => Response.json({ sub: "user-sub-1" })),
});
assert(signed.ok && signed.value.sub === "user-sub-1", "注册成功要拿到 sub");
assert(calls.length === 1 && calls[0]?.url.endsWith("/signup"), "注册只打一次 /signup");
const signupJson = JSON.parse(String(calls[0]?.init?.body)) as Record<string, string>;
assert(signupJson.phone_number === "13612345678" && !("email" in signupJson), "手机注册请求里没有邮箱");
assert(!JSON.stringify(calls[0]?.init?.body).includes(secret), "请求体里不要出现密钥");

calls.length = 0;
const leaked = await sendSignupOtp({
  channel: "phone",
  email: "",
  phone: "13612345678",
  env,
  fetchImpl: mockFetch(() => new Response(JSON.stringify({ error: "misconfigured", error_description: `Sign up flow of the application is not enabled. secret=${secret}` }), { status: 400 })),
});
assert(!leaked.ok && leaked.message.includes("注册流程") && !leaked.message.includes(secret), "错误文案不要把密钥吐回去");

const missing = await sendSignupOtp({
  channel: "email",
  email: "ada@example.com",
  phone: "",
  env: {},
  fetchImpl: mockFetch(() => {
    throw new Error("不应该发出请求");
  }),
});
assert(!missing.ok && missing.status === 503 && missing.message.includes("ONEID_PORTAL_HOST"), "没配齐时不要发请求，并说明缺配置");

const phoneUser = parseSignupIdentity({
  name: "阿超",
  password: "password-8",
  phone: "13612345678",
  oneIdSub: "user-sub-1",
});
assert(phoneUser.ok && phoneUser.email === "13612345678" && phoneUser.phone === "13612345678" && phoneUser.oneIdSub === "user-sub-1", "没邮箱时用手机号当本地主键，并留下 sub");
const both = parseSignupIdentity({ name: "阿超", password: "password-8", email: "ada@example.com", phone: "13612345678" });
assert(!both.ok && both.message.includes("其中一种"), "同一次不要邮箱和手机都要");
assert(validPhone(normalizePhone("+86 136 1234 5678")), "带 +86 的手机号能收成 11 位");

const stored = accountDocFromStored({
  users: [
    {
      id: 1,
      email: "admin@yoooco.com",
      name: "管理员",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-01-01T00:00:00.000Z",
      unlimitedUses: true,
    },
    {
      id: 2,
      email: "13612345678",
      phone: "+86 136-1234-5678",
      oneIdSub: "user-sub-1",
      name: "手机用户",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  sessions: [{ tokenHash: "abc", userId: 1, expiresAt: 1 }],
});
assert(stored.users[0]?.unlimitedUses === true && stored.users[0]?.email === "admin@yoooco.com", "管理员账号和 unlimitedUses 要原样留下");
assert(stored.users[0]?.phone === undefined && stored.users[0]?.oneIdSub === undefined, "管理员不要被写成手机账号");
assert(stored.users[1]?.phone === "13612345678" && stored.users[1]?.oneIdSub === "user-sub-1", "手机账号要留下手机号和 sub");
assert(toPublicAccount(stored.users[0]!).unlimitedUses === true, "管理员登录态仍是不限次数");
assert(userMatchesLogin(stored.users[0]!, loginLookup("Admin@Yoooco.com")), "管理员仍用邮箱密码登录");
assert(userMatchesLogin(stored.users[1]!, loginLookup("13612345678")), "手机账号可以用手机号登录");
assert(!userMatchesLogin(stored.users[1]!, loginLookup("admin@yoooco.com")), "手机账号不能用别人的邮箱对上");

console.log("oneid checks ok");
