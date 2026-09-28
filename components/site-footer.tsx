"use client";

import { useState } from "react";

import { SITE_CONFIG } from "@/lib/site-config";
import { BrandLogo } from "@/components/brand-logo";

/**
 * 全站页脚：品牌一行 + 公众号导流（hover/点击出二维码）。
 * 公众号名称与二维码在 lib/site-config.ts 配置。
 */
export function SiteFooter() {
  const { wechat } = SITE_CONFIG;
  const [open, setOpen] = useState(false);

  const guideText = wechat.accountName
    ? `关注公众号「${wechat.accountName}」，回复「${wechat.keyword}」领${wechat.offer}`
    : `关注公众号，回复「${wechat.keyword}」领${wechat.offer}`;

  return (
    <footer className="mx-auto mt-16 w-full max-w-3xl border-t border-border/70 px-1 py-8">
      <div className="flex flex-col items-start justify-between gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <p className="leading-relaxed">
          <BrandLogo compact />
          <span className="mx-2 text-border">·</span>
          好排版的参考起点，借鉴结构，不复制内容
        </p>

        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ddd3] bg-[#eaede8] px-3.5 py-1.5 font-medium text-[#414940] transition-colors hover:bg-[#dde3dc]"
          >
            领{wechat.offer}
            <span aria-hidden>▾</span>
          </button>

          {open && (
            <div className="absolute bottom-11 right-0 z-20 w-60 rounded-xl border border-border bg-card p-4 text-center shadow-lg">
              {/* 用普通 img：占位资源是 SVG，避免 next/image 的 SVG 安全配置 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wechat.qrPath}
                alt="微信扫一扫关注公众号"
                width={168}
                height={168}
                className="mx-auto rounded-lg"
              />
              <p className="mt-2.5 text-xs leading-relaxed text-foreground">{guideText}</p>
              {!wechat.qrReady && (
                <p className="mt-1 text-[11px] text-amber-600">二维码待替换，暂不可扫</p>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
