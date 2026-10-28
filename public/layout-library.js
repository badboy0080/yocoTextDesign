/** 图片素材。纯函数，给页面和检查脚本共用。不上传到服务器。 */

export const BUILTIN_ASSETS = [
  { id: "asset-01", name: "赤圆", url: "./layout-assets/01.svg" },
  { id: "asset-02", name: "蓝条", url: "./layout-assets/02.svg" },
  { id: "asset-03", name: "绿点", url: "./layout-assets/03.svg" },
  { id: "asset-04", name: "黄三角", url: "./layout-assets/04.svg" },
  { id: "asset-05", name: "紫菱", url: "./layout-assets/05.svg" },
  { id: "asset-06", name: "青柱", url: "./layout-assets/06.svg" },
  { id: "asset-07", name: "橙环", url: "./layout-assets/07.svg" },
  { id: "asset-08", name: "墨叉", url: "./layout-assets/08.svg" },
  { id: "asset-09", name: "粉线", url: "./layout-assets/09.svg" },
  { id: "asset-10", name: "蓝格", url: "./layout-assets/10.svg" },
  { id: "asset-11", name: "柠斜", url: "./layout-assets/11.svg" },
  { id: "asset-12", name: "褐块", url: "./layout-assets/12.svg" },
];

export const MINE_KEY = "yooco-layout-mine";
export const MAX_MINE = 20;
export const MAX_EDGE = 960;
export const MAX_DATA_URL = 480_000;
export const MAX_RAW_BYTES = 8_000_000;

export function rejectRawFile(byteLength) {
  if (!Number.isFinite(byteLength) || byteLength <= 0) return "这张图读不出来。";
  if (byteLength > MAX_RAW_BYTES) return "这张图太大，请换一张小的。";
  return "";
}

export function dataUrlTooBig(length) {
  return length > MAX_DATA_URL;
}

/** 选中的图槽优先。没选中就填第一个空槽，没有空槽就填第一个图槽。没有图槽返回空字符串。 */
export function pickTargetSlot(slots, selectedId, filledIds) {
  const list = (slots || []).filter((slot) => slot?.type === "image" && slot.id);
  if (!list.length) return "";
  if (selectedId && list.some((slot) => slot.id === selectedId)) return selectedId;
  const filled = filledIds instanceof Set ? filledIds : new Set(filledIds || []);
  const empty = list.find((slot) => !filled.has(slot.id));
  return (empty || list[0]).id;
}

export function countUses(imageId, usedIds) {
  if (!imageId) return 0;
  return (usedIds || []).filter((id) => id === imageId).length;
}

export function copySlotImages(map) {
  const out = {};
  if (!map || typeof map !== "object") return out;
  for (const [slotId, imageId] of Object.entries(map)) {
    if (typeof slotId === "string" && typeof imageId === "string" && slotId && imageId) out[slotId] = imageId;
  }
  return out;
}
