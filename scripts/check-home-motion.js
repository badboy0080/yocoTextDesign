import fs from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const landing = fs.readFileSync(new URL("../app/home-landing.tsx", import.meta.url), "utf8");
const book = fs.readFileSync(new URL("../app/home-book.css", import.meta.url), "utf8");
const showcase = fs.readFileSync(new URL("../components/home-showcase.tsx", import.meta.url), "utf8");
const flip = fs.readFileSync(new URL("../components/home-flip-book.tsx", import.meta.url), "utf8");
const specimens = fs.readFileSync(new URL("../lib/home-specimens.ts", import.meta.url), "utf8");
const pkg = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");

if (!pkg.includes('"check": "node scripts/check.js"')) fail("没有统一检查命令");
if (!landing.includes("useHomeParallax")) fail("首页没有接上滚动视差");
if (!landing.includes("data-parallax")) fail("首屏没有视差层");
if (!landing.includes("ol-depth-far") || !landing.includes("ol-depth-mid")) fail("背景没有分成两层");
if (!book.includes(".bk-shift")) fail("视差位移样式丢了");
if (!book.includes(".ol-depth-far") || !book.includes(".ol-depth-mid")) fail("背景两层的速度样式丢了");
const reduced = book.split("@media (prefers-reduced-motion: reduce)")[1] || "";
if (!reduced.includes(".bk-shift") || !reduced.includes(".ol-depth-far")) fail("减少动效时视差还在飘");
if (showcase.includes("data-place")) fail("书架还在用整本换位");
if (book.includes('data-place="far-left"')) fail("书架样式还是整本滑走");
if (!book.includes("rotateY(calc(var(--turn, 0) * -180deg))")) fail("往后翻没有绕书脊转这一页");
if (!book.includes("var(--bend")) fail("翻页没有外缘卷曲");
if (!flip.includes('--bend')) fail("翻页脚本没有把卷曲写进去");
if (!showcase.includes("HomeFlipBook")) fail("书架没有用单页翻页");
for (const kept of ["zhou-fang-court-ladies", "hokusai-great-wave", "wang-ximeng-thousand-li", "van-gogh-almond-blossom", "bruegel-hunters-in-the-snow", "guo-xi-early-spring"]) {
  if (!specimens.includes(kept)) fail(`首页画作丢了：${kept}`);
}
if (landing.includes("?raw") || showcase.includes("?raw") || flip.includes("?raw")) fail("首页动效又用了 ?raw");

console.log("home motion checks passed");
