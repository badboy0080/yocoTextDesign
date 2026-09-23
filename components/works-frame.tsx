import type { ReactNode } from "react";
import "@/app/works.css";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export function WorksFrame({ children }: { children: ReactNode }) {
  return (
    <div className="works-app">
      <aside className="works-side">
        <Link className="works-logo" href="/">
          <BrandLogo />
        </Link>
        <a className="works-studio" href="/studio">
          工作台
        </a>
      </aside>
      <div className="works-main">{children}</div>
    </div>
  );
}
