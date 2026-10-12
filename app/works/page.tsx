import { Suspense } from "react";
import type { Metadata } from "next";
import { WorksFrame } from "@/components/works-frame";

export const metadata: Metadata = {
  title: "精品模板 · Yooco",
  description: "看精品模板，或在同一页打开工作台。",
};

export default function WorksPage() {
  return (
    <Suspense fallback={null}>
      <WorksFrame />
    </Suspense>
  );
}
