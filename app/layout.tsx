import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yooco · 把一篇好文章，排成读者愿意读完的样子",
  description: "粘贴文章，优化排版。",
  icons: {
    icon: "/favicon.svg?v=bubble-c-v1",
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
