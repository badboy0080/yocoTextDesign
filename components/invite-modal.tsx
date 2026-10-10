"use client";

import { useEffect, useId, useRef, useState } from "react";
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
        setBody(data.sentence);
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
    try {
      await navigator.clipboard.writeText(code);
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
        <h2 id={titleId}>邀请好友</h2>
        <p>{body}</p>
        <div className="invite-modal-actions">
          <button className="invite-modal-copy" type="button" onClick={copyCode} disabled={!code}>
            复制邀请码
          </button>
          <button className="invite-modal-close" type="button" onClick={() => onCloseRef.current()}>
            关闭
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
