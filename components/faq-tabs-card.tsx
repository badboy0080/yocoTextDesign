"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqAnswer } from "@/components/faq-answer";
import { SITE_FAQ, faqCategories } from "@/lib/site-faq";

const TABS = faqCategories();

export function FaqTabsCard() {
  const [tab, setTab] = useState(TABS[0] ?? "");
  const [openId, setOpenId] = useState(SITE_FAQ.find((item) => item.category === TABS[0])?.id ?? "");

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    const item = SITE_FAQ.find((entry) => entry.id === id);
    if (!item) return;
    setTab(item.category);
    setOpenId(item.id);
  }, []);

  const items = SITE_FAQ.filter((item) => item.category === tab);

  return (
    <div className="faq-card">
      <div className="faq-tablist" role="tablist" aria-label="问题分类">
        {TABS.map((label) => {
          const selected = label === tab;
          return (
            <button
              key={label}
              type="button"
              role="tab"
              id={`faq-tab-${label}`}
              aria-selected={selected}
              aria-controls="faq-tab-panel"
              tabIndex={selected ? 0 : -1}
              className={selected ? "is-active" : undefined}
              onClick={() => {
                setTab(label);
                setOpenId(SITE_FAQ.find((item) => item.category === label)?.id ?? "");
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="faq-accordion" id="faq-tab-panel" role="tabpanel" aria-labelledby={`faq-tab-${tab}`}>
        {items.map((item) => {
          const open = item.id === openId;
          return (
            <div key={item.id} id={item.id} className={open ? "is-open" : undefined}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${item.id}-answer`}
                onClick={() => setOpenId(open ? "" : item.id)}
              >
                <span>{item.title}</span>
                <ChevronDown aria-hidden="true" size={16} />
              </button>
              <div className="faq-answer" id={`${item.id}-answer`} role="region" aria-hidden={open ? undefined : true}>
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
    </div>
  );
}
