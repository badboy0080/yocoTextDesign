import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAccounts } from "./admin-accounts";
import { currentAccount, isAdminAccount } from "@/lib/local-accounts";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "账号权限 · Yooco",
  description: "站长人工开通账号等级和每天积分。",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const account = await currentAccount();
  if (!account) redirect("/login?next=/admin");
  if (!isAdminAccount(account)) {
    return (
      <main className="admin-page">
        <div className="admin-wrap admin-denied">
          <p className="admin-kicker">YOOCO / ADMIN</p>
          <h1>进不了后台</h1>
          <p className="admin-lead">这个账号不是管理员。只有不限积分的账号，或写在管理员名单里的邮箱，才能改别人的等级和积分。</p>
          <p className="admin-lead">
            <a className="admin-back" href="/studio.html">
              回到工作台
            </a>
          </p>
        </div>
      </main>
    );
  }
  return <AdminAccounts actorEmail={account.email} />;
}
