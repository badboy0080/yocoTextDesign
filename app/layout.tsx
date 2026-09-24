import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yooco · Best layout with AI",
  description: "好文章，值得好排版。",
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
