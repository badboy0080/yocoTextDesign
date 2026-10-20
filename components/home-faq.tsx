"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FaqAnswer } from "@/components/faq-answer";
import { SITE_FAQ } from "@/lib/site-faq";

export function HomeFaq() {
  const [openId, setOpenId] = useState<string>(SITE_FAQ[0]?.id ?? "");

  return (
    <section className="ol-faq" aria-labelledby="home-faq-title">
      <div className="ol-faq-head">
        <h2 id="home-faq-title">常见问题</h2>
        <Link className="ol-faq-more" href="/faq">更多问题</Link>
      </div>
      <div className="ol-faq-list">
        {SITE_FAQ.map((item) => {
          const open = item.id === openId;
          return (
            <div key={item.id} className={open ? "ol-faq-item is-open" : "ol-faq-item"}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`home-faq-${item.id}`}
                onClick={() => setOpenId(open ? "" : item.id)}
              >
                <span>{item.title}</span>
                <ChevronDown aria-hidden="true" size={16} />
              </button>
              <div className="ol-faq-panel" id={`home-faq-${item.id}`} role="region" aria-hidden={open ? undefined : true}>
                <div>
                  <p>
                    <FaqAnswer body={item.body} emphasis={"emphasis" in item ? item.emphasis : undefined} />
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
