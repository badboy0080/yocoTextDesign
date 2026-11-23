import type { Metadata } from "next";
import { AccountLayout } from "@/components/account-layout";
import { CHANGELOG } from "@/lib/changelog";
import { absoluteUrl } from "@/lib/site-seo";

const title = "更新日志 | Yooco";
const description = "按日期记录产品变化，新的在前。";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: absoluteUrl("/changelog") },
};

export default function ChangelogPage() {
  return (
    <AccountLayout section="更新日志" skin="obsidian" current="changelog">
      <article className="faq-page changelog-page">
        <p className="auth-eyebrow">YOOCO / 更新</p>
        <h1>更新日志</h1>
        <p className="changelog-lead">按日期记录产品变化，新的在前。</p>
        <ol className="changelog-list">
          {CHANGELOG.map((item) => (
            <li key={item.date}>
              <time dateTime={item.date}>{item.date}</time>
              <p>{item.summary}</p>
            </li>
          ))}
        </ol>
      </article>
    </AccountLayout>
  );
}
