import { HomeLanding } from "./home-landing";
import { homeMetadata } from "@/lib/site-seo";

export const metadata = homeMetadata;

export default function Home() {
  return <HomeLanding />;
}
