"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InviteModal } from "@/components/invite-modal";

export function AccountMenu() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { email?: string };
        if (data?.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(".account-menu")) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  if (!email) return <Link href="/login">登录</Link>;

  return (
    <>
      <div className="account-menu">
        <button type="button" className="account-email" aria-haspopup="menu" aria-expanded={open} aria-label="账号菜单" title={email} onClick={() => setOpen((value) => !value)}>
          {email}
        </button>
        {open ? (
          <div className="account-menu-popover" role="menu">
            <button type="button" role="menuitem" onClick={() => { setOpen(false); setInviteOpen(true); }}>邀请好友</button>
            <button type="button" role="menuitem" onClick={logout}>退出</button>
          </div>
        ) : null}
      </div>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
