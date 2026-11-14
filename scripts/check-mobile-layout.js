import fs from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const css = fs.readFileSync(new URL("../public/studio-ui.css", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");

const mobileStart = css.indexOf("@media (max-width: 823px) {\n  .studio-layout {\n    height:auto;");
if (mobileStart < 0) fail("narrow studio layout does not release the fixed viewport");
const mobileEnd = css.indexOf("}", css.indexOf(".tool-menu, .block-type-menu", mobileStart));
const mobile = css.slice(mobileStart, mobileEnd);
if (!mobile.includes("overflow:visible")) fail("narrow studio layout still clips overflow");
if (mobile.includes("overflow-x:hidden") || mobile.includes("overflow-x: hidden")) {
  fail("narrow layout hides overflow instead of fixing it");
}
if (!/height:\s*auto/.test(mobile)) fail("narrow studio layout height is still locked");
if (!mobile.includes("safe-area-inset-bottom")) fail("narrow layout ignores the bottom safe area");
if (!css.includes(".compliance-panel.compliance-panel--page { width:auto; max-width:100%; }")) {
  fail("page notice still uses a full width plus side margin");
}

const base = css.slice(0, css.indexOf("@media"));
if (!base.includes("overflow:hidden")) fail("desktop studio shell lost its clipped frame");

if (!html.includes("viewport-fit=cover")) fail("studio viewport does not cover the safe area");
if (!html.includes('studio-ui.css?v=mobile-fit-v1')) fail("studio style cache was not bumped");
if (!html.includes('app.js?v=mobile-fit-v1')) fail("studio script cache was not bumped");

if (!app.includes("function fitMobileStudio()")) fail("mobile fit helper missing");
if (!app.includes('matchMedia("(max-width: 823px)")')) fail("mobile fit is not limited to the phone breakpoint");
const fitStart = app.indexOf("function fitMobileStudio()");
const fitEnd = app.indexOf("setupStudioTools();", fitStart);
const fitFn = app.slice(fitStart, fitEnd);
if (fitFn.includes("buildCopyHtml") || fitFn.includes("font-size")) fail("mobile fit reached into copy styles");

const placeStart = app.indexOf("function placeBlockStylePanel()");
const placeEnd = app.indexOf("function syncBlockStylePanel(");
const placeFn = app.slice(placeStart, placeEnd);
if (!placeFn.includes("if (top < margin) top = margin")) fail("style panel can still sit off the screen");
if (!placeFn.includes("window.innerWidth - width - margin")) fail("style panel can still leave the side of the screen");

const copyStart = app.indexOf("function buildCopyHtml()");
const copyEnd = app.indexOf("function darkCopyHint()");
const copyFn = app.slice(copyStart, copyEnd);
if (!copyFn.includes("padding:40px 4px")) fail("copy frame padding changed");
if (!copyFn.includes("font-size:92px")) fail("texture copy size changed");
if (copyFn.includes("matchMedia") || copyFn.includes("innerWidth") || copyFn.includes("fitMobileStudio")) {
  fail("copy html now depends on the screen width");
}

console.log("mobile layout checks passed");
