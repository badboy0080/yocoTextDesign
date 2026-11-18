import { HomeLanding } from "./home-landing";
import { homeJsonLd, homeMetadata } from "@/lib/site-seo";

export const metadata = homeMetadata;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var wide=window.matchMedia("(min-width: 961px)").matches;if(!reduce&&wide){document.documentElement.classList.add("yooco-enter");window.setTimeout(function(){document.documentElement.classList.remove("yooco-enter");},1700);}}catch(e){}})();`,
        }}
      />
      <HomeLanding />
    </>
  );
}
