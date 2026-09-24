"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, MoveUpRight } from "lucide-react";
import { AccountLayout } from "@/components/account-layout";

type Billing = "monthly" | "yearly";

export function SubscribePage() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const yearly = billing === "yearly";

  return (
    <AccountLayout section="订阅计划">
      <div className="account-container subscribe-page">
        <div className="account-index"><span>YOOCO / MEMBERSHIP</span><span>03 — 03</span></div>
        <section className="subscribe-hero" aria-labelledby="subscribe-heading">
          <div className="subscribe-hero-main">
            <p className="auth-eyebrow">A BETTER WAY TO PUBLISH / 订阅计划</p>
            <h1 id="subscribe-heading">好文章，<br /><em>值得</em>好版式<span className="subscribe-period">。</span></h1>
          </div>
          <div className="subscribe-hero-side">
            <div className="subscribe-issue">YOOCO<small>PLAN NO. 03</small></div>
            <p>从一篇草稿，到读者愿意停留的页面。先用完整工作台试试，再选择适合自己的节奏。</p>
          </div>
        </section>

        <section className="subscribe-plans" aria-labelledby="subscribe-plans-heading">
          <div className="subscribe-section-top"><h2 id="subscribe-plans-heading">选择你的创作节奏</h2><span>PLAN / 001—002</span></div>
          <div className="subscribe-billing" role="group" aria-label="专业版计费周期">
            <span>专业版计费方式</span>
            <div className="subscribe-billing-controls">
              <button type="button" className={!yearly ? "is-active" : ""} aria-pressed={!yearly} onClick={() => setBilling("monthly")}>按月</button>
              <button type="button" className={yearly ? "is-active" : ""} aria-pressed={yearly} onClick={() => setBilling("yearly")}>按年 <span>省 ¥58.9</span></button>
            </div>
          </div>
          <div className="subscribe-card-grid">
            <article className="subscribe-card subscribe-card-free">
              <div className="subscribe-card-top"><span>01 / FREE</span><span className="subscribe-card-symbol" aria-hidden="true">○</span></div>
              <div><h3>先试试</h3><p className="subscribe-card-description">不用注册，直接进入工作台。</p></div>
              <div className="subscribe-price"><strong>¥0</strong><span>/ 当前免费试用</span></div>
              <ul className="subscribe-features">
                <li><Check size={16} aria-hidden="true" />每天 10 次 AI 排版优化</li>
                <li><Check size={16} aria-hidden="true" />查看作品与排版灵感</li>
                <li><Check size={16} aria-hidden="true" />调整版式、复制与导出配置</li>
              </ul>
              <Link className="account-secondary-button" href="/works?panel=studio">开始免费试用 <ArrowRight size={18} aria-hidden="true" /></Link>
            </article>
            <article className="subscribe-card subscribe-card-pro">
              <div className="subscribe-card-top"><span>02 / PRO</span><span className="subscribe-card-symbol" aria-hidden="true">+</span></div>
              <div><h3>保持灵感不断线</h3><p className="subscribe-card-description">专业版方案预览，正式权益将随账号系统公布。</p></div>
              <div className="subscribe-price"><strong>{yearly ? "¥59.9" : "¥9.9"}</strong><span>/ {yearly ? "年" : "月"}</span></div>
              <ul className="subscribe-features">
                <li><Check size={16} aria-hidden="true" />延续免费版的完整排版工作台</li>
                <li><Check size={16} aria-hidden="true" />付费额度与账户权益待正式发布</li>
                <li><Check size={16} aria-hidden="true" />当前不收款，也不会自动订阅</li>
              </ul>
              <button className="account-primary-button" type="button" disabled aria-disabled="true">订阅即将开放 <ArrowRight size={18} aria-hidden="true" /></button>
            </article>
          </div>
          <p className="subscribe-disclosure">价格为当前方案预览；账号、支付与专业版权益尚未上线。正式开通前会明确展示权益和购买条款。</p>
        </section>

        <section className="subscribe-bottom" aria-labelledby="subscribe-bottom-heading">
          <div className="subscribe-bottom-label">THE PROCESS / 读者体验</div>
          <h2 id="subscribe-bottom-heading">好的阅读，<br />从第一眼开始。</h2>
          <div className="subscribe-bottom-details">
            <p>文章的价值在内容里，阅读的意愿从版式开始。Yooco 帮你把结构、留白与节奏安排得更舒服。</p>
            <Link href="/works">去看作品 <MoveUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </section>
        <div className="account-tail"><span>01 / 先体验</span><span>02 / 再创作</span><span>03 / 等待订阅开放</span></div>
      </div>
    </AccountLayout>
  );
}
