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
      <HomeLanding />
    </>
  );
}
