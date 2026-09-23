"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AccountLayout } from "@/components/account-layout";

type Mode = "login" | "register";

export function AuthPage({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
  }

  return (
    <AccountLayout section={isRegister ? "创建账户" : "欢迎回来"}>
      <div className="account-container auth-page">
        <div className="account-index"><span>YOOCO / ACCOUNT</span><span>{isRegister ? "02" : "01"} — 03</span></div>
        <div className="auth-grid">
          <section className={`auth-editorial ${isRegister ? "auth-editorial-register" : ""}`} aria-label="Yooco 品牌介绍">
            <div className="auth-editorial-top"><span>WORDS DESERVE DESIGN.</span><span>VOL. 01 / 2026</span></div>
            <div className="auth-editorial-center">
              <p className="auth-small-title">THE ART OF READING</p>
              <h1>{isRegister ? <>开始写下<br /><em>你的</em>下一篇。</> : <>好文章，<br />值得被<em>读完。</em></>}</h1>
              <p className="auth-editorial-caption">From a draft to a story worth staying for.</p>
            </div>
            <div className="auth-editorial-bottom"><span>文字 · 版式 · 阅读</span><span className="auth-edition-mark">Y<span>✳</span></span></div>
            <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
            <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
          </section>

          <section className="auth-panel" aria-labelledby="auth-title">
            <div className="auth-panel-heading">
              <p className="auth-eyebrow">{isRegister ? "JOIN THE STUDIO / 02" : "MEMBER ACCESS / 01"}</p>
              <h2 id="auth-title">{isRegister ? "创建你的账户" : "欢迎回来"}</h2>
              <p>{isRegister ? "为每一次创作，留一个专属位置。" : "让排版从上次的灵感继续。"}</p>
            </div>

            <div className="auth-preview-note" role="note">页面预览：账号功能尚未开放。填写内容不会发送或保存。</div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegister && (
                <label className="auth-field">
                  <span>称呼 <span className="auth-field-index">01</span></span>
                  <input name="name" type="text" placeholder="怎么称呼你" autoComplete="off" required />
                </label>
              )}
              <label className="auth-field">
                <span>邮箱 <span className="auth-field-index">{isRegister ? "02" : "01"}</span></span>
                <input name="email" type="email" placeholder="name@example.com" autoComplete="off" required />
              </label>
              <label className="auth-field">
                <span>密码 <span className="auth-field-index">{isRegister ? "03" : "02"}</span></span>
                <span className="auth-password-wrap">
                  <input name="password" type={showPassword ? "text" : "password"} placeholder={isRegister ? "至少 8 位字符" : "输入密码"} autoComplete="off" minLength={isRegister ? 8 : undefined} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "隐藏密码" : "显示密码"} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              {isRegister && (
                <label className="auth-field">
                  <span>确认密码 <span className="auth-field-index">04</span></span>
                  <input name="confirm-password" type="password" placeholder="再次输入密码" autoComplete="off" minLength={8} required />
                </label>
              )}
              <button className="account-primary-button" type="submit">
                {isRegister ? "预览注册流程" : "预览登录流程"}<ArrowRight size={19} aria-hidden="true" />
              </button>
              {notice && <p className="auth-notice" role="status">账号功能正在准备中。现在可以直接进入工作台试用，无需注册。</p>}
            </form>

            <div className="auth-panel-bottom">
              <p>{isRegister ? "已经有账户？" : "还没有账户？"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "返回登录" : "创建账户"} ↗</Link></p>
              <Link className="account-secondary-button" href="/studio">免登录试用工作台 <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </section>
        </div>
        <div className="account-tail"><span>01 / 专注内容</span><span>02 / 呈现细节</span><span>03 / 留住读者</span></div>
      </div>
    </AccountLayout>
  );
}
