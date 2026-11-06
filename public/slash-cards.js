// 空行敲 / 插入排版块。只产生原文记号，颜色仍走当前主题。
(function (root) {
  const SLASH_CARDS = [
    { id: "quote", label: "引用框", hint: "带标题的引用", keywords: ["引用", "quote"] },
    { id: "highlight", label: "重点框", hint: "用重点底色的提示框", keywords: ["重点", "highlight"] },
    { id: "divider", label: "分割线", hint: "一条分隔", keywords: ["分割", "分隔", "divider"] },
    { id: "header", label: "图文头", hint: "标题、副题和头图槽", keywords: ["图文", "标题", "header"] },
    { id: "media", label: "双栏图文", hint: "一侧图、一侧文", group: "图文栅格", keywords: ["图文", "栅格", "双栏", "图片", "grid"] },
    { id: "points", label: "三列要点", hint: "三列对齐的短要点", group: "图文栅格", keywords: ["要点", "三列", "栅格", "grid"] },
  ];

  const SNIPPETS = {
    quote: "> **引用**：把想引用的话写在这里。",
    highlight: ":::highlight 重点\n把需要强调的话写在这里。\n:::",
    divider: "---",
    header: ":::header\n在这里写标题\n副题可以留空\n:::",
    media: ":::media\n![]()\n:::",
    points: ":::points\n---\n---\n:::",
  };

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
  };
})(globalThis);
