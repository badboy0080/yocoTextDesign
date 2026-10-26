/** 智能排版 P0 模板槽：百分比坐标，随画布缩放。勿与 layout-studio COMPOSITIONS 混用。 */

export const RATIOS = {
  "3:4": { w: 3, h: 4, label: "3:4" },
  "1:1": { w: 1, h: 1, label: "1:1" },
  "16:9": { w: 16, h: 9, label: "16:9" },
};

export const RATIO_IDS = Object.keys(RATIOS);
export const TEMPLATE_IDS = ["t1", "t2", "t3"];

function slot(id, type, x, y, w, h) {
  return { id, type, x, y, w, h };
}

export const TEMPLATES = [
  {
    id: "t1",
    label: "上题下文",
    blurb: "大标题靠上，正文中部，图在下",
    slotsByRatio: {
      "3:4": [
        slot("h1", "H1", 8, 6, 84, 12),
        slot("h2", "H2", 8, 20, 50, 6),
        slot("body1", "body", 8, 30, 84, 28),
        slot("img1", "image", 8, 62, 84, 28),
      ],
      "1:1": [
        slot("h1", "H1", 8, 6, 84, 12),
        slot("h2", "H2", 8, 20, 40, 6),
        slot("body1", "body", 8, 30, 50, 40),
        slot("img1", "image", 62, 30, 30, 40),
      ],
      "16:9": [
        slot("h1", "H1", 4, 8, 40, 20),
        slot("h2", "H2", 4, 32, 36, 10),
        slot("body1", "body", 4, 48, 40, 40),
        slot("img1", "image", 50, 10, 46, 80),
      ],
    },
  },
  {
    id: "t2",
    label: "左文右图",
    blurb: "文字左栏，右侧两图槽",
    slotsByRatio: {
      "3:4": [
        slot("h1", "H1", 6, 6, 52, 10),
        slot("h2", "H2", 6, 18, 52, 6),
        slot("body1", "body", 6, 28, 52, 40),
        slot("img1", "image", 62, 6, 32, 30),
        slot("img2", "image", 62, 40, 32, 30),
      ],
      "1:1": [
        slot("h1", "H1", 6, 6, 48, 12),
        slot("h2", "H2", 6, 20, 48, 6),
        slot("body1", "body", 6, 30, 48, 50),
        slot("img1", "image", 58, 6, 36, 40),
        slot("img2", "image", 58, 52, 36, 36),
      ],
      "16:9": [
        slot("h1", "H1", 3, 8, 42, 16),
        slot("h2", "H2", 3, 28, 42, 10),
        slot("body1", "body", 3, 44, 42, 44),
        slot("img1", "image", 50, 8, 22, 84),
        slot("img2", "image", 75, 8, 22, 84),
      ],
    },
  },
  {
    id: "t3",
    label: "图文交错",
    blurb: "顶图 + 标题 + 双文/图",
    slotsByRatio: {
      "3:4": [
        slot("img1", "image", 8, 5, 84, 22),
        slot("h1", "H1", 8, 30, 84, 10),
        slot("h2", "H2", 8, 42, 60, 6),
        slot("body1", "body", 8, 52, 50, 36),
        slot("img2", "image", 62, 52, 30, 36),
      ],
      "1:1": [
        slot("img1", "image", 8, 5, 84, 24),
        slot("h1", "H1", 8, 32, 84, 10),
        slot("h2", "H2", 8, 44, 50, 6),
        slot("body1", "body", 8, 54, 50, 34),
        slot("img2", "image", 62, 54, 30, 34),
      ],
      "16:9": [
        slot("img1", "image", 3, 8, 30, 84),
        slot("h1", "H1", 38, 10, 58, 16),
        slot("h2", "H2", 38, 30, 40, 10),
        slot("body1", "body", 38, 46, 34, 42),
        slot("img2", "image", 76, 46, 20, 42),
      ],
    },
  },
];

export function templateById(id) {
  return TEMPLATES.find((item) => item.id === id) || TEMPLATES[0];
}

export function slotsFor(templateId, ratio) {
  const template = templateById(templateId);
  const list = template.slotsByRatio[ratio] || template.slotsByRatio["3:4"];
  return list.map((item) => ({ ...item }));
}
