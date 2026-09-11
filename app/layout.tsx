import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yooco · 公众号排版实验室",
  description: "将普通文本、Markdown 或网页富文本整理成可配置的公众号文章排版。",
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
