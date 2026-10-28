import { readFileSync, existsSync } from "node:fs";
import {
  BUILTIN_ASSETS,
  MAX_MINE,
  countUses,
  dataUrlTooBig,
  pickTargetSlot,
  rejectRawFile,
} from "../public/layout-library.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(BUILTIN_ASSETS.length >= 8 && BUILTIN_ASSETS.length <= 12, "内置素材要 8 到 12 张");
assert(new Set(BUILTIN_ASSETS.map((item) => item.id)).size === BUILTIN_ASSETS.length, "素材 id 重复");
for (const item of BUILTIN_ASSETS) {
  const file = new URL(`../public/${item.url.replace("./", "")}`, import.meta.url);
  assert(existsSync(file), `缺素材文件 ${item.url}`);
}

const slots = [
  { id: "image", type: "image" },
  { id: "image2", type: "image" },
  { id: "image3", type: "image" },
];
assert(pickTargetSlot(slots, "image2", new Set()) === "image2", "选中哪格就换哪格");
assert(pickTargetSlot(slots, "", new Set(["image"])) === "image2", "没选中就填第一个空槽");
assert(pickTargetSlot(slots, "", new Set(["image", "image2", "image3"])) === "image", "没有空槽就填第一格");
assert(pickTargetSlot([{ id: "title", type: "H1" }], "title", new Set()) === "", "纯字版式没有图槽");
assert(pickTargetSlot(slots, "title", new Set()) === "image", "选中的不是图槽时不当成目标");

assert(countUses("mine-a", ["mine-a", "asset-01", "mine-a"]) === 2, "同一张用两次要算 2");
assert(countUses("mine-a", []) === 0, "没用过是 0");
assert(rejectRawFile(9_000_000).includes("太大"), "超过 8MB 要拒");
assert(rejectRawFile(1000) === "", "小图不拒");
assert(dataUrlTooBig(500_000), "压完仍大要继续压");
assert(!dataUrlTooBig(1000), "小数据不用再压");
assert(MAX_MINE >= 1, "我的图片要能存");

const html = readFileSync(new URL("../public/layout.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../public/layout.js", import.meta.url), "utf8");
assert(html.includes('id="assetGrid"'), "页面要有素材区");
assert(html.includes("我的图片"), "页面要有我的图片");
assert(html.includes('id="mineGrid"'), "我的图片要有格子");
assert(app.includes("placeLibraryImage"), "点素材要能放进图槽");
assert(app.includes("当前版式没有图槽"), "纯字版式要点了有提示");
const place = app.slice(app.indexOf("function placeLibraryImage"), app.indexOf("let editingId"));
assert(!place.includes("state.locks"), "手动换图不看锁");

console.log("check-layout-library: ok");
