import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  title: "登录 · Yooco",
  description: "用邮箱登录 Yooco。账号存在这台电脑上。",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
