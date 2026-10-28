import { readFileSync } from "node:fs";
import {
  FAMILIES,
  RATIO_IDS,
  TEMPLATE_IDS,
  TEMPLATES,
  closestImageTemplate,
  imageIndexFor,
  slotsFor,
} from "../public/layout-templates.js";
import { validateLayoutFillRequest } from "../lib/layout-fill.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const REQUIRED = ["3:4", "9:16", "1:1", "16:9", "4:3", "2:1"];
assert(REQUIRED.every((id) => RATIO_IDS.includes(id)), "六种比例都要在");

const familyIds = FAMILIES.map((item) => item.id);
for (const id of ["swiss", "photo", "type", "magazine", "zh"]) {
  assert(familyIds.includes(id), `缺族 ${id}`);
}

for (const id of ["photo", "type", "magazine", "zh"]) {
  const list = TEMPLATES.filter((item) => item.family === id);
  assert(list.length >= 2, `${id} 至少两套`);
}

for (const id of ["a", "b", "c", "d", "e"]) {
  const item = TEMPLATES.find((template) => template.id === id);
  assert(item?.family === "swiss", `${id} 仍属瑞士`);
}

assert(TEMPLATE_IDS.length === TEMPLATES.length, "模板 id 与清单一致");
assert(new Set(TEMPLATE_IDS).size === TEMPLATE_IDS.length, "模板 id 不重复");

for (const template of TEMPLATES) {
  assert(familyIds.includes(template.family), `${template.id} 族不合法`);
  for (const ratio of REQUIRED) {
    const slots = template.slotsByRatio[ratio];
    assert(Array.isArray(slots) && slots.length > 0, `${template.id} ${ratio} 没有格子`);
    const ids = new Set();
    for (const slot of slots) {
      assert(!ids.has(slot.id), `${template.id} ${ratio} 槽 id 重复 ${slot.id}`);
      ids.add(slot.id);
      assert(slot.w > 0 && slot.h > 0, `${template.id} ${ratio} ${slot.id} 宽高为空`);
      assert(slot.x >= -0.01 && slot.y >= -0.01, `${template.id} ${ratio} ${slot.id} 跑出左上`);
      assert(slot.x + slot.w <= 100.01 && slot.y + slot.h <= 100.01, `${template.id} ${ratio} ${slot.id} 跑出右下`);
    }
  }
  validateLayoutFillRequest({
    source: "标题一句",
    imageCount: 0,
    ratio: "3:4",
    templateId: template.id,
    slots: [{ id: "title", type: "H1" }],
  });
}

function imageSlots(id, ratio) {
  return slotsFor(id, ratio).filter((slot) => slot.type === "image");
}

for (const id of ["p1", "p2"]) {
  for (const ratio of REQUIRED) {
    const images = imageSlots(id, ratio);
    assert(images.length >= 2 && images.length <= 4, `${id} ${ratio} 图槽应是 2 到 4`);
    const indexes = images.map((slot) => slot.imageIndex);
    assert(new Set(indexes).size === indexes.length, `${id} ${ratio} 图序号重复`);
    const shown = images.map((slot) => imageIndexFor(slot, 0, images.length));
    assert(shown.every((index) => index >= 0), `${id} 图够时不该空`);
    assert(new Set(shown).size === shown.length, `${id} 图够时仍共用`);
    const short = images.map((slot) => imageIndexFor(slot, 0, 1));
    assert(short.filter((index) => index >= 0).length === 1, `${id} 只有一张图时不能多槽共用`);
  }
}

for (const id of ["y1", "y2"]) {
  for (const ratio of REQUIRED) {
    const slots = slotsFor(id, ratio);
    assert(slots.filter((slot) => slot.type === "image").length === 1, `${id} ${ratio} 应只有一张图`);
    assert(slots.some((slot) => slot.id === "title"), `${id} 缺标题`);
    assert(slots.some((slot) => slot.id === "body"), `${id} 缺正文`);
  }
}

for (const id of ["m1", "m2"]) {
  for (const ratio of REQUIRED) {
    const slots = slotsFor(id, ratio);
    assert(slots.filter((slot) => slot.type === "image").length === 1, `${id} ${ratio} 应只有一张图`);
    assert(slots.some((slot) => slot.id === "title"), `${id} 缺标题`);
    assert(slots.some((slot) => slot.id === "subtitle"), `${id} 缺副题`);
    const items = slots.filter((slot) => ["date", "venue", "body", "credit"].includes(slot.id));
    assert(items.length >= 2, `${id} ${ratio} 条目不够`);
  }
}

for (const id of ["z1", "z2"]) {
  for (const ratio of REQUIRED) {
    const slots = slotsFor(id, ratio);
    assert(slots.every((slot) => slot.type !== "image"), `${id} 中文排这条不加图槽`);
    assert(slots.some((slot) => slot.id === "title"), `${id} 缺大标题`);
    assert(slots.some((slot) => slot.id === "date"), `${id} 缺日期`);
    assert(slots.some((slot) => slot.id === "credit"), `${id} 缺署名`);
  }
}

for (const ratio of REQUIRED) {
  const picked = closestImageTemplate(800, 1200, ratio);
  assert(["c", "d", "e"].includes(picked), `上传纯字仍应落到瑞士图文，得到 ${picked}`);
}

const css = readFileSync(new URL("../public/layout.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../public/layout.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../public/layout.js", import.meta.url), "utf8");
assert(!/writing-mode/.test(css + page + app), "排版页不要竖排");
assert(page.includes('id="familyRow"'), "页面要有族筛选");
assert(app.includes("templatesInFamily(state.familyId)"), "抽版式要按当前族");

console.log("check-layout-families: ok");
