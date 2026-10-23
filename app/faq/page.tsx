import type { Metadata } from "next";
import { AccountLayout } from "@/components/account-layout";
import { FaqTabsCard } from "@/components/faq-tabs-card";
import { faqMetadata } from "@/lib/site-seo";

export const metadata: Metadata = faqMetadata;

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
