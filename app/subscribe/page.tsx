import type { Metadata } from "next";
import { SubscribePage } from "@/components/subscribe-page";

export const metadata: Metadata = {
  title: "订阅 · Yooco",
  description: "查看 Yooco 免费试用与专业版方案。专业版订阅尚未开放。",
};

export default function SubscribeRoute() {
  return <SubscribePage />;
}
