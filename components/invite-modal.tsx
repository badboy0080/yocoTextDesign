"use client";

import { useEffect, useId, useRef, useState } from "react";
import { inviteShareText } from "@/lib/invite-copy";
import "@/components/invite-modal.css";

type InvitePayload = {
  ok?: boolean;
  code?: string;
  sentence?: string;
  message?: string;
};

function trackInviteShare() {
  let deviceId = "";
  try {
    const stored = localStorage.getItem("yooco-device-id") || "";
    if (/^[A-Za-z0-9._:-]{8,80}$/.test(stored)) deviceId = stored;
  } catch {
    /* 没有设备号也记一次打开 */
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event: "invite_share", deviceId }),
    keepalive: true,
  }).catch(() => {});
}

function GoldGiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect className="invite-gift-box" x="4.1" y="11" width="15.8" height="8.5" rx="1.4" />
      <rect className="invite-gift-lid" x="3.2" y="8.15" width="17.6" height="3.05" rx="0.85" />
      <rect className="invite-gift-ribbon" x="10.85" y="8.15" width="2.3" height="11.35" />
      <path className="invite-gift-ribbon" d="M12 8.2c-1.35-2.15-3.55-2.85-4.55-1.75-.85.95-.35 2.25 1.05 2.55 1.15.25 2.45-.15 3.5-.8z" />
      <path className="invite-gift-ribbon" d="M12 8.2c1.35-2.15 3.55-2.85 4.55-1.75.85.95.35 2.25-1.05 2.55-1.15.25-2.45-.15-3.5-.8z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6.4 9.6 9.6 6.4M7.2 4.7a2.4 2.4 0 0 1 3.4 3.4l-1.2 1.2a2.4 2.4 0 0 1-3.4-3.4l.6-.6M8.8 11.3a2.4 2.4 0 0 1-3.4-3.4l1.2-1.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [code, setCode] = useState("");
  const [body, setBody] = useState("正在取出邀请码…");
  const [status, setStatus] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/invite", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as InvitePayload;
        return { response, data };
      })
      .then(({ response, data }) => {
        if (cancelled) return;
        if (!response.ok || !data.code || !data.sentence) {
          setBody(data.message || "暂时取不出邀请码，请稍后再试。");
          return;
        }
        setCode(data.code);
        setBody("");
        trackInviteShare();
      })
      .catch(() => {
        if (!cancelled) setBody("暂时取不出邀请码，请稍后再试。");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    cardRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function copyCode() {
    if (!code) return;
    const text = inviteShareText(code);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("已复制。");
    } catch {
      setStatus("复制没成功，请手动选中邀请码。");
    }
    trackInviteShare();
  }

  return (
    <div className="invite-modal" onClick={() => onCloseRef.current()}>
      <div
        className="invite-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={cardRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="invite-modal-x" aria-label="关闭" onClick={() => onCloseRef.current()}>×</button>
        <div className="invite-modal-head">
          <GoldGiftIcon />
          <h2 id={titleId}>邀请赢积分</h2>
        </div>
        <div className="invite-reward-row">
          <article className="invite-reward">
            <p className="invite-reward-kicker">邀请注册</p>
            <p className="invite-reward-num">+5</p>
            <p className="invite-reward-who">你得 5 积分</p>
            <p className="invite-reward-note">好友用你的邀请码注册成功后到账。</p>
          </article>
          <span className="invite-reward-plus" aria-hidden="true">+</span>
          <article className="invite-reward">
            <p className="invite-reward-kicker">好友也得</p>
            <p className="invite-reward-num">+5</p>
            <p className="invite-reward-who">好友得 5 积分</p>
            <p className="invite-reward-note">一码最多 5 位朋友。同一账号只能领一次。</p>
          </article>
        </div>
        <p className="invite-rule">双方各 +5 积分。</p>
        <p className="invite-modal-body" role="status">{body}</p>
        <div className="invite-share">
          <div className="invite-share-link">
            <LinkIcon />
            <span>https://www.yoooco.com/</span>
            <strong>{code || "邀请码"}</strong>
          </div>
          <button className="invite-modal-copy" type="button" onClick={copyCode} disabled={!code}>
            复制邀请码
          </button>
        </div>
        <p className="invite-modal-status" role="status">{status}</p>
      </div>
    </div>
  );
}

export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <InviteDialog onClose={onClose} />;
}
