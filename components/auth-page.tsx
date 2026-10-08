"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AccountLayout } from "@/components/account-layout";

type Mode = "login" | "register";

export function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    for (const field of [nameRef.current, emailRef.current, passwordRef.current, confirmRef.current]) {
      if (field && !field.reportValidity()) return;
    }
    if (isRegister && passwordRef.current?.value !== confirmRef.current?.value) {
      setNotice("两次输入的密码不一致，请重新确认。");
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

  return (
    <AccountLayout section={isRegister ? "创建账户" : "欢迎回来"} skin="obsidian">
      <div className="account-container auth-page">
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

            <div className="auth-preview-note" role="note">本机测试时，账号只在这次打开的服务里有效。部署到 Edge 之后，同事才能用同一套账号登录。</div>

            <div className="auth-form">
              {isRegister && (
                <label className="auth-field">
                  <span>称呼 <span className="auth-field-index">01</span></span>
                  <input ref={nameRef} type="text" placeholder="怎么称呼你" autoComplete="off" required />
                </label>
              )}
              <label className="auth-field">
                <span>邮箱 <span className="auth-field-index">{isRegister ? "02" : "01"}</span></span>
                <input ref={emailRef} type="email" placeholder="name@example.com" autoComplete="off" required />
              </label>
              <label className="auth-field">
                <span>密码 <span className="auth-field-index">{isRegister ? "03" : "02"}</span></span>
                <span className="auth-password-wrap">
                  <input ref={passwordRef} type={showPassword ? "text" : "password"} placeholder={isRegister ? "至少 8 位字符" : "输入密码"} autoComplete="off" minLength={isRegister ? 8 : undefined} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "隐藏密码" : "显示密码"} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              {isRegister && (
                <label className="auth-field">
                  <span>确认密码 <span className="auth-field-index">04</span></span>
                  <input ref={confirmRef} type="password" placeholder="再次输入密码" autoComplete="off" minLength={8} required />
                </label>
              )}
              <button className="account-primary-button" type="button" onClick={handleSubmit} disabled={busy}>
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
