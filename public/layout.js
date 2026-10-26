import { RATIO_IDS, RATIOS, TEMPLATES, slotsFor, templateById } from "./layout-templates.js";
import { snapToGrid, clampBlock, gridRows, clampGridN } from "./layout-grid.js";

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
const layoutError = document.querySelector("#layoutError");
const gridNInput = document.querySelector("#gridN");
const gridNValue = document.querySelector("#gridNValue");
const canvasGrid = document.querySelector("#canvasGrid");

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
      ? (img ? `<img alt="" src="${escapeHtml(img.url)}" />` : `<span>图槽</span>`)
      : escapeHtml(text || slot.type);
    return `<div class="block${empty ? " is-empty" : ""}" data-id="${slot.id}" data-type="${slot.type}" style="${placeStyle(box)}">${inner}</div>`;
  }).join("");
  emptyHint.hidden = true;
}

let drag = null;

function slotBox(id) {
  const slot = slotsFor(state.templateId, state.ratio).find((item) => item.id === id);
  const pos = state.positions[id];
  return { ...slot, x: pos?.x ?? slot.x, y: pos?.y ?? slot.y };
}

canvasBlocks.addEventListener("pointerdown", (event) => {
  const block = event.target.closest(".block");
  if (!block || !state.fill) return; // 生成前骨架也可拖的话去掉 !state.fill；design：生成后可拖
  const id = block.dataset.id;
  const box = slotBox(id);
  const rect = canvas.getBoundingClientRect();
  drag = {
    id,
    pointerId: event.pointerId,
    offsetX: ((event.clientX - rect.left) / rect.width) * 100 - box.x,
    offsetY: ((event.clientY - rect.top) / rect.height) * 100 - box.y,
    w: box.w,
    h: box.h,
  };
  block.classList.add("is-dragging");
  block.setPointerCapture(event.pointerId);
});

canvasBlocks.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const rect = canvas.getBoundingClientRect();
  let x = ((event.clientX - rect.left) / rect.width) * 100 - drag.offsetX;
  let y = ((event.clientY - rect.top) / rect.height) * 100 - drag.offsetY;
  const n = clampGridN(state.gridN);
  const ratio = RATIOS[state.ratio];
  const m = gridRows(n, ratio.w, ratio.h);
  const snapped = snapToGrid(x, y, n, m);
  const clamped = clampBlock(snapped.x, snapped.y, drag.w, drag.h);
  state.positions[drag.id] = { x: clamped.x, y: clamped.y };
  const el = canvasBlocks.querySelector(`[data-id="${drag.id}"]`);
  if (el) {
    el.style.left = `${clamped.x}%`;
    el.style.top = `${clamped.y}%`;
  }
});

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const el = canvasBlocks.querySelector(`[data-id="${drag.id}"]`);
  el?.classList.remove("is-dragging");
  drag = null;
}
canvasBlocks.addEventListener("pointerup", endDrag);
canvasBlocks.addEventListener("pointercancel", endDrag);

ratioRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-ratio]");
  if (!button) return;
  state.ratio = button.dataset.ratio;
  state.positions = {};
  renderChrome();
  renderBlocks();
  renderGrid();
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

copyInput.addEventListener("input", () => {
  layoutError.hidden = true;
  syncGenerateEnabled();
});

let generating = false;

generateButton.addEventListener("click", async () => {
  if (generating || !copyInput.value.trim()) return;
  generating = true;
  layoutError.hidden = true;
  layoutError.textContent = "";
  generateButton.disabled = true;
  layoutStatus.textContent = "正在生成…";
  try {
    const slots = slotsFor(state.templateId, state.ratio).map((slot) => ({ id: slot.id, type: slot.type }));
    state.source = copyInput.value;
    const response = await fetch("/api/layout-fill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: state.source,
        imageCount: state.images.length,
        ratio: state.ratio,
        templateId: state.templateId,
        slots,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload.data) {
      const message = payload?.error?.message || "排版失败，再试一次";
      layoutError.textContent = message;
      layoutError.hidden = false;
      layoutStatus.textContent = message;
      return;
    }
    state.fill = payload.data;
    state.positions = {};
    renderBlocks();
    layoutStatus.textContent = `已生成 ${templateById(state.templateId).label} · ${state.ratio}`;
  } catch {
    layoutError.textContent = "排版失败，再试一次";
    layoutError.hidden = false;
    layoutStatus.textContent = "排版失败，再试一次";
  } finally {
    generating = false;
    syncGenerateEnabled();
  }
});

function renderGrid() {
  const n = clampGridN(state.gridN);
  const ratio = RATIOS[state.ratio];
  const m = gridRows(n, ratio.w, ratio.h);
  const lines = [];
  for (let i = 0; i <= n; i += 1) {
    lines.push(`<span class="grid-v" style="left:${(i / n) * 100}%"></span>`);
  }
  for (let j = 0; j <= m; j += 1) {
    lines.push(`<span class="grid-h" style="top:${(j / m) * 100}%"></span>`);
  }
  canvasGrid.innerHTML = lines.join("");
  gridNInput.value = String(n);
  gridNValue.textContent = String(n);
}

gridNInput.addEventListener("input", () => {
  state.gridN = clampGridN(gridNInput.value);
  // 调 N：只更新网格线；已放置块下次拖动再按新网格吸附（不瞬间重吸，避免跳动）
  renderGrid();
});

renderChrome();
renderBlocks();
renderGrid();
syncGenerateEnabled();
layoutStatus.textContent = `当前 ${templateById(state.templateId).label} · ${state.ratio}`;

// 生成接线之前，控制台可以先写 state.fill = { slots: [] } 再 renderBlocks()，用来手测拖块。
globalThis.state = state;
globalThis.renderBlocks = renderBlocks;
