// 空行敲 / 插入排版块。只产生原文记号，颜色仍走当前主题。
(function (root) {
  const SLASH_CARDS = [
    { id: "quote", label: "引用框", hint: "带标题的引用", keywords: ["引用", "quote"] },
    { id: "highlight", label: "重点框", hint: "用重点底色的提示框", keywords: ["重点", "highlight"] },
    { id: "divider", label: "分割线", hint: "一条分隔", keywords: ["分割", "分隔", "divider"] },
    { id: "header", label: "图文头", hint: "标题、副题和头图槽", keywords: ["图文", "标题", "header"] },
    { id: "media", label: "双栏图文", hint: "一侧图、一侧文", group: "图文栅格", keywords: ["图文", "栅格", "双栏", "图片", "grid"] },
    { id: "points", label: "三列要点", hint: "三列对齐的短要点", group: "图文栅格", keywords: ["要点", "三列", "栅格", "grid"] },
    { id: "reveal", label: "点击揭晓", hint: "点一下露出底下内容", group: "互动展示", keywords: ["互动", "揭晓", "点击", "reveal"] },
    { id: "swap", label: "两图切换", hint: "点一下在两版之间切换", group: "互动展示", keywords: ["互动", "切换", "两图", "swap"] },
    { id: "expand", label: "点击展开", hint: "点一下展开，再点收起", group: "互动展示", keywords: ["互动", "展开", "折叠", "expand"] },
  ];

  const SNIPPETS = {
    quote: "> **引用**：把想引用的话写在这里。",
    highlight: ":::highlight 重点\n把需要强调的话写在这里。\n:::",
    divider: "---",
    header: ":::header\n在这里写标题\n副题可以留空\n:::",
    media: ":::media\n![]()\n:::",
    points: ":::points\n---\n---\n:::",
    reveal: ":::interact reveal\ncue: 点一下，看底下写了什么\ncover: 点这里揭晓\nanswer: 先把标题空出来。\nstill: 揭开以后是：先把标题空出来。\n:::",
    swap: ":::interact swap\ncue: 点一下，在两版之间换\na: 甲版：先写给谁看\nb: 乙版：再留出标题的位置\nstill: 两版都在。甲版：先写给谁看。乙版：再留出标题的位置。\n:::",
    expand: ":::interact expand\ncue: 点一下展开，再点可以收起\nsummary: 点这里展开\nbody: 先写给谁看。\n再定这一段放哪。\n最后留出标题的位置。\nstill: 展开后能看到：先写给谁看。再定这一段放哪。最后留出标题的位置。\n:::",
  };

  const INTERACT_KINDS = ["reveal", "swap", "expand"];
  const INTERACT_KEYS = {
    cue: "cue",
    cover: "cover",
    answer: "answer",
    a: "a",
    b: "b",
    summary: "summary",
    body: "body",
    still: "still",
    kind: "kind",
    aurl: "aUrl",
    burl: "bUrl",
  };

  function escapeXml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[character]));
  }

  function hexColor(value, fallback) {
    const color = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
  }

  function knownInteractKind(kind) {
    return INTERACT_KINDS.includes(String(kind || "").trim().toLowerCase());
  }

  function normalizeKind(kind) {
    return knownInteractKind(kind) ? String(kind).trim().toLowerCase() : "reveal";
  }

  function safeInteractUrl(value) {
    const raw = String(value || "").trim().replace(/\s/g, "");
    if (!raw) return "";
    if (/^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(raw)) {
      return raw.length > 2800000 ? "" : raw;
    }
    if (/^https?:\/\/[^\s"'<>\\]+$/i.test(raw)) return raw;
    return "";
  }

  function cleanField(value) {
    return String(value ?? "").replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n").replace(/:::/g, "").trim();
  }

  function oneLine(value) {
    return cleanField(value).replace(/\s+/g, " ").trim();
  }

  function readMaybeImage(value) {
    const image = String(value || "").trim().match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
    if (!image) return { text: cleanField(value), url: "" };
    return { text: oneLine(image[1]), url: safeInteractUrl(image[2]) };
  }

  function parseInteractLines(lines) {
    const fields = {
      kind: "", cue: "", cover: "", answer: "", a: "", b: "", aUrl: "", bUrl: "", summary: "", body: "", still: "",
    };
    let current = "";
    (lines || []).forEach((line) => {
      const match = String(line).match(/^([A-Za-z]+)[ \t]*[:：][ \t]?(.*)$/);
      const key = match ? INTERACT_KEYS[match[1].toLowerCase()] : "";
      if (key) {
        current = key;
        fields[key] = match[2];
        return;
      }
      if (!current) return;
      fields[current] = fields[current] ? `${fields[current]}\n${line}` : line;
    });
    const left = readMaybeImage(fields.a);
    const right = readMaybeImage(fields.b);
    return {
      kind: fields.kind,
      cue: oneLine(fields.cue),
      cover: oneLine(fields.cover),
      answer: cleanField(fields.answer),
      a: left.text,
      b: right.text,
      aUrl: safeInteractUrl(fields.aUrl) || left.url,
      bUrl: safeInteractUrl(fields.bUrl) || right.url,
      summary: oneLine(fields.summary),
      body: cleanField(fields.body),
      still: cleanField(fields.still),
    };
  }

  function interactStill(item) {
    const still = cleanField(item?.still);
    if (still) return still;
    const kind = normalizeKind(item?.kind);
    if (kind === "swap") return [item?.a, item?.b].map(cleanField).filter(Boolean).join(" ");
    if (kind === "expand") return cleanField(item?.body) || oneLine(item?.summary);
    return cleanField(item?.answer) || oneLine(item?.cover);
  }

  function normalizeInteract(item) {
    const kind = normalizeKind(item?.kind);
    const next = {
      type: "interact",
      kind,
      cue: oneLine(item?.cue),
      cover: oneLine(item?.cover),
      answer: cleanField(item?.answer),
      a: cleanField(item?.a),
      b: cleanField(item?.b),
      aUrl: safeInteractUrl(item?.aUrl),
      bUrl: safeInteractUrl(item?.bUrl),
      summary: oneLine(item?.summary),
      body: cleanField(item?.body),
      still: "",
    };
    if (kind === "reveal") {
      if (!next.cover) next.cover = "点这里揭晓";
      if (!next.answer) next.answer = "先把标题空出来。";
      if (!next.cue) next.cue = "点一下，看底下写了什么";
    } else if (kind === "swap") {
      if (!next.a) next.a = "甲版：先写给谁看";
      if (!next.b) next.b = "乙版：再留出标题的位置";
      if (!next.cue) next.cue = "点一下，在两版之间换";
    } else {
      if (!next.summary) next.summary = "点这里展开";
      if (!next.body) next.body = "先写给谁看。\n再定这一段放哪。\n最后留出标题的位置。";
      if (!next.cue) next.cue = "点一下展开，再点可以收起";
    }
    next.still = interactStill({ ...next, still: item?.still });
    return next;
  }

  function readInteractFence(title, lines) {
    const parsed = parseInteractLines(lines);
    return normalizeInteract({ ...parsed, kind: title || parsed.kind });
  }

  function interactMarkdown(item) {
    const fields = normalizeInteract(item);
    const rows = [`:::interact ${fields.kind}`, `cue: ${fields.cue}`];
    if (fields.kind === "reveal") {
      rows.push(`cover: ${fields.cover}`, `answer: ${fields.answer}`);
    } else if (fields.kind === "swap") {
      rows.push(`a: ${fields.a}`);
      if (fields.aUrl) rows.push(`aUrl: ${fields.aUrl}`);
      rows.push(`b: ${fields.b}`);
      if (fields.bUrl) rows.push(`bUrl: ${fields.bUrl}`);
    } else {
      rows.push(`summary: ${fields.summary}`, `body: ${fields.body}`);
    }
    rows.push(`still: ${fields.still}`, ":::");
    return rows.join("\n");
  }

  function interactFromAttrs(attrs) {
    const source = attrs || {};
    return normalizeInteract({
      kind: source.kind || source["data-kind"] || source["data-yooco-interact"],
      cue: source.cue ?? source["data-cue"],
      cover: source.cover ?? source["data-cover"],
      answer: source.answer ?? source["data-answer"],
      a: source.a ?? source["data-a"],
      b: source.b ?? source["data-b"],
      aUrl: source.aUrl ?? source["data-a-url"],
      bUrl: source.bUrl ?? source["data-b-url"],
      summary: source.summary ?? source["data-summary"],
      body: source.body ?? source["data-body"],
      still: source.still ?? source["data-still"],
    });
  }

  function interactDataAttrs(item) {
    const fields = normalizeInteract(item);
    const pairs = [
      ["data-kind", fields.kind],
      ["data-yooco-interact", fields.kind],
      ["data-cue", fields.cue],
      ["data-cover", fields.cover],
      ["data-answer", fields.answer],
      ["data-a", fields.a],
      ["data-b", fields.b],
      ["data-a-url", fields.aUrl],
      ["data-b-url", fields.bUrl],
      ["data-summary", fields.summary],
      ["data-body", fields.body],
      ["data-still", fields.still],
    ];
    return pairs.map(([key, value]) => `${key}="${escapeXml(value).replace(/\n/g, "&#10;")}"`).join(" ");
  }

  function wrapLines(value, size) {
    const limit = Math.max(8, size);
    const lines = [];
    String(value || "").replace(/\r\n?/g, "\n").split("\n").forEach((row) => {
      const chars = Array.from(row.trim());
      if (!chars.length) return;
      for (let index = 0; index < chars.length; index += limit) lines.push(chars.slice(index, index + limit).join(""));
    });
    return lines.length ? lines : [""];
  }

  function svgText(x, y, value, size, fill, anchor) {
    const align = anchor && anchor !== "start" ? ` text-anchor="${anchor}"` : "";
    return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}"${align}>${escapeXml(value)}</text>`;
  }

  function svgLines(x, y, lines, size, fill, gap, anchor) {
    return lines.map((line, index) => svgText(x, y + index * gap, line, size, fill, anchor)).join("");
  }

  function interactPrefix(seed) {
    const extra = Math.random().toString(36).slice(2, 8);
    const clean = String(seed || "").replace(/[^a-z0-9]/gi, "").slice(0, 8);
    return `y${clean}${extra}`;
  }

  function cleanPrefix(prefix) {
    const clean = String(prefix || "").replace(/[^a-z0-9]/gi, "");
    return /^[A-Za-z]/.test(clean) ? clean.slice(0, 24) : `y${clean.slice(0, 23)}`;
  }

  function svgImage(url, x, y, width, height) {
    const href = safeInteractUrl(url);
    if (!href) return "";
    const safe = escapeXml(href);
    return `<image href="${safe}" xlink:href="${safe}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>`;
  }

  function svgRoot(body, height, viewBox, flow) {
    const box = viewBox ? ` viewBox="${viewBox}"` : "";
    const kind = flow ? "interact-flow" : "interact-stage";
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="${height}"${box} class="${kind}" style="display:block;width:100%;max-width:100%;">${body}</svg>`;
  }

  function hitRect(id, x, y, width, height) {
    return `<rect id="${id}" x="${x}" y="${y}" width="${width}" height="${height}" fill="#000000" fill-opacity="0" pointer-events="all"/>`;
  }

  function buildRevealSvg(item, colors, prefix) {
    const lines = wrapLines(item.answer, 16).slice(0, 3);
    const cover = wrapLines(item.cover, 12).slice(0, 2);
    const id = `${prefix}go`;
    const answer = svgLines(320, 108, lines, 26, colors.ink, 34, "middle");
    const maskText = svgLines(320, cover.length > 1 ? 96 : 112, cover, 28, colors.onAccent, 36, "middle");
    const mask = `<g visibility="visible"><animate attributeName="opacity" from="1" to="0" begin="${id}.click" dur="0.35s" fill="freeze"/><set attributeName="visibility" to="hidden" begin="${id}.click+0.35s" fill="freeze"/><rect x="0" y="0" width="640" height="208" fill="${colors.accent}"/>${maskText}${svgText(320, 164, "点一下", 14, colors.onAccent, "middle")}${hitRect(id, 0, 0, 640, 208)}</g>`;
    return svgRoot(`<rect width="640" height="208" fill="${colors.paper}"/>${answer}${mask}`, "208", "0 0 640 208", false);
  }

  function buildSwapFace(item, colors, prefix, side) {
    const text = side === "a" ? item.a : item.b;
    const url = side === "a" ? item.aUrl : item.bUrl;
    const label = side === "a" ? "甲" : "乙";
    const hit = side === "a" ? `${prefix}a` : `${prefix}b`;
    const other = side === "a" ? `${prefix}b` : `${prefix}a`;
    const initial = side === "a" ? "visible" : "hidden";
    const events = side === "a" ? "all" : "none";
    const lines = wrapLines(text, 12).slice(0, 3);
    const picture = svgImage(url, 36, 44, 168, 120);
    const plate = picture || `<rect x="36" y="44" width="168" height="120" rx="8" fill="${colors.accent}"/>${svgText(120, 114, label, 36, colors.onAccent, "middle")}`;
    const copy = svgLines(228, lines.length > 2 ? 78 : 96, lines, 22, colors.ink, 32, "start");
    const hot = `<rect id="${hit}" x="0" y="0" width="640" height="220" fill="#000000" fill-opacity="0" pointer-events="${events}"><set attributeName="pointer-events" to="none" begin="${hit}.click" fill="freeze"/><set attributeName="pointer-events" to="all" begin="${other}.click" fill="freeze"/></rect>`;
    return `<g visibility="${initial}"><set attributeName="visibility" to="hidden" begin="${hit}.click" fill="freeze"/><set attributeName="visibility" to="visible" begin="${other}.click" fill="freeze"/><rect width="640" height="220" fill="${colors.paper}"/>${plate}${copy}${svgText(320, 198, "点一下换一版", 14, colors.muted, "middle")}${hot}</g>`;
  }

  function buildExpandSvg(item, colors, prefix) {
    const lines = wrapLines(item.body, 16).slice(0, 6);
    const head = 72;
    const full = head + 20 + lines.length * 30 + 36;
    const open = `${prefix}open`;
    const shut = `${prefix}shut`;
    const summary = oneLine(item.summary).slice(0, 18) || "点这里展开";
    const hint = `<g visibility="visible"><set attributeName="visibility" to="hidden" begin="${open}.click" fill="freeze"/><set attributeName="visibility" to="visible" begin="${shut}.click" fill="freeze"/>${svgText("96%", 44, "展开", 14, colors.onAccent, "end")}</g>`;
    const body = `<rect width="100%" height="${full}" fill="${colors.paper}"/><rect width="100%" height="${full}" fill="none" stroke="${colors.border}" stroke-width="1"/><rect width="100%" height="${head}" fill="${colors.accent}"/>${svgText(24, 44, summary, 20, colors.onAccent, "start")}${hint}${svgLines(24, head + 36, lines, 18, colors.ink, 30, "start")}${svgText(24, full - 16, "再点收起", 14, colors.accent, "start")}${hitRect(open, 0, 0, "100%", head)}${hitRect(shut, 0, head, "100%", full - head)}<animate attributeName="height" from="${head}" to="${full}" begin="${open}.click" dur="0.35s" fill="freeze"/><animate attributeName="height" from="${full}" to="${head}" begin="${shut}.click" dur="0.35s" fill="freeze"/>`;
    return svgRoot(body, String(head), "", true);
  }

  function buildInteractSvg(item, palette, prefix) {
    const fields = normalizeInteract(item);
    const colors = {
      paper: hexColor(palette?.paper, "#fffef9"),
      ink: hexColor(palette?.ink, "#272b28"),
      accent: hexColor(palette?.accent, "#1f6b4a"),
      onAccent: hexColor(palette?.onAccent, "#fffef9"),
      muted: hexColor(palette?.muted, "#69736b"),
      border: hexColor(palette?.border, "#d5ddd6"),
    };
    const idPrefix = cleanPrefix(prefix || interactPrefix(fields.kind));
    if (fields.kind === "swap") {
      return svgRoot(buildSwapFace(fields, colors, idPrefix, "a") + buildSwapFace(fields, colors, idPrefix, "b"), "220", "0 0 640 220", false);
    }
    if (fields.kind === "expand") return buildExpandSvg(fields, colors, idPrefix);
    return buildRevealSvg(fields, colors, idPrefix);
  }

  function interactCopyHtml(item, palette, prefix) {
    const fields = normalizeInteract(item);
    const ink = hexColor(palette?.ink, "#272b28");
    const size = Math.min(22, Math.max(13, Number(palette?.fontSize) || 16));
    const svg = buildInteractSvg(fields, palette, prefix);
    return `<section ${interactDataAttrs(fields)} style="margin:18px 0 22px;text-align:left;">${svg}<p data-yooco-still="1" style="margin:10px 0 0;padding:0;color:${ink};font-size:${size}px;line-height:1.75;text-align:left;">${escapeXml(fields.still)}</p></section>`;
  }

  function extractInteractFences(source) {
    const text = String(source ?? "").replace(/\r\n?/g, "\n");
    const lines = text.split("\n");
    const fences = [];
    const kept = [];
    let inCode = false;
    let start = -1;
    let startOffset = 0;
    let offset = 0;
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        inCode = !inCode;
        kept.push(line);
      } else if (!inCode && start < 0 && /^:::interact\b/.test(trimmed)) {
        start = kept.length;
        startOffset = offset;
        kept.push(line);
      } else if (start >= 0 && trimmed === ":::") {
        kept.push(line);
        fences.push({ offset: startOffset, markdown: kept.splice(start).join("\n").trim() });
        start = -1;
      } else {
        kept.push(line);
      }
      offset += line.length + 1;
    });
    return {
      source: kept.join("\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
      fences,
      length: text.length,
    };
  }

  function restoreInteractFences(markdown, fences, originalLength) {
    const base = String(markdown || "");
    const list = Array.isArray(fences) ? fences : [];
    if (!list.length) return base.trim();
    const length = Math.max(1, Number(originalLength) || base.length || 1);
    const spots = list.map((fence) => ({
      markdown: String(fence?.markdown || "").trim(),
      at: Math.round(base.length * Math.min(1, Math.max(0, Number(fence?.offset) / length))),
    })).filter((spot) => spot.markdown.startsWith(":::interact") && !base.includes(spot.markdown));
    spots.sort((left, right) => right.at - left.at);
    let result = base;
    spots.forEach((spot) => {
      const cut = Math.min(Math.max(0, spot.at), result.length);
      const forward = result.indexOf("\n\n", cut);
      const back = result.lastIndexOf("\n\n", cut);
      let boundary = result.length;
      if (forward !== -1 && back !== -1) boundary = forward - cut <= cut - back ? forward : back;
      else if (forward !== -1) boundary = forward;
      else if (back !== -1) boundary = back;
      const before = result.slice(0, boundary).trimEnd();
      const after = result.slice(boundary).trimStart();
      result = [before, spot.markdown, after].filter(Boolean).join("\n\n");
    });
    return result.trim();
  }

  function slashCardMarkdown(id) {
    return SNIPPETS[id] || "";
  }

  function cardDomType(id) {
    if (id === "highlight") return "highlightBox";
    if (id === "header") return "header";
    if (id === "quote") return "quote";
    if (id === "divider") return "divider";
    if (id === "media") return "mediaGrid";
    if (id === "points") return "pointGrid";
    if (id === "reveal" || id === "swap" || id === "expand") return "interact";
    return "";
  }

  function lineSlashQuery(line) {
    const match = String(line ?? "").match(/^[ \t]*[/／]([^\n]*)$/);
    if (!match) return null;
    return match[1];
  }

  function insideCodeOrBlock(text, pos) {
    const before = String(text || "").slice(0, pos).split("\n");
    let code = 0;
    let block = 0;
    before.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        code += 1;
        return;
      }
      if (code % 2 === 0 && trimmed.startsWith(":::")) block += 1;
    });
    return code % 2 === 1 || block % 2 === 1;
  }

  function slashQueryAt(source, caret) {
    const text = String(source ?? "");
    const pos = Math.max(0, Math.min(Number(caret) || 0, text.length));
    if (insideCodeOrBlock(text, pos)) return null;
    const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
    const lineEndIdx = text.indexOf("\n", pos);
    const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
    const query = lineSlashQuery(text.slice(lineStart, lineEnd));
    if (query == null) return null;
    return { query, lineStart, lineEnd };
  }

  function filterSlashCards(query) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return SLASH_CARDS.slice();
    return SLASH_CARDS.filter((card) => {
      const hay = [card.id, card.label, card.hint, card.group, ...(card.keywords || [])].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }

  function replaceSlashLine(source, caret, id) {
    const markdown = slashCardMarkdown(id);
    const found = slashQueryAt(source, caret);
    if (!markdown || !found) return null;
    const text = String(source ?? "");
    const next = text.slice(0, found.lineStart) + markdown + text.slice(found.lineEnd);
    return { source: next, caret: found.lineStart + markdown.length };
  }

  function appendSlashCard(source, id) {
    const markdown = slashCardMarkdown(id);
    if (!markdown) return null;
    const text = String(source || "").replace(/\s+$/g, "");
    const next = text ? `${text}\n\n${markdown}` : markdown;
    return { source: next, caret: next.length };
  }

  function readHighlightFence(title, lines) {
    const text = (lines || []).join("\n").trim();
    return {
      type: "highlightBox",
      title: String(title || "重点").trim() || "重点",
      text,
    };
  }

  function readHeaderFence(title, lines) {
    const body = (lines || []).map((line) => String(line).replace(/\s+$/g, ""));
    while (body.length && !body[0].trim()) body.shift();
    while (body.length && !body[body.length - 1].trim()) body.pop();
    const fenceTitle = String(title || "").trim();
    const head = fenceTitle || String(body[0] || "").trim() || "标题";
    const subLines = fenceTitle ? body : body.slice(1);
    return {
      type: "header",
      title: head,
      sub: subLines.map((line) => line.trim()).filter(Boolean).join("\n"),
    };
  }

  function mediaMarkdown(fields) {
    const alt = String(fields?.alt || "").replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();
    const url = String(fields?.url || "").trim().replace(/[\s)]/g, "");
    const text = String(fields?.text || "").trim();
    const image = `![${alt}](${url})`;
    return text ? `:::media\n${image}\n${text}\n:::` : `:::media\n${image}\n:::`;
  }

  function readMediaFence(_title, lines) {
    let alt = "";
    let url = "";
    let sawImage = false;
    const text = [];
    (lines || []).forEach((line) => {
      const trimmed = String(line).trim();
      const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
      if (!sawImage && image) {
        sawImage = true;
        alt = image[1].replace(/\s+/g, " ").trim();
        url = image[2].trim();
        return;
      }
      text.push(line);
    });
    return {
      type: "mediaGrid",
      alt,
      url,
      text: text.join("\n").trim(),
    };
  }

  function pointColumns(lines) {
    const columns = [[]];
    (lines || []).forEach((line) => {
      if (String(line).trim() === "---") {
        columns.push([]);
        return;
      }
      columns[columns.length - 1].push(line);
    });
    return columns;
  }

  function readPointColumn(lines) {
    const rows = (lines || []).map((line) => String(line).trim()).filter(Boolean);
    return {
      title: rows[0] || "",
      text: rows.slice(1).join("\n"),
    };
  }

  function readPointsFence(_title, lines) {
    const columns = pointColumns(lines);
    while (columns.length < 3) columns.push([]);
    return {
      type: "pointGrid",
      items: columns.slice(0, 3).map(readPointColumn),
    };
  }

  function pointsMarkdown(items) {
    const cells = (items || []).slice(0, 3).map((item) => {
      const title = String(item?.title || "").replace(/\s+/g, " ").trim();
      const text = String(item?.text || "").trim();
      return [title, text].filter(Boolean).join("\n");
    });
    while (cells.length < 3) cells.push("");
    return `:::points\n${cells.join("\n---\n")}\n:::`;
  }

  root.YoocoSlashCards = {
    SLASH_CARDS,
    slashCardMarkdown,
    cardDomType,
    lineSlashQuery,
    slashQueryAt,
    filterSlashCards,
    replaceSlashLine,
    appendSlashCard,
    readHighlightFence,
    readHeaderFence,
    mediaMarkdown,
    readMediaFence,
    pointsMarkdown,
    readPointsFence,
    INTERACT_KINDS,
    knownInteractKind,
    readInteractFence,
    interactMarkdown,
    normalizeInteract,
    interactStill,
    interactFromAttrs,
    interactDataAttrs,
    interactPrefix,
    buildInteractSvg,
    interactCopyHtml,
    extractInteractFences,
    restoreInteractFences,
  };
})(globalThis);
