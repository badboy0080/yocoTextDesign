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
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function handlePreview() {
    for (const field of [nameRef.current, emailRef.current, passwordRef.current, confirmRef.current]) {
      if (field && !field.reportValidity()) return;
    }
    if (isRegister) {
      if (passwordRef.current?.value !== confirmRef.current?.value) {
        setNotice("两次输入的密码不一致，请重新确认。");
        return;
      }
    }
    setNotice("账号功能正在准备中。现在可以直接进入工作台试用，无需注册。");
  }

  return (
    <AccountLayout section={isRegister ? "创建账户" : "欢迎回来"}>
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

            <div className="auth-preview-note" role="note">页面预览：账号功能尚未开放。填写内容不会发送或保存。</div>

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
              <button className="account-primary-button" type="button" onClick={handlePreview}>
                {isRegister ? "预览注册流程" : "预览登录流程"}<ArrowRight size={19} aria-hidden="true" />
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
