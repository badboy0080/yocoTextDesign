import type { Metadata } from "next";
import { AccountLayout } from "@/components/account-layout";
import { FaqTabsCard } from "@/components/faq-tabs-card";

export const metadata: Metadata = {
  title: "常见问题 · Yooco",
  description: "试用积分、邮箱验证码和邀请好友。",
};

export default function FaqPage() {
  return (
    <AccountLayout section="常见问题" skin="obsidian">
      <article className="faq-page">
        <p className="auth-eyebrow">YOOCO / HELP</p>
        <h1>常见问题</h1>
        <FaqTabsCard />
      </article>
    </AccountLayout>
  );
}
