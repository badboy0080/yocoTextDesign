import fs from "node:fs";
import vm from "node:vm";

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL("../public/block-style.js", import.meta.url), "utf8"), sandbox);
const api = sandbox.YoocoBlockStyle;
if (!api) {
  console.error("block style helper missing");
  process.exit(1);
}

const css = api.blockStyleCss({
  fontSize: 99,
  padding: 12,
  background: "#F4E7D4",
  radius: 8,
  borderWidth: 2,
}, "#111111");
if (css !== "font-size:48px;padding:12px;background-color:#F4E7D4;border-radius:8px;border:2px solid #111111;") {
  console.error("css mismatch", css);
  process.exit(1);
}

if (api.blockStyleCss({ background: "red;background:url(x)" }, "#111111") !== "") {
  console.error("unsafe color was kept");
  process.exit(1);
}

if (api.blockStyleCss({ borderWidth: 0, padding: 0 }, "#111111") !== "padding:0px;border:0;") {
  console.error("zero spacing/border mismatch", api.blockStyleCss({ borderWidth: 0, padding: 0 }, "#111111"));
  process.exit(1);
}

const painted = api.paintBlockStyleHtml(
  '<p style="font-size:16px;color:#333;">正文还在</p>',
  "font-size:22px;background-color:#E5F2C9;",
);
if (painted !== '<p style="font-size:16px;color:#333;font-size:22px;background-color:#E5F2C9;">正文还在</p>') {
  console.error("paint mismatch", painted);
  process.exit(1);
}

const bare = api.paintBlockStyleHtml("<h3>小标题</h3>", "font-size:32px;");
if (bare !== '<h3 style="font-size:32px;">小标题</h3>') {
  console.error("bare paint mismatch", bare);
  process.exit(1);
}

if (api.paintBlockStyleHtml("<p>原文</p>", "") !== "<p>原文</p>") {
  console.error("empty extra changed html");
  process.exit(1);
}

if (api.BLOCK_STYLE_KINDS.heading !== "标题" || api.BLOCK_STYLE_KINDS.card !== "重点" || api.BLOCK_STYLE_KINDS.paragraph !== "段落") {
  console.error("kind labels changed");
  process.exit(1);
}

const colored = api.blockStyleCss({ fontSize: 18, color: "#1040C0" }, "#111111");
if (colored !== "font-size:18px;color:#1040C0;") {
  console.error("font color mismatch", colored);
  process.exit(1);
}

if (api.blockStyleCss({ color: "red" }, "#111111") !== "") {
  console.error("unsafe font color was kept");
  process.exit(1);
}

if (api.blockStyleDeclarations({ color: "#abc" }, "#111111").color !== "#abc") {
  console.error("short hex color dropped");
  process.exit(1);
}

console.log("block style checks ok");
