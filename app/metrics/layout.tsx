import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yooco · 漏斗统计",
  robots: { index: false, follow: false },
};

export default function MetricsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
