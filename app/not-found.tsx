import Link from "next/link";
import { AccountLayout } from "@/components/account-layout";

export default function NotFound() {
  return (
    <AccountLayout section="找不到页面" skin="obsidian">
      <article className="faq-page">
        <p className="auth-eyebrow">YOOCO / 404</p>
        <h1>这一页不在。</h1>
        <p className="account-missing">地址可能写错了，或页面已经挪走。</p>
        <p className="account-missing">
          <Link href="/">回首页</Link>
          {" · "}
          <Link href="/works">看精品模板</Link>
          {" · "}
          <Link href="/studio.html">去工作台</Link>
        </p>
      </article>
    </AccountLayout>
  );
}
