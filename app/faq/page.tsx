import type { Metadata } from "next";
import { AccountLayout } from "@/components/account-layout";
import { SITE_FAQ } from "@/lib/site-faq";

export const metadata: Metadata = {
  title: "常见问题 · Yooco",
  description: "试用次数、邮箱验证码和邀请好友。",
};

function FaqBody({ body, emphasis }: { body: string; emphasis?: string }) {
  if (!emphasis || !body.includes(emphasis)) return body;
  const [before, after] = body.split(emphasis);
  return (
    <>
      {before}
      <strong>{emphasis}</strong>
      {after}
    </>
  );
}

export default function FaqPage() {
  return (
    <AccountLayout section="常见问题">
      <article className="faq-page">
        <p className="auth-eyebrow">YOOCO / HELP</p>
        <h1>常见问题</h1>
        <dl className="faq-list">
          {SITE_FAQ.map((item) => (
            <div key={item.id} id={item.id}>
              <dt>{item.title}</dt>
              <dd>
                <FaqBody body={item.body} emphasis={"emphasis" in item ? item.emphasis : undefined} />
              </dd>
            </div>
          ))}
        </dl>
      </article>
    </AccountLayout>
  );
}
