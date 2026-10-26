import { RATIO_IDS, TEMPLATES, slotsFor, templateById } from "./layout-templates.js";

const state = {
  ratio: "3:4",
  templateId: "t1",
  gridN: 12,
  source: "",
  images: [], // { url, name }[]
  fill: null, // { slots: [...] } | null
  positions: {}, // id -> { x, y } 覆盖模板坐标
};

const copyInput = document.querySelector("#copyInput");
const generateButton = document.querySelector("#generateButton");
const rerollButton = document.querySelector("#rerollButton");
const ratioRow = document.querySelector("#ratioRow");
const templateGrid = document.querySelector("#templateGrid");
const canvas = document.querySelector("#canvas");
const canvasBlocks = document.querySelector("#canvasBlocks");
const emptyHint = document.querySelector("#emptyHint");
const layoutStatus = document.querySelector("#layoutStatus");
const gridN = document.querySelector("#gridN");
const gridNValue = document.querySelector("#gridNValue");

function syncGenerateEnabled() {
  const ok = copyInput.value.trim().length > 0;
  generateButton.disabled = !ok;
  rerollButton.disabled = !ok || !state.fill;
}

function renderChrome() {
  ratioRow.innerHTML = RATIO_IDS.map((id) =>
    `<button type="button" role="radio" aria-checked="${state.ratio === id}" data-ratio="${id}">${id}</button>`
  ).join("");
  templateGrid.innerHTML = TEMPLATES.map((item) =>
    `<button type="button" role="option" aria-selected="${state.templateId === item.id}" data-template="${item.id}">
      <strong>${item.label}</strong><span class="blurb">${item.blurb}</span>
    </button>`
  ).join("");
  canvas.dataset.ratio = state.ratio;
  layoutStatus.textContent = `当前 ${templateById(state.templateId).label} · ${state.ratio}`;
}

function placeStyle(box) {
  return `left:${box.x}%;top:${box.y}%;width:${box.w}%;height:${box.h}%;`;
}

function renderBlocks() {
  const slots = slotsFor(state.templateId, state.ratio);
  canvasBlocks.innerHTML = slots.map((slot) => {
    const pos = state.positions[slot.id];
    const box = { ...slot, x: pos?.x ?? slot.x, y: pos?.y ?? slot.y };
    const filled = state.fill?.slots?.find((item) => item.id === slot.id);
    const text = filled?.text || "";
    const isImage = slot.type === "image";
    const img = isImage && Number.isInteger(filled?.imageIndex)
      ? state.images[filled.imageIndex]
      : null;
    const empty = isImage ? !img : !text;
    const inner = isImage
      ? (img ? `<img alt="" src="${img.url}" />` : `<span>图槽</span>`)
      : (text || slot.type);
    return `<div class="block${empty ? " is-empty" : ""}" data-id="${slot.id}" data-type="${slot.type}" style="${placeStyle(box)}">${inner}</div>`;
  }).join("");
  emptyHint.hidden = true;
}

ratioRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-ratio]");
  if (!button) return;
  state.ratio = button.dataset.ratio;
  state.positions = {};
  renderChrome();
  renderBlocks();
});

templateGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button) return;
  state.templateId = button.dataset.template;
  state.positions = {};
  state.fill = null;
  syncGenerateEnabled();
  renderChrome();
  renderBlocks();
});

copyInput.addEventListener("input", syncGenerateEnabled);

gridN.addEventListener("input", () => {
  state.gridN = Number(gridN.value);
  gridNValue.textContent = gridN.value;
});

renderChrome();
renderBlocks();
syncGenerateEnabled();
layoutStatus.textContent = `当前 ${templateById(state.templateId).label} · ${state.ratio}`;
