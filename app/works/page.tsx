import { Suspense } from "react";
import type { Metadata } from "next";
import { WorksFrame } from "@/components/works-frame";
import { worksMetadata } from "@/lib/site-seo";

export const metadata: Metadata = worksMetadata;

export default function WorksPage() {
  return (
    <Suspense fallback={null}>
      <WorksFrame />
    </Suspense>
  );
}
