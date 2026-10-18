"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AccountLayout } from "@/components/account-layout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { normalizeEmail, validEmail } from "@/lib/email-address";
import { normalizePhone, validPhone } from "@/lib/phone-number";

type Mode = "login" | "register";
type Channel = "email" | "phone";

function currentTarget(channel: Channel, raw: string): string {
  return channel === "phone" ? normalizePhone(raw) : normalizeEmail(raw);
}

export function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [channel, setChannel] = useState<Channel>("email");
  const [contact, setContact] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [sentTarget, setSentTarget] = useState("");
  const [provider, setProvider] = useState<"" | "oneid" | "local">("");
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const inviteRef = useRef<HTMLInputElement>(null);
  const targetNow = isRegister ? currentTarget(channel, contact) : "";
  const contactChanged = Boolean(sentTarget) && targetNow !== sentTarget;
  const codeReady = code.length === 6 && !contactChanged && (provider !== "oneid" || Boolean(otpToken));

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function switchChannel(next: Channel) {
    if (next === channel) return;
    setChannel(next);
    setContact("");
    setCode("");
    setOtpToken("");
    setSentTarget("");
    setProvider("");
    setCooldown(0);
    setNotice("");
    contactRef.current?.focus();
  }

  async function sendCode() {
    const raw = contact.trim();
    if (channel === "phone") {
      if (!validPhone(normalizePhone(raw))) {
        setNotice("请填写国内 11 位手机号。");
        contactRef.current?.focus();
        return;
      }
    } else if (!validEmail(normalizeEmail(raw))) {
      setNotice("请先填写邮箱。");
      contactRef.current?.focus();
      return;
    }
    setSendingCode(true);
    setNotice("");
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(channel === "phone" ? { channel: "phone", phone: raw } : { channel: "email", email: raw }),
      });
      const data = await response.json().catch(() => ({})) as {
        message?: string;
        devCode?: string;
        otpToken?: string;
        provider?: string;
        target?: string;
      };
      if (!response.ok) {
        setNotice(data.message || "验证码发送失败，请稍后再试。");
        return;
      }
      setCooldown(60);
      setCode("");
      setSentTarget(typeof data.target === "string" && data.target ? data.target : currentTarget(channel, raw));
      setProvider(data.provider === "oneid" ? "oneid" : "local");
      setOtpToken(typeof data.otpToken === "string" ? data.otpToken : "");
      if (typeof data.devCode === "string" && /^\d{6}$/.test(data.devCode)) {
        setNotice(`验证码已发送。这是开发环境，验证码是 ${data.devCode}。`);
        return;
      }
      setNotice(data.message || (channel === "phone" ? "验证码已发送，请查收短信。" : "验证码已发送，请查收邮箱。"));
    } catch {
      setNotice("暂时无法连接本机账号服务。");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit() {
    for (const field of [nameRef.current, contactRef.current, passwordRef.current, confirmRef.current]) {
      if (field && !field.reportValidity()) return;
    }
    if (!isRegister) {
      const lookupEmail = validEmail(normalizeEmail(contact));
      const lookupPhone = validPhone(normalizePhone(contact));
      if (!lookupEmail && !lookupPhone) {
        setNotice("请填写邮箱或国内 11 位手机号。");
        contactRef.current?.focus();
        return;
      }
    }
    if (isRegister && channel === "phone" && !validPhone(normalizePhone(contact))) {
      setNotice("请填写国内 11 位手机号。");
      contactRef.current?.focus();
      return;
    }
    if (isRegister && channel === "email" && !validEmail(normalizeEmail(contact))) {
      setNotice("请填写有效的邮箱。");
      contactRef.current?.focus();
      return;
    }
    if (isRegister && passwordRef.current?.value !== confirmRef.current?.value) {
      setNotice("两次输入的密码不一致，请重新确认。");
      return;
    }
    if (isRegister && contactChanged) {
      setNotice(channel === "phone" ? "手机号已改，请重新获取验证码。" : "邮箱已改，请重新获取验证码。");
      return;
    }
    if (isRegister && provider === "oneid" && !otpToken) {
      setNotice("请先获取验证码。");
      return;
    }
    if (isRegister && !codeReady) {
      setNotice(channel === "phone" ? "请填写 6 位短信验证码。" : "请填写 6 位邮箱验证码。");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: nameRef.current?.value || "",
          password: passwordRef.current?.value || "",
          inviteCode: inviteRef.current?.value || "",
          ...(isRegister
            ? {
                channel,
                code,
                ...(otpToken ? { otpToken } : {}),
                ...(channel === "phone" ? { phone: contact } : { email: contact }),
              }
            : validPhone(normalizePhone(contact)) && !validEmail(normalizeEmail(contact))
              ? { phone: contact }
              : { email: contact }),
          deviceId: (() => {
            try { return localStorage.getItem("yooco-device-id") || ""; } catch { return ""; }
          })(),
        }),
      });
      const data = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) {
        setNotice(data.message || "暂时无法完成，请稍后再试。");
        return;
      }
      location.href = "/studio.html";
    } catch {
      setNotice("暂时无法连接本机账号服务。");
    } finally {
      setBusy(false);
    }
  }

  const contactLabel = isRegister ? (channel === "phone" ? "手机号" : "邮箱") : "邮箱或手机号";
  const codeHint = contactChanged
    ? (channel === "phone" ? "手机号已改，请重新获取验证码。" : "邮箱已改，请重新获取验证码。")
    : sentTarget
      ? `验证码发到 ${sentTarget}，${provider === "oneid" ? "大约 1 分钟内有效" : "5 分钟内有效"}`
      : channel === "phone"
        ? "发到上面的手机号。先获取验证码"
        : "发到上面的邮箱。先获取验证码";

  return (
    <AccountLayout section={isRegister ? "创建账户" : "欢迎回来"} skin="obsidian">
      <div className={`account-container auth-page${isRegister ? " is-register" : ""}`}>
        <div className="account-index"><span>YOOCO / ACCOUNT</span><span>{isRegister ? "02" : "01"} — 03</span></div>
        <div className="auth-grid">
          <section className={`auth-editorial ${isRegister ? "auth-editorial-register" : ""}`} aria-label="Yooco 账号说明">
            <div className="auth-editorial-top"><span>YOOCO / ACCOUNT</span><span>{isRegister ? "CREATE" : "SIGN IN"}</span></div>
            <div className="auth-editorial-center">
              <p className="auth-small-title">专注内容，也照顾呈现</p>
              <h1>{isRegister ? <>为下一篇<br /><em>留下位置。</em></> : <>从上次的灵感<br /><em>继续创作。</em></>}</h1>
              <p className="auth-editorial-caption">保存你的工作台偏好，随时回到文章。</p>
            </div>
            <div className="auth-editorial-bottom"><span>文字 · 版式 · 阅读</span><span>YOOCO STUDIO</span></div>
          </section>

          <section className="auth-panel" aria-labelledby="auth-title">
            <div className="auth-panel-heading">
              <p className="auth-eyebrow">{isRegister ? "JOIN THE STUDIO / 02" : "MEMBER ACCESS / 01"}</p>
              <h2 id="auth-title">{isRegister ? "创建你的账户" : "欢迎回来"}</h2>
              <p>{isRegister ? "用邮箱或手机号注册，每次只选一种。" : "邮箱或手机号都可以登录。"}</p>
            </div>

            <div className="auth-form">
              {isRegister && (
                <label className="auth-field">
                  <span>称呼 <span className="auth-field-index">01</span></span>
                  <input ref={nameRef} type="text" placeholder="怎么称呼你" autoComplete="off" required />
                </label>
              )}
              {isRegister && (
                <div className="auth-field">
                  <span>验证方式 <span className="auth-field-index">02</span></span>
                  <div className="auth-channel" role="group" aria-label="验证方式">
                    <button type="button" aria-pressed={channel === "email"} onClick={() => switchChannel("email")}>邮箱</button>
                    <button type="button" aria-pressed={channel === "phone"} onClick={() => switchChannel("phone")}>手机</button>
                  </div>
                </div>
              )}
              <label className="auth-field">
                <span>{contactLabel} <span className="auth-field-index">{isRegister ? "03" : "01"}</span></span>
                <input
                  ref={contactRef}
                  type={isRegister && channel === "email" ? "email" : "text"}
                  inputMode={(!isRegister || channel === "phone") ? "text" : undefined}
                  placeholder={isRegister ? (channel === "phone" ? "11 位手机号" : "name@example.com") : "邮箱或 11 位手机号"}
                  autoComplete="off"
                  required
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                />
              </label>
              {isRegister && (
                <div className="auth-field">
                  <span>
                    <span>验证码 <span className="auth-field-index">04</span></span>
                    <button type="button" className="auth-code-button" onClick={sendCode} disabled={sendingCode || cooldown > 0}>
                      {sendingCode ? "正在发送…" : cooldown > 0 ? `${cooldown} 秒后重发` : "获取验证码"}
                    </button>
                  </span>
                  <div className="auth-otp">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                      pattern={REGEXP_ONLY_DIGITS}
                      inputMode="numeric"
                      pushPasswordManagerStrategy="none"
                      aria-label={channel === "phone" ? "短信验证码" : "邮箱验证码"}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }, (_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <small className="auth-field-hint">{codeHint}</small>
                </div>
              )}
              <label className="auth-field">
                <span>密码 <span className="auth-field-index">{isRegister ? "05" : "02"}</span></span>
                <span className="auth-password-wrap">
                  <input ref={passwordRef} type={showPassword ? "text" : "password"} placeholder={isRegister ? "至少 8 位字符" : "输入密码"} autoComplete="off" minLength={isRegister ? 8 : undefined} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "隐藏密码" : "显示密码"} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              {isRegister && (
                <label className="auth-field">
                  <span>确认密码 <span className="auth-field-index">06</span></span>
                  <input ref={confirmRef} type="password" placeholder="再次输入密码" autoComplete="off" minLength={8} required />
                </label>
              )}
              {isRegister && (
                <label className="auth-field">
                  <span>邀请码（选填） <span className="auth-field-index">07</span></span>
                  <input ref={inviteRef} type="text" placeholder="没有也可以注册" autoComplete="off" maxLength={16} spellCheck={false} />
                  <small className="auth-field-hint">填了多 5 次免费</small>
                </label>
              )}
              <button className="account-primary-button" type="button" onClick={handleSubmit} disabled={busy || (isRegister && !codeReady)} title={isRegister && !codeReady ? "请先填写 6 位验证码" : undefined}>
                {busy ? "正在提交…" : isRegister ? "创建账户" : "登录"}<ArrowRight size={19} aria-hidden="true" />
              </button>
              {notice && <p className="auth-notice" role="status">{notice}</p>}
            </div>

            <div className="auth-panel-bottom">
              <p>{isRegister ? "已经有账户？" : "还没有账户？"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "返回登录" : "创建账户"} ↗</Link></p>
              <Link className="account-secondary-button" href="/works?panel=studio">免登录试用工作台 <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </section>
        </div>
        <div className="account-tail"><span>01 / 专注内容</span><span>02 / 呈现细节</span><span>03 / 留住读者</span></div>
      </div>
    </AccountLayout>
  );
}
