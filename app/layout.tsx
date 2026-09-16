import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yooco · 让用户第一眼爱上你的文字",
  description: "粘贴公众号原文，一键优化排版，复制进微信编辑器。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
