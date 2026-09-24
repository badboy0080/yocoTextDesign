// 内容组件只保存局部展示方式；文章文字和图片仍以原始内容块为准。
(function () {
  const items = [
    { id: "book", label: "书刊开篇", category: "text", hint: "开篇、导语和正文的书刊层次", min: 1, max: 3, softMax: 500 },
    { id: "sidenote", label: "侧注长段", category: "text", hint: "长段正文与可选边注", min: 1, max: 3, softMax: 700 },
    { id: "viewpoint", label: "观点摘录", category: "text", hint: "原文观点与解释", min: 1, max: 3, softMax: 300 },
    { id: "qa", label: "问答对谈", category: "text", hint: "已有问题和回答", min: 2, max: 4, softMax: 700 },
    { id: "hero", label: "大图叙事", category: "image", hint: "一张现有图片与正文", min: 2, max: 4, softMax: 500 },
    { id: "side-by-side", label: "图文并置", category: "image", hint: "一张现有图片与短文", min: 2, max: 3, softMax: 260 },
    { id: "compare", label: "双图对照", category: "image", hint: "两张现有图片与可选结论", min: 2, max: 4, softMax: 220 },
    { id: "steps", label: "步骤图解", category: "image", hint: "原有步骤和对应图片", min: 2, max: 4, softMax: 650 },
  ];

  function clean(value) {
    return String(value || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 100);
  }

  function escape(value) {
    return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function compatibility(id, blocks) {
    const item = items.find((entry) => entry.id === id);
    if (!item || !blocks.length) return "先选择文章中的内容块";
    if (blocks.length < item.min || blocks.length > item.max) return `请选择 ${item.min}–${item.max} 个相邻内容块`;
    const images = blocks.filter((block) => block.type === "image" && block.url);
    const text = blocks.filter((block) => ["paragraph", "lead", "heading", "quote", "card"].includes(block.type));
    if (id === "compare") return images.length === 2 && blocks[0]?.type === "image" && blocks[1]?.type === "image"
      ? "" : "请选择相邻的两张已有图片，结论可放在后面";
    if (id === "steps") return images.length && blocks.some((block) => block.type === "steps") ? "" : "需要原有步骤和至少一张已有图片";
    if (["hero", "side-by-side"].includes(id)) return images.length === 1 && blocks[0]?.type === "image" && text.length
      ? "" : "请先选一张已有图片，再选相邻文字";
    if (blocks.some((block) => ["image", "divider", "code", "stat", "list", "steps"].includes(block.type))) return "仅支持文字段落、标题或引用";
    if (id === "qa") {
      const question = String(blocks[0]?.text || "").trim();
      return /[？?]$/.test(question) || /^(问|Q[：:])/i.test(question) ? "" : "第一段需要是原文中的问题";
    }
    if (id === "book" && !blocks.some((block) => ["paragraph", "lead"].includes(block.type))) return "需要一段正文或导语";
    return text.length ? "" : "需要至少一段文字";
  }

  function render(id, parts, blocks, meta, palette, mode = "preview") {
    const item = items.find((entry) => entry.id === id);
    if (!item) return parts.join("");
    const html = parts.join("");
    const label = escape(meta?.label);
    const note = escape(meta?.note);
    const decoration = label ? `<div class="cc-decoration" contenteditable="false">${label}</div>` : "";
    const annotation = note ? `<p class="cc-note" contenteditable="false">${note}</p>` : "";
    if (mode === "preview") {
      return `<section class="content-component cc-${id}" data-component="${id}" aria-label="${item.label}">${decoration}<div class="cc-content">${html}</div>${annotation}</section>`;
    }
    const accent = palette.accentColor;
    const text = palette.textColor;
    const muted = palette.mutedColor || text;
    const border = palette.borderColor || accent;
    const card = palette.cardColor;
    const frame = {
      book: `border-top:2px solid ${accent};padding:20px 0 12px;`,
      sidenote: `border-left:3px solid ${accent};padding:8px 0 8px 18px;`,
      viewpoint: `background-color:${card};padding:20px 22px;border-radius:4px;`,
      qa: `border-top:1px solid ${border};border-bottom:1px solid ${border};padding:18px 0;`,
      hero: `border-top:2px solid ${accent};padding:16px 0;`,
      "side-by-side": `border:1px solid ${border};padding:16px;`,
      compare: `border-top:1px solid ${border};padding:16px 0;`,
      steps: `border-left:3px solid ${accent};padding:12px 0 12px 18px;`,
    }[id];
    const labelHtml = label ? `<p style="margin:0 0 12px;color:${accent};font-size:11px;font-weight:800;letter-spacing:.14em;">${label}</p>` : "";
    const noteHtml = note ? `<p style="margin:12px 0 0;color:${muted};font-size:12px;line-height:1.6;">${note}</p>` : "";
    const restyle = (part, css) => part.replace(/style="([^"]*)"/, (_, current) => `style="${current}${css}"`);
    let arranged = html;
    if (id === "book") {
      arranged = parts.map((part, index) => restyle(part, `${blocks[index]?.type === "heading" ? "" : "line-height:1.95;text-indent:2em;"}overflow-wrap:anywhere;`)).join("");
    } else if (id === "sidenote") {
      arranged = parts.map((part) => restyle(part, "line-height:1.9;overflow-wrap:anywhere;")).join("");
    } else if (id === "viewpoint") {
      arranged = parts.map((part, index) => `<section style="${index ? `margin-top:12px;color:${muted};font-weight:400;` : `color:${accent};font-weight:700;`}">${restyle(part, index ? `color:${muted};font-weight:400;` : `color:${accent};font-weight:700;`)}</section>`).join("");
    } else if (id === "qa") {
      arranged = parts.map((part, index) => `<section style="margin:${index ? "12px" : "0"} 0 0;padding:6px 14px;border-left:${index ? "1px" : "3px"} solid ${index ? border : accent};${index ? "" : `background-color:${card};`}">${part}</section>`).join("");
    } else if (id === "side-by-side") {
      arranged = `<section style="width:100%;"><section style="display:inline-block;box-sizing:border-box;width:49%;min-width:280px;max-width:100%;padding-right:3%;vertical-align:top;">${parts[0]}</section><section style="display:inline-block;box-sizing:border-box;width:49%;min-width:280px;max-width:100%;vertical-align:top;">${parts.slice(1).join("")}</section></section>`;
    } else if (id === "compare") {
      arranged = `<section style="width:100%;"><section style="display:inline-block;box-sizing:border-box;width:49%;min-width:280px;max-width:100%;padding-right:2%;vertical-align:top;">${parts[0]}</section><section style="display:inline-block;box-sizing:border-box;width:49%;min-width:280px;max-width:100%;vertical-align:top;">${parts[1]}</section></section>${parts.slice(2).join("")}`;
    } else if (id === "steps") {
      arranged = parts.map((part, index) => `<section style="${index ? `padding-top:12px;border-top:1px solid ${border};` : ""}">${part}</section>`).join("");
    }
    return `<section style="margin:22px 0 28px;color:${text};${frame}">${labelHtml}${arranged}${noteHtml}</section>`;
  }

  window.YoocoContentComponents = { items, compatibility, render, clean, escape };
})();
