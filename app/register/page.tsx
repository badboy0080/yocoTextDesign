import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = {
  title: "注册 · Yooco",
  description: "用邮箱注册 Yooco。账号存在这台电脑上。",
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
