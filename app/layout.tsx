import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yooco · 把一篇好文章，排成读者愿意读完的样子",
  description: "Markdown 进 → 公众号预览 → 一键复制，还能继续改。试用免费限 10 次。",
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
