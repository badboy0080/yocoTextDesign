import type { Metadata } from "next";
import { WorksFrame } from "@/components/works-frame";
import { WorksGallery } from "@/components/works-gallery";

export const metadata: Metadata = {
  title: "作品 · Yooco",
  description: "看排好的文章，做同款或下载排版配置。",
};

export default function WorksPage() {
  return (
    <WorksFrame>
      <WorksGallery />
    </WorksFrame>
  );
}
