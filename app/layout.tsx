import type { Metadata } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/site-config";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/site-seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  robots: { index: true, follow: true },
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
