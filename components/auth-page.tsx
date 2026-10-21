"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AccountLayout } from "@/components/account-layout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { validEmail } from "@/lib/email-address";

const CODE_LENGTH = 6;

type Mode = "login" | "register";

function nextAfterLogin(): string {
  try {
    const next = new URLSearchParams(window.location.search).get("next") || "";
    if (next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && !next.includes("://")) return next;
  } catch {
    /* 非法回跳就回工作台 */
  }
  return "/studio.html";
}

export function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const inviteRef = useRef<HTMLInputElement>(null);
  const emailChecked = useRef(false);
  const codeReady = code.length === CODE_LENGTH;

  function emailProblem(value: string) {
    const email = value.trim();
    if (!email) return "请先填写邮箱";
    if (!validEmail(email)) return "请填写有效的邮箱";
    return "";
  }

  function syncEmailError(force = false) {
    const message = emailProblem(emailRef.current?.value || "");
    if (!force && !emailChecked.current) return message;
    emailChecked.current = true;
    setEmailError(message);
    return message;
  }

  function syncPasswordErrors(force = false) {
    if (!isRegister) return true;
    const password = passwordRef.current?.value || "";
    const confirm = confirmRef.current?.value || "";
    const passwordMessage = (password.length > 0 || force) && password.length < 8 ? "密码至少 8 位" : "";
    const confirmMessage = (confirm.length > 0 || (force && password.length >= 8)) && password !== confirm
      ? "两次密码不一致"
      : "";
    setPasswordError(passwordMessage);
    setConfirmError(confirmMessage);
    return !passwordMessage && !confirmMessage;
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    const message = syncEmailError(true);
    if (message) {
      emailRef.current?.focus();
      return;
    }
    const email = emailRef.current?.value.trim() || "";
    setSendingCode(true);
    setNotice("");
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({})) as { message?: string; devCode?: string };
      if (!response.ok) {
        setNotice(data.message || "验证码发送失败，请稍后再试。");
        return;
      }
      setCooldown(60);
      if (typeof data.devCode === "string" && /^\d{6}$/.test(data.devCode)) {
        setNotice(`验证码已发送。这是开发环境，验证码是 ${data.devCode}。`);
        return;
      }
      setNotice(data.message || "验证码已发送，请查收邮箱。");
    } catch {
      setNotice("暂时无法连接本机账号服务。");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit() {
    const nameMessage = isRegister && !(nameRef.current?.value.trim()) ? "请填写称呼" : "";
    const emailMessage = syncEmailError(true);
    const passwordsOk = syncPasswordErrors(true);
    setNameError(nameMessage);
    if (nameMessage) {
      nameRef.current?.focus();
      return;
    }
    if (emailMessage) {
      emailRef.current?.focus();
      return;
    }
    if (!isRegister) {
      if (!(passwordRef.current?.value || "")) {
        setPasswordError("请填写密码");
        passwordRef.current?.focus();
        return;
      }
      setPasswordError("");
    }
    if (!passwordsOk) {
      if ((passwordRef.current?.value || "").length < 8) passwordRef.current?.focus();
      else confirmRef.current?.focus();
      return;
    }
    if (isRegister && !codeReady) {
      setNotice("请填写 6 位邮箱验证码。");
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
          email: emailRef.current?.value || "",
          password: passwordRef.current?.value || "",
          inviteCode: inviteRef.current?.value || "",
          ...(isRegister ? { code } : {}),
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
      location.href = isRegister ? "/studio.html" : nextAfterLogin();
    } catch {
      setNotice("暂时无法连接本机账号服务。");
    } finally {
      setBusy(false);
    }
  }

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
              <p>{isRegister ? "为每一次创作，留一个专属位置。" : "让排版从上次的灵感继续。"}</p>
            </div>

            <div className="auth-form">
              {isRegister && (
                <label className={`auth-field${nameError ? " is-invalid" : ""}`}>
                  <span>称呼 <span className="auth-field-index">01</span></span>
                  <input ref={nameRef} type="text" placeholder="怎么称呼你" autoComplete="off" aria-invalid={nameError ? true : undefined} onInput={() => { if (nameError) setNameError(nameRef.current?.value.trim() ? "" : "请填写称呼"); }} />
                  {nameError && <small className="auth-field-error" role="alert">{nameError}</small>}
                </label>
              )}
              <div className={`auth-field${emailError ? " is-invalid" : ""}`}>
                <label htmlFor="auth-email">邮箱 <span className="auth-field-index">{isRegister ? "02" : "01"}</span></label>
                <div className="auth-email-row">
                  <input
                    id="auth-email"
                    ref={emailRef}
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="off"
                    inputMode="email"
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? "auth-email-error" : undefined}
                    onInput={() => syncEmailError(false)}
                    onBlur={() => { if (emailRef.current?.value.trim() || emailChecked.current) syncEmailError(true); }}
                  />
                  {isRegister && (
                    <button type="button" className="auth-code-button" onClick={sendCode} disabled={sendingCode || cooldown > 0}>
                      {sendingCode ? "正在发送…" : cooldown > 0 ? `${cooldown} 秒后重发` : "获取验证码"}
                    </button>
                  )}
                </div>
                {emailError && <small id="auth-email-error" className="auth-field-error" role="alert">{emailError}</small>}
              </div>
              {isRegister && (
                <div className="auth-field">
                  <span>验证码 <span className="auth-field-index">03</span></span>
                  <div className="auth-otp">
                    <InputOTP
                      maxLength={CODE_LENGTH}
                      value={code}
                      onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
                      pattern={REGEXP_ONLY_DIGITS}
                      inputMode="numeric"
                      pushPasswordManagerStrategy="none"
                      aria-label="邮箱验证码"
                      onPaste={(event) => {
                        const digits = (event.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, CODE_LENGTH);
                        if (!digits) return;
                        event.preventDefault();
                        setCode(digits);
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: CODE_LENGTH }, (_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <small className="auth-field-hint">发到上面的邮箱，5 分钟内有效。可以整段粘贴。</small>
                </div>
              )}
              <label className={`auth-field${passwordError ? " is-invalid" : ""}`}>
                <span>密码 <span className="auth-field-index">{isRegister ? "04" : "02"}</span></span>
                <span className="auth-password-wrap">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    placeholder={isRegister ? "至少 8 位字符" : "输入密码"}
                    autoComplete="off"
                    aria-invalid={passwordError ? true : undefined}
                    onInput={() => { if (isRegister) syncPasswordErrors(false); else if (passwordRef.current?.value) setPasswordError(""); }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "隐藏密码" : "显示密码"} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
                {passwordError && <small className="auth-field-error" role="alert">{passwordError}</small>}
              </label>
              {isRegister && (
                <label className={`auth-field${confirmError ? " is-invalid" : ""}`}>
                  <span>确认密码 <span className="auth-field-index">05</span></span>
                  <input
                    ref={confirmRef}
                    type="password"
                    placeholder="再次输入密码"
                    autoComplete="off"
                    aria-invalid={confirmError ? true : undefined}
                    onInput={() => syncPasswordErrors(false)}
                  />
                  {confirmError && <small className="auth-field-error" role="alert">{confirmError}</small>}
                </label>
              )}
              {isRegister && (
                <label className="auth-field">
                  <span>邀请码（选填） <span className="auth-field-index">06</span></span>
                  <input ref={inviteRef} type="text" placeholder="有就填，没有也能注册" autoComplete="off" maxLength={16} spellCheck={false} />
                  <small className="auth-field-hint">填了邀请码并注册成功，双方各 +5 积分。<Link href="/faq">常见问题</Link></small>
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
