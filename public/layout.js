import {
  ALIGN_GROUPS,
  COMPOSITIONS,
  FONT_STACK,
  MARGIN_PRESETS,
  ORGANIC_SHAPES,
  POSTER_BG,
  PRESETS,
  ROLES,
  SAFE_MARGIN_FLOOR,
  applyTypeScale,
  compositionById,
  parseCopyLocally,
  placeSlot,
  planContrast,
  relativeLuminanceFromRgb,
  roleById,
  safeMarginPx,
  selectPoolForComposition,
  snapLineBox,
  typeScaleIssues,
  auditSafeBounds,
} from "./layout-templates.js";

const SAMPLE = "少说一句\n\n把想说的话，放在画面中间。\n\n文 / Yooco";
const LONG_SAMPLE = [
  "周末去哪儿",
  "",
  "城西那家书店夜里十点还亮着灯，门口的猫不让人摸。",
  "咖啡只卖美式，桌子靠窗。",
  "周末人很多，工作日很安静。",
  "带一本书就能坐一下午。",
  "",
  "文 / Yooco",
].join("\n");

const state = {
  preset: "portrait",
  width: PRESETS.portrait.width,
  height: PRESETS.portrait.height,
  composition: "center",
  marginPreset: "standard",
  showGuide: true,
  showGrid: false,
  overlay: 0,
  contrastLocked: false,
  contrastAuto: false,
  exportScale: 2,
  format: "png",
  image: null,
  imageUrl: "",
  pool: [],
  roles: {},
};

const openingScale = applyTypeScale(PRESETS.portrait.width, PRESETS.portrait.height);
for (const role of ROLES) {
  state.roles[role.id] = {
    fontSize: openingScale.fontSize[role.id],
    lineHeight: openingScale.lineHeight[role.id],
    letterSpacing: openingScale.letterSpacing[role.id],
    color: role.color,
    align: alignForRole("center", role.id),
  };
}

const copyInput = document.querySelector("#copyInput");
const analyzeButton = document.querySelector("#analyzeButton");
const sampleButton = document.querySelector("#sampleButton");
const longSampleButton = document.querySelector("#longSampleButton");
const statusEl = document.querySelector("#layoutStatus");
const lengthNote = document.querySelector("#lengthNote");
const bgFile = document.querySelector("#bgFile");
const clearBg = document.querySelector("#clearBg");
const bgName = document.querySelector("#bgName");
const presetRow = document.querySelector("#presetRow");
const compositionGrid = document.querySelector("#compositionGrid");
const roleFields = document.querySelector("#roleFields");
const marginRow = document.querySelector("#marginRow");
const safeMarginValue = document.querySelector("#safeMarginValue");
const showGuide = document.querySelector("#showGuide");
const showGrid = document.querySelector("#showGrid");
const applyScaleButton = document.querySelector("#applyScale");
const scaleHint = document.querySelector("#scaleHint");
const groupAlign = document.querySelector("#groupAlign");
const poolList = document.querySelector("#poolList");
const overlay = document.querySelector("#overlay");
const overlayValue = document.querySelector("#overlayValue");
const scaleRow = document.querySelector("#scaleRow");
const exportFormat = document.querySelector("#exportFormat");
const exportButton = document.querySelector("#exportButton");
const layoutFit = document.querySelector("#layoutFit");
const poster = document.querySelector("#poster");
const posterShapes = document.querySelector("#posterShapes");
const posterPhoto = document.querySelector("#posterPhoto");
const posterOverlay = document.querySelector("#posterOverlay");
const posterGrid = document.querySelector("#posterGrid");
const posterThirds = document.querySelector("#posterThirds");
const posterGuide = document.querySelector("#posterGuide");
const emptyHint = document.querySelector("#emptyHint");
const stageWrap = document.querySelector(".layout-stage-wrap");

const zoneEls = new Map();

function setStatus(message) {
  statusEl.textContent = message || "";
}

function paintRangeFill(control) {
  const min = Number(control.min);
  const max = Number(control.max);
  const value = Number(control.value);
  const span = max - min;
  const pct = span ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0;
  control.style.setProperty("--range-pct", `${pct}%`);
}

function setIfIdle(el, value) {
  if (!el || document.activeElement === el) return;
  const next = String(value);
  if (el.value !== next) el.value = next;
}

function alignForRole(compositionId, roleId) {
  const slot = compositionById(compositionId).slots.find((item) => item.role === roleId);
  return slot?.align || "left";
}

function currentMarginPx() {
  return safeMarginPx(state.width, state.height, state.marginPreset);
}

function marginCopy() {
  const preset = MARGIN_PRESETS.find((item) => item.id === state.marginPreset) || MARGIN_PRESETS[1];
  const px = currentMarginPx();
  const raw = Math.round(Math.min(state.width, state.height) * (preset.percent / 100));
  const floor = px > raw ? `，低于 ${SAFE_MARGIN_FLOOR}px 时抬到 ${SAFE_MARGIN_FLOOR}px` : "";
  return `${preset.label} · ${px}px（短边约 ${preset.percent}%${floor}）`;
}

function hasText() {
  return state.pool.some((item) => item.onCanvas && String(item.text || "").trim());
}

function itemForSlot(slotId) {
  return state.pool.find((item) => item.onCanvas && item.slotId === slotId) || null;
}

function applyScaleToRoles() {
  const scale = applyTypeScale(state.width, state.height);
  for (const role of ROLES) {
    state.roles[role.id].fontSize = scale.fontSize[role.id];
    state.roles[role.id].lineHeight = scale.lineHeight[role.id];
    state.roles[role.id].letterSpacing = scale.letterSpacing[role.id];
  }
}

function resetAlignFromComposition() {
  for (const role of ROLES) state.roles[role.id].align = alignForRole(state.composition, role.id);
}

function normalizePool(items) {
  return (items || []).map((item, index) => ({
    id: item.id || `p${index + 1}`,
    role: item.role,
    text: String(item.text || ""),
    onCanvas: Boolean(item.onCanvas),
    slotId: item.slotId || "",
  }));
}

function buildPresets() {
  for (const preset of Object.values(PRESETS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.preset = preset.id;
    button.textContent = preset.label;
    button.addEventListener("click", () => applyPreset(preset.id));
    presetRow.append(button);
  }
}

function buildMargins() {
  for (const preset of MARGIN_PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.margin = preset.id;
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      state.marginPreset = preset.id;
      render();
    });
    marginRow.append(button);
  }
}

function buildCompositions() {
  for (const item of COMPOSITIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.composition = item.id;
    button.setAttribute("role", "option");
    button.innerHTML = `${item.label}<small>${item.blurb}</small>`;
    button.addEventListener("click", () => applyComposition(item.id));
    compositionGrid.append(button);
  }
}

function buildRoles() {
  for (const role of ROLES) {
    const card = document.createElement("section");
    card.className = "role-card";
    card.dataset.role = role.id;
    const [minSize, maxSize] = role.sizeRange;
    card.innerHTML = `
      <h3>${role.label}</h3>
      <label class="layout-field">字号 <span data-readout="fontSize"></span></label>
      <input data-field="fontSize" type="range" min="${minSize}" max="${maxSize}" step="1" />
      <label class="layout-field">行高 <span data-readout="lineHeight"></span></label>
      <input data-field="lineHeight" type="range" min="0.95" max="2" step="0.05" />
      <label class="layout-field">字距 <span data-readout="letterSpacing"></span></label>
      <input data-field="letterSpacing" type="range" min="-1" max="24" step="0.5" />
      <div class="align-row" role="group" aria-label="${role.label}对齐">
        <button type="button" data-align="left">左</button>
        <button type="button" data-align="center">中</button>
        <button type="button" data-align="right">右</button>
      </div>
      <label class="color-row">颜色 <input data-field="color" type="color" /></label>
    `;
    const style = state.roles[role.id];
    for (const field of ["fontSize", "lineHeight", "letterSpacing"]) {
      const input = card.querySelector(`[data-field="${field}"]`);
      input.addEventListener("input", () => {
        style[field] = Number(input.value);
        paintRangeFill(input);
        render();
      });
    }
    card.querySelectorAll("[data-align]").forEach((button) => {
      button.addEventListener("click", () => {
        style.align = button.dataset.align;
        render();
      });
    });
    card.querySelector('[data-field="color"]').addEventListener("input", (event) => {
      style.color = event.target.value;
      state.contrastLocked = true;
      render();
    });
    roleFields.append(card);
  }
}

function createZone(slot) {
  const el = document.createElement("div");
  el.className = "poster-zone";
  el.dataset.slot = slot.id;
  el.dataset.role = slot.role;
  el.contentEditable = "true";
  el.spellcheck = false;
  el.setAttribute("role", "textbox");
  el.setAttribute("aria-label", roleById(slot.role)?.label || slot.role);
  el.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    document.execCommand("insertText", false, "\n");
  });
  el.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
  });
  el.addEventListener("input", () => {
    const item = itemForSlot(slot.id);
    if (item) item.text = el.innerText.replace(/\u00a0/g, " ");
    syncPoolFields();
    emptyHint.hidden = hasText();
  });
  el.addEventListener("blur", () => render());
  poster.append(el);
  return el;
}

function ensureZones() {
  const slots = compositionById(state.composition).slots;
  const ids = new Set(slots.map((slot) => slot.id));
  for (const [id, el] of zoneEls) {
    if (ids.has(id)) continue;
    el.remove();
    zoneEls.delete(id);
  }
  for (const slot of slots) {
    if (!zoneEls.has(slot.id)) zoneEls.set(slot.id, createZone(slot));
  }
}

function applyPreset(id) {
  const next = PRESETS[id];
  if (!next) return;
  state.preset = id;
  state.width = next.width;
  state.height = next.height;
  applyScaleToRoles();
  render();
}

function applyComposition(id) {
  if (!COMPOSITIONS.some((item) => item.id === id)) return;
  state.composition = id;
  state.pool = selectPoolForComposition(state.pool, id);
  resetAlignFromComposition();
  render();
}

function applyParse(data, message) {
  const incoming = Array.isArray(data?.pool) && data.pool.length ? data.pool : data?.roles || [];
  state.pool = normalizePool(incoming);
  if (COMPOSITIONS.some((item) => item.id === data?.suggestedComposition)) {
    state.composition = data.suggestedComposition;
  }
  state.pool = selectPoolForComposition(state.pool, state.composition);
  resetAlignFromComposition();
  render();
  const label = compositionById(state.composition).label;
  if (message) setStatus(message);
  else if (data?.parser === "fallback") setStatus("模型结果对不上原文，已按空行拆开，没有改你的字。");
  else setStatus(`已放进信息池。构图建议「${label}」，换构图不会重新分析。`);
  if (data?.dropped > 0 && data?.parser === "model") {
    setStatus(`${statusEl.textContent}有一句对不上原文，已经丢掉。`);
  }
}

async function analyze() {
  const source = copyInput.value.trim();
  if (!source) {
    setStatus("先贴文案。");
    return;
  }
  if (Array.from(source).length > 8000) {
    setStatus("这段太长了。海报只收 8000 字以内，长文请去优化排版。");
    return;
  }
  analyzeButton.disabled = true;
  analyzeButton.dataset.busy = "1";
  analyzeButton.textContent = "分析中…";
  try {
    const response = await fetch("/api/layout-parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      const reason = payload?.error?.message || "分析失败";
      applyParse(parseCopyLocally(source), `${reason} 已按空行拆开，没有改你的字。`);
      return;
    }
    applyParse(payload.data);
  } catch {
    applyParse(parseCopyLocally(source), "网络失败，已按空行拆开，没有改你的字。");
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.dataset.busy = "0";
    analyzeButton.textContent = "分析文案";
  }
}

function togglePoolItem(id, on) {
  const item = state.pool.find((entry) => entry.id === id);
  if (!item) return;
  if (!on) {
    item.onCanvas = false;
    item.slotId = "";
    render();
    return;
  }
  const slots = compositionById(state.composition).slots.filter((slot) => slot.role === item.role);
  const used = new Set(
    state.pool.filter((entry) => entry.onCanvas && entry.role === item.role).map((entry) => entry.slotId),
  );
  const free = slots.find((slot) => !used.has(slot.id));
  if (!free) {
    setStatus("这套构图没有空位了。换一种构图可以多放几句。");
    render();
    return;
  }
  item.onCanvas = true;
  item.slotId = free.id;
  render();
}

function syncRoleFields() {
  for (const role of ROLES) {
    const card = roleFields.querySelector(`[data-role="${role.id}"]`);
    const style = state.roles[role.id];
    const snapped = snapLineBox(style.fontSize, style.lineHeight);
    setIfIdle(card.querySelector('[data-field="fontSize"]'), Math.round(style.fontSize));
    setIfIdle(card.querySelector('[data-field="lineHeight"]'), style.lineHeight);
    setIfIdle(card.querySelector('[data-field="letterSpacing"]'), style.letterSpacing);
    setIfIdle(card.querySelector('[data-field="color"]'), style.color);
    card.querySelector('[data-readout="fontSize"]').textContent = `${Math.round(style.fontSize)}px`;
    card.querySelector('[data-readout="lineHeight"]').textContent = `${snapped.lineBox}px`;
    card.querySelector('[data-readout="letterSpacing"]').textContent = `${Number(style.letterSpacing)}px`;
    card.querySelectorAll("[data-field]").forEach((input) => {
      if (input.type === "range") paintRangeFill(input);
    });
    card.querySelectorAll("[data-align]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.align === style.align ? "true" : "false");
    });
  }
}

function syncPoolFields() {
  const signature = state.pool.map((item) => item.id).join("|");
  if (poolList.dataset.signature !== signature) {
    poolList.dataset.signature = signature;
    poolList.replaceChildren();
    if (!state.pool.length) {
      const empty = document.createElement("p");
      empty.className = "layout-help";
      empty.textContent = "还没有条目。先分析文案。";
      poolList.append(empty);
    }
    for (const item of state.pool) {
      const row = document.createElement("label");
      row.className = "pool-row";
      row.dataset.id = item.id;
      row.dataset.role = item.role;
      const box = document.createElement("input");
      box.type = "checkbox";
      box.setAttribute("aria-label", `${roleById(item.role)?.label || item.role}上画`);
      const textWrap = document.createElement("span");
      const label = document.createElement("small");
      label.textContent = roleById(item.role)?.label || item.role;
      const area = document.createElement("textarea");
      area.rows = 2;
      area.setAttribute("aria-label", `${roleById(item.role)?.label || item.role}原文`);
      textWrap.append(label, area);
      row.append(box, textWrap);
      box.addEventListener("change", () => togglePoolItem(item.id, box.checked));
      area.addEventListener("input", () => {
        const current = state.pool.find((entry) => entry.id === item.id);
        if (current) current.text = area.value;
        render();
      });
      poolList.append(row);
    }
  }
  for (const item of state.pool) {
    const row = poolList.querySelector(`[data-id="${item.id}"]`);
    if (!row) continue;
    const box = row.querySelector('input[type="checkbox"]');
    const area = row.querySelector("textarea");
    if (box) box.checked = Boolean(item.onCanvas);
    setIfIdle(area, item.text);
  }
}

function updateScaleHint() {
  const fontSize = {};
  for (const role of ROLES) fontSize[role.id] = state.roles[role.id].fontSize;
  const issues = typeScaleIssues(fontSize);
  const title = Math.round(fontSize.title);
  const body = Math.round(fontSize.body);
  scaleHint.hidden = false;
  if (!body || issues.includes("title-body") || issues.some((item) => item.startsWith("weak:"))) {
    scaleHint.textContent = `主标题 ${title}px，辅助字 ${body}px。差得不够开，点「套用字阶」。`;
    return;
  }
  scaleHint.textContent = `主标题 ${title}px，是辅助字 ${body}px 的 ${(title / body).toFixed(1)} 倍。正文间距 ${state.roles.body.letterSpacing}px。`;
}

function renderShapes() {
  const shapes = ORGANIC_SHAPES.map((shape) => {
    return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" transform="rotate(${shape.rotate} ${shape.cx} ${shape.cy})" />`;
  }).join("");
  posterShapes.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="layoutBlobBlur"><feGaussianBlur stdDeviation="2.8" /></filter></defs><g filter="url(#layoutBlobBlur)">${shapes}</g></svg>`;
}

function placeFrame(el, marginPx) {
  const x = (marginPx / state.width) * 100;
  const y = (marginPx / state.height) * 100;
  el.style.left = `${x}%`;
  el.style.right = `${x}%`;
  el.style.top = `${y}%`;
  el.style.bottom = `${y}%`;
}

function render() {
  const scale = fitScale();
  layoutFit.style.width = `${state.width * scale}px`;
  layoutFit.style.height = `${state.height * scale}px`;
  poster.style.width = `${state.width}px`;
  poster.style.height = `${state.height}px`;
  poster.style.transform = `scale(${scale})`;
  posterShapes.hidden = Boolean(state.image);
  posterPhoto.hidden = !state.image;
  posterOverlay.style.background = `rgba(0,0,0,${state.overlay / 100})`;
  const marginPx = currentMarginPx();
  placeFrame(posterGuide, marginPx);
  placeFrame(posterGrid, marginPx);
  placeFrame(posterThirds, marginPx);
  posterGuide.hidden = !state.showGuide;
  posterGrid.hidden = !state.showGrid;
  posterThirds.hidden = state.composition !== "thirds-focus";
  ensureZones();
  const comp = compositionById(state.composition);
  for (const slot of comp.slots) {
    const style = state.roles[slot.role];
    const meta = roleById(slot.role);
    const placed = placeSlot(slot, state.width, state.height, marginPx);
    const snapped = snapLineBox(style.fontSize, style.lineHeight);
    const el = zoneEls.get(slot.id);
    const item = itemForSlot(slot.id);
    el.style.left = `${placed.left}%`;
    el.style.top = `${placed.top}%`;
    el.style.width = `${placed.width}%`;
    el.style.height = `${placed.height}%`;
    el.style.fontSize = `${style.fontSize}px`;
    el.style.lineHeight = `${snapped.lineBox}px`;
    el.style.letterSpacing = `${style.letterSpacing}px`;
    el.style.color = style.color;
    el.style.textAlign = style.align;
    el.style.fontWeight = String(meta.weight);
    const text = item?.text || "";
    el.hidden = !text.trim() && document.activeElement !== el;
    if (document.activeElement !== el && el.innerText !== text) el.innerText = text;
  }
  presetRow.querySelectorAll("[data-preset]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.preset === state.preset ? "true" : "false");
  });
  marginRow.querySelectorAll("[data-margin]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.margin === state.marginPreset ? "true" : "false");
  });
  compositionGrid.querySelectorAll("[data-composition]").forEach((button) => {
    const on = button.dataset.composition === state.composition;
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.setAttribute("aria-selected", on ? "true" : "false");
  });
  scaleRow.querySelectorAll("[data-scale]").forEach((button) => {
    button.setAttribute("aria-pressed", Number(button.dataset.scale) === state.exportScale ? "true" : "false");
  });
  groupAlign.querySelectorAll("[data-group]").forEach((button) => {
    const roles = ALIGN_GROUPS[button.dataset.group] || [];
    const same = roles.every((roleId) => state.roles[roleId].align === button.dataset.align);
    button.setAttribute("aria-pressed", same ? "true" : "false");
  });
  setIfIdle(overlay, state.overlay);
  safeMarginValue.textContent = marginCopy();
  overlayValue.textContent = `${state.overlay}%`;
  paintRangeFill(overlay);
  showGuide.checked = state.showGuide;
  showGrid.checked = state.showGrid;
  exportFormat.value = state.format;
  emptyHint.hidden = hasText();
  syncRoleFields();
  syncPoolFields();
  updateScaleHint();
}

function fitScale() {
  const rect = stageWrap.getBoundingClientRect();
  const availW = Math.max(160, rect.width - 56);
  const availH = Math.max(160, rect.height - 56);
  return Math.min(availW / state.width, availH / state.height);
}

function textWidth(ctx, text, spacing) {
  const chars = Array.from(text);
  if (!chars.length) return 0;
  let width = 0;
  chars.forEach((char, index) => {
    width += ctx.measureText(char).width;
    if (index < chars.length - 1) width += spacing;
  });
  return width;
}

function wrapLines(ctx, text, maxWidth, spacing) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const char of Array.from(paragraph)) {
      const next = line + char;
      if (line && textWidth(ctx, next, spacing) > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawLine(ctx, line, x, y, align, maxWidth, spacing) {
  const chars = Array.from(line);
  const width = textWidth(ctx, line, spacing);
  let cursor = x;
  if (align === "center") cursor = x + (maxWidth - width) / 2;
  if (align === "right") cursor = x + maxWidth - width;
  for (const char of chars) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  }
}

function drawCover(ctx, image, width, height) {
  const ratio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;
  let drawW = width;
  let drawH = height;
  let dx = 0;
  let dy = 0;
  if (ratio > canvasRatio) {
    drawH = height;
    drawW = height * ratio;
    dx = (width - drawW) / 2;
  } else {
    drawW = width;
    drawH = width / ratio;
    dy = (height - drawH) / 2;
  }
  ctx.drawImage(image, dx, dy, drawW, drawH);
}

function drawShapes(ctx, width, height) {
  ctx.save();
  ctx.filter = `blur(${Math.max(12, Math.round(width * 0.025))}px)`;
  for (const shape of ORGANIC_SHAPES) {
    ctx.save();
    ctx.translate((shape.cx / 100) * width, (shape.cy / 100) * height);
    ctx.rotate((shape.rotate * Math.PI) / 180);
    ctx.fillStyle = shape.fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, (shape.rx / 100) * width, (shape.ry / 100) * height, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function paintPoster(ctx) {
  const width = state.width;
  const height = state.height;
  ctx.fillStyle = POSTER_BG;
  ctx.fillRect(0, 0, width, height);
  if (state.image) drawCover(ctx, state.image, width, height);
  else drawShapes(ctx, width, height);
  if (state.overlay > 0) {
    ctx.fillStyle = `rgba(0,0,0,${state.overlay / 100})`;
    ctx.fillRect(0, 0, width, height);
  }
  const marginPx = currentMarginPx();
  const comp = compositionById(state.composition);
  for (const slot of comp.slots) {
    const item = itemForSlot(slot.id);
    const text = String(item?.text || "").replace(/\u00a0/g, " ");
    if (!text.trim()) continue;
    const style = state.roles[slot.role];
    const meta = roleById(slot.role);
    const placed = placeSlot(slot, width, height, marginPx);
    const snapped = snapLineBox(style.fontSize, style.lineHeight);
    ctx.font = `${meta.weight} ${style.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "alphabetic";
    const lines = wrapLines(ctx, text, Math.max(8, placed.w), style.letterSpacing);
    const sample = ctx.measureText("字");
    const ascent = sample.actualBoundingBoxAscent || style.fontSize * 0.8;
    const descent = sample.actualBoundingBoxDescent || style.fontSize * 0.2;
    const extra = Math.max(0, snapped.lineBox - (ascent + descent));
    let baseline = placed.y + extra / 2 + ascent;
    for (const line of lines) {
      drawLine(ctx, line, placed.x, baseline, style.align, placed.w, style.letterSpacing);
      baseline += snapped.lineBox;
    }
  }
}

function readLiveBlocks() {
  const blocks = [];
  for (const slot of compositionById(state.composition).slots) {
    const item = itemForSlot(slot.id);
    if (!item || !String(item.text || "").trim()) continue;
    const el = zoneEls.get(slot.id);
    if (!el || el.hidden) continue;
    const y = el.offsetTop;
    const textBottom = y + el.scrollHeight;
    blocks.push({
      id: slot.id,
      role: slot.role,
      x: el.offsetLeft,
      y,
      w: el.offsetWidth,
      h: el.scrollHeight,
      textBottom,
    });
  }
  return blocks;
}

async function ensureFonts() {
  if (!document.fonts?.load) return;
  const jobs = ROLES.map((role) => document.fonts.load(`${role.weight} ${state.roles[role.id].fontSize}px "Noto Sans SC"`));
  await Promise.all(jobs).catch(() => {});
  await document.fonts.ready.catch(() => {});
}

function formatBytes(size) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

async function exportImage() {
  exportButton.disabled = true;
  setStatus("正在导出…");
  try {
    await ensureFonts();
    const issues = auditSafeBounds({
      width: state.width,
      height: state.height,
      marginPx: currentMarginPx(),
      blocks: readLiveBlocks(),
    });
    const scale = state.exportScale;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(state.width * scale);
    canvas.height = Math.round(state.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    paintPoster(ctx);
    const type = state.format === "jpeg" ? "image/jpeg" : "image/png";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, state.format === "jpeg" ? 0.92 : undefined));
    if (!blob) {
      setStatus("导出失败，请换一种格式再试。");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yooco-layout-${state.preset}-${state.composition}.${state.format === "jpeg" ? "jpg" : "png"}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    const edge = Math.max(canvas.width, canvas.height);
    const parts = [];
    if (issues.length) {
      const names = [...new Set(issues.map((item) => roleById(item.role)?.label || item.role))];
      parts.push(`这些字超出了安全边距：${names.join("、")}，图仍会下载`);
    }
    parts.push(`已下载，大约 ${formatBytes(blob.size)}，${canvas.width}×${canvas.height}`);
    if (blob.size > 5 * 1024 * 1024) parts.push("超过 5MB，微信单图可能放不下。可以改成 JPEG 或 1x");
    if (edge > 4096) parts.push("边很长，发之前可以改成 1x");
    setStatus(parts.join("。"));
  } catch {
    setStatus("导出失败，请重试。");
  } finally {
    exportButton.disabled = false;
  }
}

function sampleLuminance(image) {
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, 24, 24);
  const data = ctx.getImageData(0, 0, 24, 24).data;
  let sum = 0;
  const count = data.length / 4;
  for (let index = 0; index < data.length; index += 4) {
    sum += relativeLuminanceFromRgb(data[index], data[index + 1], data[index + 2]);
  }
  return sum / count;
}

function applyAutoContrast(image) {
  if (state.contrastLocked) return;
  let luminance = 0.5;
  try {
    luminance = sampleLuminance(image);
  } catch {
    state.overlay = 36;
    state.contrastAuto = true;
    setStatus("这张图读不出明暗，已先压暗一层。");
    return;
  }
  const previous = state.roles.title.color;
  const plan = planContrast({
    backgroundLuminance: luminance,
    textColor: previous,
    overlay: state.overlay / 100,
  });
  if (!plan.changed) {
    state.contrastAuto = false;
    return;
  }
  state.overlay = Math.round(plan.overlay * 100);
  state.contrastAuto = true;
  const colorChanged = plan.color.toLowerCase() !== previous.toLowerCase();
  if (colorChanged) {
    for (const role of ROLES) state.roles[role.id].color = plan.color;
  }
  if (colorChanged && plan.overlay > 0) setStatus("背景和字太接近，已压暗并改了字色。");
  else if (colorChanged) setStatus("背景和字太接近，已改成更容易看清的字色。");
  else setStatus("背景和字太接近，已压暗一层。");
}

function onBackgroundFile(file) {
  if (!file) return;
  const looksLikeImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
  if (!looksLikeImage) {
    setStatus("请选一张图片。");
    return;
  }
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.imageUrl = url;
    posterPhoto.src = url;
    clearBg.hidden = false;
    bgName.textContent = file.name;
    applyAutoContrast(image);
    render();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus("这张图打不开。");
  };
  image.src = url;
}

function clearBackground() {
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  state.image = null;
  state.imageUrl = "";
  posterPhoto.removeAttribute("src");
  clearBg.hidden = true;
  bgName.textContent = "";
  bgFile.value = "";
  if (!state.contrastLocked && state.contrastAuto) {
    state.overlay = 0;
    for (const role of ROLES) state.roles[role.id].color = role.color;
    state.contrastAuto = false;
  }
  render();
}

function fillSample(text, message) {
  copyInput.value = text;
  lengthNote.hidden = text.trim().length <= 400;
  applyParse(parseCopyLocally(text), message);
}

buildPresets();
buildMargins();
buildCompositions();
buildRoles();
renderShapes();

copyInput.addEventListener("input", () => {
  lengthNote.hidden = copyInput.value.trim().length <= 400;
});
analyzeButton.addEventListener("click", analyze);
sampleButton.addEventListener("click", () => {
  fillSample(SAMPLE, "已填入示例，并按空行拆开。点「分析文案」会再问一次模型。");
});
longSampleButton.addEventListener("click", () => {
  fillSample(LONG_SAMPLE, "已填入稍长示例。居中少放几句，九宫格多放几句。换构图不会重新分析。");
});
bgFile.addEventListener("change", () => onBackgroundFile(bgFile.files?.[0]));
clearBg.addEventListener("click", clearBackground);
showGuide.addEventListener("change", () => {
  state.showGuide = showGuide.checked;
  render();
});
showGrid.addEventListener("change", () => {
  state.showGrid = showGrid.checked;
  render();
});
applyScaleButton.addEventListener("click", () => {
  applyScaleToRoles();
  render();
});
groupAlign.querySelectorAll("[data-group]").forEach((button) => {
  button.addEventListener("click", () => {
    const roles = ALIGN_GROUPS[button.dataset.group] || [];
    for (const roleId of roles) state.roles[roleId].align = button.dataset.align;
    render();
  });
});
overlay.addEventListener("input", () => {
  state.overlay = Number(overlay.value);
  state.contrastLocked = true;
  render();
});
scaleRow.querySelectorAll("[data-scale]").forEach((button) => {
  button.addEventListener("click", () => {
    state.exportScale = Number(button.dataset.scale);
    render();
  });
});
exportFormat.addEventListener("change", () => {
  state.format = exportFormat.value === "jpeg" ? "jpeg" : "png";
});
exportButton.addEventListener("click", exportImage);
window.addEventListener("resize", render);
if (window.ResizeObserver) new ResizeObserver(() => render()).observe(stageWrap);
render();
