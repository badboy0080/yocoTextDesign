import { redirect } from "next/navigation";

// 订阅先不对外展示。方案页组件还留在 components/subscribe-page.tsx，开通时再接回来。不收款。
export default function SubscribeRoute() {
  redirect("/");
}
