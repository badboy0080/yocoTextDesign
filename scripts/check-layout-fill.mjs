import {
  defaultFill,
  normalizeFillResult,
  validateLayoutFillRequest,
} from "../lib/layout-fill.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const slots = [
  { id: "h1", type: "H1" },
  { id: "h2", type: "H2" },
  { id: "body1", type: "body" },
  { id: "img1", type: "image" },
];

const req = validateLayoutFillRequest({
  source: "标题一句\n\n副标\n\n正文段落一。\n正文段落二。",
  imageCount: 1,
  ratio: "3:4",
  templateId: "t1",
  slots,
});
assert(req.templateId === "t1", "请求应收下 t1");

const fallback = defaultFill(req);
assert(fallback.slots.find((s) => s.id === "h1").text.includes("标题"), "H1 默认首段");
assert(fallback.slots.find((s) => s.id === "img1").imageIndex === 0, "有图填 img");

const bad = normalizeFillResult(
  { templateId: "t1", ratio: "3:4", slots: [{ id: "nope", type: "H1", text: "x" }] },
  req,
);
assert(bad.slots.find((s) => s.id === "h1"), "非法槽应回退默认填法");

const good = normalizeFillResult(
  {
    templateId: "t1",
    ratio: "3:4",
    seed: 7,
    slots: [
      { id: "h1", type: "H1", text: "标题一句" },
      { id: "h2", type: "H2", text: "副标" },
      { id: "body1", type: "body", text: "正文段落一。" },
      { id: "img1", type: "image", imageIndex: 0 },
    ],
  },
  req,
);
assert(good.slots.find((s) => s.id === "img1").imageIndex === 0, "合法 imageIndex 保留");

let threw = false;
try {
  validateLayoutFillRequest({ source: "", imageCount: 0, ratio: "3:4", templateId: "t1", slots });
} catch {
  threw = true;
}
assert(threw, "空文案应拒绝");

console.log("check-layout-fill: ok");
