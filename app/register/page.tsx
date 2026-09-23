import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  title: "注册 · Yooco",
  description: "Yooco 账号页面预览。当前可免登录试用工作台。",
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
