"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AccountMenu() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { email?: string };
        if (data?.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  if (!email) return <Link href="/login">登录</Link>;

  return (
    <>
      <span className="account-email" title={email}>{email}</span>
      <button className="account-logout" type="button" onClick={logout}>退出</button>
    </>
  );
}
