import {
  sessionClearCookieHeaders,
  sessionSetCookieHeaders,
  sessionTokensFromHeader,
} from "../lib/local-accounts.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const header = "theme=fresh; yooco_session=abc_def-123; yooco_session=second-token";
const tokens = sessionTokensFromHeader(header);
assert(tokens.length === 2, "www 和裸域名各带一枚时，两枚都要读到");
assert(tokens[0] === "abc_def-123", "第一枚登录票要原样留下");
assert(tokens[1] === "second-token", "第二枚登录票也要留下");
assert(sessionTokensFromHeader(null).length === 0, "没有 cookie 就是未登录");
assert(sessionTokensFromHeader("other=1").length === 0, "别的 cookie 不能当成登录票");

const httpHost = new Request("http://yoooco.com/api/auth/login", { headers: { host: "yoooco.com" } });
const setOnApex = sessionSetCookieHeaders("token-a", httpHost);
assert(setOnApex.length === 2, "正式站要同时写当前主机和 .yoooco.com");
assert(setOnApex.every((line) => line.includes("yooco_session=token-a")), "两枚都是这次的登录票");
assert(setOnApex.some((line) => line.includes("Domain=.yoooco.com")), "www 和裸域名要共用 Domain");
assert(setOnApex.every((line) => !line.includes("Secure")), "http://yoooco.com 不能加 Secure，否则浏览器丢掉 cookie");
assert(setOnApex.every((line) => line.includes("HttpOnly") && line.includes("SameSite=Lax") && line.includes("Path=/")), "登录票仍只给同源请求");

const www = new Request("https://www.yoooco.com/api/auth/login", {
  headers: { host: "www.yoooco.com", "x-forwarded-proto": "https" },
});
const setOnWww = sessionSetCookieHeaders("token-b", www);
assert(setOnWww.some((line) => line.includes("Domain=.yoooco.com")), "从 www 登录也要写到 .yoooco.com");
assert(setOnWww.every((line) => !line.includes("Secure")), "正式站还有 http，登录票不加 Secure");

const local = new Request("http://localhost:5174/api/auth/login", { headers: { host: "localhost:5174" } });
const setLocal = sessionSetCookieHeaders("token-c", local);
assert(setLocal.length === 1, "本机只写当前主机");
assert(!setLocal[0]?.includes("Domain="), "本机不要写 .yoooco.com");

const cleared = sessionClearCookieHeaders(httpHost);
assert(cleared.length === 2, "退出时主机和 .yoooco.com 都要清");
assert(cleared.every((line) => line.includes("Max-Age=0")), "退出要把登录票设成过期");

console.log("session cookie checks ok");
