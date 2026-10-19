import {
  COMPOSITIONS,
  FONT_STACK,
  ORGANIC_SHAPES,
  POSTER_BG,
  PRESETS,
  ROLES,
  compositionById,
  parseCopyLocally,
  placeZone,
  roleById,
} from "./layout-templates.js";

const SAMPLE = "少说一句\n\n把想说的话，放在画面中间。\n\n文 / Yooco";

const state = {
  preset: "portrait",
  width: PRESETS.portrait.width,
  height: PRESETS.portrait.height,
  composition: "center",
  safeMargin: 6,
  showGuide: true,
  overlay: 0,
  overlayTouched: false,
  exportScale: 2,
  format: "png",
  image: null,
  imageUrl: "",
  roles: {},
};

for (const role of ROLES) {
  const box = compositionById("center").zones[role.id];
  state.roles[role.id] = {
    text: "",
    fontSize: role.size.portrait,
    lineHeight: role.lineHeight,
    letterSpacing: role.letterSpacing,
    color: role.color,
    align: box.align,
  };
}

const copyInput = document.querySelector("#copyInput");
const analyzeButton = document.querySelector("#analyzeButton");
const sampleButton = document.querySelector("#sampleButton");
const statusEl = document.querySelector("#layoutStatus");
const lengthNote = document.querySelector("#lengthNote");
const bgFile = document.querySelector("#bgFile");
const clearBg = document.querySelector("#clearBg");
const bgName = document.querySelector("#bgName");
const presetRow = document.querySelector("#presetRow");
const compositionGrid = document.querySelector("#compositionGrid");
const roleFields = document.querySelector("#roleFields");
const safeMargin = document.querySelector("#safeMargin");
const safeMarginValue = document.querySelector("#safeMarginValue");
const showGuide = document.querySelector("#showGuide");
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

function compositionLabel(id) {
  return compositionById(id).label;
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

function buildCompositions() {
  for (const item of COMPOSITIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.composition = item.id;
    button.setAttribute("role", "option");
    button.innerHTML = `${item.label}<small>${item.blurb}</small>`;
    button.addEventListener("click", () => {
      state.composition = item.id;
      for (const role of ROLES) state.roles[role.id].align = item.zones[role.id].align;
      render();
    });
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
      <textarea data-field="text" rows="2" aria-label="${role.label}文字"></textarea>
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
    card.querySelector('[data-field="text"]').addEventListener("input", (event) => {
      style.text = event.target.value;
      render();
    });
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
      render();
    });
    roleFields.append(card);
  }
}

function buildZones() {
  for (const role of ROLES) {
    const el = document.createElement("div");
    el.className = "poster-zone";
    el.dataset.role = role.id;
    el.contentEditable = "true";
    el.spellcheck = false;
    el.setAttribute("role", "textbox");
    el.setAttribute("aria-label", role.label);
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
      state.roles[role.id].text = el.innerText.replace(/\u00a0/g, " ");
      syncRoleFields();
      emptyHint.hidden = hasText();
    });
    el.addEventListener("blur", () => render());
    poster.append(el);
    zoneEls.set(role.id, el);
  }
}

function hasText() {
  return ROLES.some((role) => state.roles[role.id].text.trim());
}

function applyPreset(id) {
  const next = PRESETS[id];
  if (!next) return;
  const prevMin = Math.min(state.width, state.height);
  const nextMin = Math.min(next.width, next.height);
  const ratio = prevMin ? nextMin / prevMin : 1;
  state.preset = id;
  state.width = next.width;
  state.height = next.height;
  for (const role of ROLES) {
    const [minSize, maxSize] = role.sizeRange;
    const size = Math.round(state.roles[role.id].fontSize * ratio);
    state.roles[role.id].fontSize = Math.min(maxSize, Math.max(minSize, size));
  }
  render();
}

function applyParse(data, message) {
  for (const role of ROLES) state.roles[role.id].text = "";
  for (const item of data?.roles || []) {
    if (state.roles[item.role]) state.roles[item.role].text = String(item.text || "");
  }
  if (COMPOSITIONS.some((item) => item.id === data?.suggestedComposition)) {
    state.composition = data.suggestedComposition;
    const comp = compositionById(state.composition);
    for (const role of ROLES) state.roles[role.id].align = comp.zones[role.id].align;
  }
  render();
  const label = compositionLabel(state.composition);
  if (message) setStatus(message);
  else if (data?.parser === "fallback") setStatus("模型结果对不上原文，已按空行拆开，没有改你的字。");
  else setStatus(`已标好角色。构图建议「${label}」，可以改。`);
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

function syncRoleFields() {
  for (const role of ROLES) {
    const card = roleFields.querySelector(`[data-role="${role.id}"]`);
    const style = state.roles[role.id];
    setIfIdle(card.querySelector('[data-field="text"]'), style.text);
    setIfIdle(card.querySelector('[data-field="fontSize"]'), style.fontSize);
    setIfIdle(card.querySelector('[data-field="lineHeight"]'), style.lineHeight);
    setIfIdle(card.querySelector('[data-field="letterSpacing"]'), style.letterSpacing);
    setIfIdle(card.querySelector('[data-field="color"]'), style.color);
    card.querySelector('[data-readout="fontSize"]').textContent = `${Math.round(style.fontSize)}px`;
    card.querySelector('[data-readout="lineHeight"]').textContent = Number(style.lineHeight).toFixed(2);
    card.querySelector('[data-readout="letterSpacing"]').textContent = `${Number(style.letterSpacing)}px`;
    card.querySelectorAll("[data-field]").forEach((input) => {
      if (input.type === "range") paintRangeFill(input);
    });
    card.querySelectorAll("[data-align]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.align === style.align ? "true" : "false");
    });
  }
}

function renderShapes() {
  const shapes = ORGANIC_SHAPES.map((shape) => {
    return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" fill="${shape.fill}" transform="rotate(${shape.rotate} ${shape.cx} ${shape.cy})" />`;
  }).join("");
  posterShapes.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="layoutBlobBlur"><feGaussianBlur stdDeviation="2.8" /></filter></defs><g filter="url(#layoutBlobBlur)">${shapes}</g></svg>`;
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
  const margin = state.safeMargin;
  posterGuide.hidden = !state.showGuide;
  posterGuide.style.inset = `${margin}%`;
  const comp = compositionById(state.composition);
  for (const role of ROLES) {
    const style = state.roles[role.id];
    const meta = roleById(role.id);
    const placed = placeZone(comp.zones[role.id], state.safeMargin);
    const el = zoneEls.get(role.id);
    el.style.left = `${placed.x}%`;
    el.style.top = `${placed.y}%`;
    el.style.width = `${placed.w}%`;
    el.style.height = `${placed.h}%`;
    el.style.fontSize = `${style.fontSize}px`;
    el.style.lineHeight = String(style.lineHeight);
    el.style.letterSpacing = `${style.letterSpacing}px`;
    el.style.color = style.color;
    el.style.textAlign = style.align;
    el.style.fontWeight = String(meta.weight);
    el.hidden = !style.text.trim() && document.activeElement !== el;
    if (document.activeElement !== el && el.innerText !== style.text) el.innerText = style.text;
  }
  presetRow.querySelectorAll("[data-preset]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.preset === state.preset ? "true" : "false");
  });
  compositionGrid.querySelectorAll("[data-composition]").forEach((button) => {
    const on = button.dataset.composition === state.composition;
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.setAttribute("aria-selected", on ? "true" : "false");
  });
  scaleRow.querySelectorAll("[data-scale]").forEach((button) => {
    button.setAttribute("aria-pressed", Number(button.dataset.scale) === state.exportScale ? "true" : "false");
  });
  setIfIdle(safeMargin, state.safeMargin);
  setIfIdle(overlay, state.overlay);
  safeMarginValue.textContent = `${state.safeMargin}%`;
  overlayValue.textContent = `${state.overlay}%`;
  paintRangeFill(safeMargin);
  paintRangeFill(overlay);
  showGuide.checked = state.showGuide;
  exportFormat.value = state.format;
  emptyHint.hidden = hasText();
  syncRoleFields();
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
  const comp = compositionById(state.composition);
  for (const role of ROLES) {
    const style = state.roles[role.id];
    const text = style.text.replace(/\u00a0/g, " ");
    if (!text.trim()) continue;
    const meta = roleById(role.id);
    const placed = placeZone(comp.zones[role.id], state.safeMargin);
    const x = (placed.x / 100) * width;
    const y = (placed.y / 100) * height;
    const boxW = (placed.w / 100) * width;
    ctx.font = `${meta.weight} ${style.fontSize}px ${FONT_STACK}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "alphabetic";
    const lines = wrapLines(ctx, text, Math.max(8, boxW), style.letterSpacing);
    const sample = ctx.measureText("字");
    const ascent = sample.actualBoundingBoxAscent || style.fontSize * 0.8;
    const descent = sample.actualBoundingBoxDescent || style.fontSize * 0.2;
    const lineBox = style.fontSize * style.lineHeight;
    const extra = Math.max(0, lineBox - (ascent + descent));
    let baseline = y + extra / 2 + ascent;
    for (const line of lines) {
      drawLine(ctx, line, x, baseline, style.align, boxW, style.letterSpacing);
      baseline += lineBox;
    }
  }
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
    const parts = [`已下载，大约 ${formatBytes(blob.size)}，${canvas.width}×${canvas.height}`];
    if (blob.size > 5 * 1024 * 1024) parts.push("超过 5MB，微信单图可能放不下。可以改成 JPEG 或 1x");
    if (edge > 4096) parts.push("边很长，发之前可以改成 1x");
    setStatus(parts.join("。"));
  } catch {
    setStatus("导出失败，请重试。");
  } finally {
    exportButton.disabled = false;
  }
}

function onBackgroundFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
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
    if (!state.overlayTouched) state.overlay = 36;
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
  if (!state.overlayTouched) state.overlay = 0;
  render();
}

buildPresets();
buildCompositions();
buildRoles();
buildZones();
renderShapes();

copyInput.addEventListener("input", () => {
  lengthNote.hidden = copyInput.value.trim().length <= 400;
});
analyzeButton.addEventListener("click", analyze);
sampleButton.addEventListener("click", () => {
  copyInput.value = SAMPLE;
  lengthNote.hidden = true;
  applyParse(parseCopyLocally(SAMPLE), "已填入示例，并按空行拆开。点「分析文案」会再问一次模型。");
});
bgFile.addEventListener("change", () => onBackgroundFile(bgFile.files?.[0]));
clearBg.addEventListener("click", clearBackground);
safeMargin.addEventListener("input", () => {
  state.safeMargin = Number(safeMargin.value);
  render();
});
showGuide.addEventListener("change", () => {
  state.showGuide = showGuide.checked;
  render();
});
overlay.addEventListener("input", () => {
  state.overlay = Number(overlay.value);
  state.overlayTouched = true;
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
